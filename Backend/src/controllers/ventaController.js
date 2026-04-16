const getDb = (req) => {
  if (!req.db) throw new Error('DB no inicializada en req.db (falta withDbRole en la ruta)');
  return req.db;
};

// Obtiene conexión para transacción tanto si req.db es pool como si es connection
const getConn = async (db) => {
  // Pool mysql2/promise tiene getConnection()
  if (typeof db.getConnection === 'function') return db.getConnection();
  // Si ya pasaron una conexión, se usa igual
  if (typeof db.beginTransaction === 'function' && typeof db.query === 'function') return db;
  throw new Error('req.db no es un pool/connection compatible con mysql2/promise');
};

const registrarVenta = async (req, res) => {
  const db = getDb(req);
  const conn = await getConn(db);

  const {
    cliente_id,
    empleado_id,
    sucursal_id,
    productos
  } = req.body ?? {};

  try {
    // Validaciones básicas
    if (!Number.isInteger(+cliente_id) || +cliente_id <= 0 ||
        !Number.isInteger(+empleado_id) || +empleado_id <= 0 ||
        !Number.isInteger(+sucursal_id) || +sucursal_id <= 0) {
      return res.status(400).json({
        exito: false,
        msg: 'cliente_id, empleado_id y sucursal_id deben ser números enteros > 0'
      });
    }

    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({
        exito: false,
        msg: 'productos debe ser un arreglo con al menos 1 producto'
      });
    }

    // Validar productos ANTES de iniciar transacción
    for (const [i, p] of productos.entries()) {
      const producto_id = +p.producto_id;
      const cantidad = +p.cantidad;
      const precio = +p.precio;

      if (!Number.isInteger(producto_id) || producto_id <= 0) {
        return res.status(400).json({ exito: false, msg: `producto_id inválido en item #${i + 1}` });
      }
      if (!Number.isFinite(cantidad) || cantidad <= 0) {
        return res.status(400).json({ exito: false, msg: `cantidad inválida en item #${i + 1}` });
      }
      if (!Number.isFinite(precio) || precio <= 0) {
        return res.status(400).json({ exito: false, msg: `precio inválido en item #${i + 1}` });
      }
    }

    await conn.beginTransaction();

    // Crear venta con total=0 (se actualiza al final)
    const [rVenta] = await conn.query(
      'INSERT INTO ventas (total, cliente_id, empleado_id, sucursal_id) VALUES (0, ?, ?, ?)',
      [+cliente_id, +empleado_id, +sucursal_id]
    );

    const venta_id = rVenta.insertId;

    let total = 0;

    for (const p of productos) {
      const producto_id = +p.producto_id;
      const cantidad = +p.cantidad;
      const precio = +p.precio;

      const subtotal = Number((cantidad * precio).toFixed(2));
      total = Number((total + subtotal).toFixed(2));

      // Insertar detalle
      await conn.query(
        `INSERT INTO detalle_ventas
         (venta_id, producto_id, cantidad, precio_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [venta_id, producto_id, cantidad, precio, subtotal]
      );

      // Actualizar stock (AJUSTA el nombre de la PK si no es id_producto)
      const [rUpd] = await conn.query(
        'UPDATE productos SET stock = stock - ? WHERE id_producto = ?',
        [cantidad, producto_id]
      );

      // Si no encontró el producto, hace rollback
      if (rUpd.affectedRows === 0) {
        throw new Error(`No existe el producto con id ${producto_id} (no se actualizó stock)`);
      }
    }

    // Actualizar total
    await conn.query(
      'UPDATE ventas SET total = ? WHERE id_venta = ?',
      [total, venta_id]
    );

    await conn.commit();

    return res.status(201).json({
      exito: true,
      msg: 'Venta registrada exitosamente',
      id_venta: venta_id,
      total_venta: total
    });
  } catch (error) {
    try { await conn.rollback(); } catch (_) {}

    // Devuelve también code/sqlMessage si viene de MySQL (mysql2)
    return res.status(500).json({
      exito: false,
      msg: 'Error en el servidor al Registrar Venta',
      error: error?.code || error?.message || String(error),
      sqlMessage: error?.sqlMessage
    });
  } finally {
    // Si conn viene de pool, tiene release(). Si es connection directa, no.
    try { if (typeof conn.release === 'function') conn.release(); } catch (_) {}
  }
};

// --- REPORTES ---

const clientesComprasSuperioresPromedio = async (req, res) => {
  try {
    const db = getDb(req);
    const [rows] = await db.query(`
      SELECT c.id_cliente, c.nombre, SUM(v.total) AS compras_hechas
      FROM clientes c
      JOIN ventas v ON c.id_cliente = v.cliente_id
      GROUP BY c.id_cliente, c.nombre
      HAVING compras_hechas > (SELECT AVG(total) FROM ventas)
    `);
    return res.json({ exito: true, datos: rows });
  } catch (error) {
    return res.status(500).json({
      exito: false,
      msg: 'Error en el servidor en Clientes con compras superiores al promedio',
      error: error?.message || String(error)
    });
  }
};

const obtenerClientesConClasificacion = async (req, res) => {
  try {
    const db = getDb(req);
    const [rows] = await db.query(`
      SELECT id_cliente, nombre, clasificacion_cliente(id_cliente) AS tipo_cliente
      FROM clientes
    `);
    return res.json({ exito: true, datos: rows });
  } catch (error) {
    return res.status(500).json({
      exito: false,
      msg: 'Error en el servidor en Obtener Clientes con Clasificación',
      error: error?.message || String(error)
    });
  }
};

const obtenerHistorialCliente = async (req, res) => {
  try {
    const db = getDb(req);
    const id_cliente = parseInt(req.params.id_cliente, 10);

    if (!Number.isInteger(id_cliente) || id_cliente <= 0) {
      return res.status(400).json({ exito: false, msg: 'id_cliente inválido' });
    }

    const [resultSets] = await db.query('CALL historial_cliente(?)', [id_cliente]);
    const datos = Array.isArray(resultSets) ? (resultSets[0] || []) : [];

    return res.json({ exito: true, datos });
  } catch (error) {
    return res.status(500).json({
      exito: false,
      msg: 'Error en el servidor en Historial de Cliente',
      error: error?.message || String(error)
    });
  }
};

const ventasTotalCalculado = async (req, res) => {
  try {
    const db = getDb(req);
    const [rows] = await db.query(`
      SELECT
        v.id_venta,
        v.total AS total_guardado,
        calcular_total_venta(v.id_venta) AS total_calculado
      FROM ventas v
      ORDER BY v.id_venta ASC
    `);
    return res.json({ exito: true, datos: rows });
  } catch (error) {
    return res.status(500).json({
      exito: false,
      msg: 'Error en el servidor en Ventas con total calculado',
      error: error?.message || String(error)
    });
  }
};

module.exports = {
  registrarVenta,
  clientesComprasSuperioresPromedio,
  obtenerClientesConClasificacion,
  obtenerHistorialCliente,
  ventasTotalCalculado
};