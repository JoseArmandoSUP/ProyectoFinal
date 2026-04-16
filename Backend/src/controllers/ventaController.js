// Ya NO uses el pool global aquí
// const pool = require('../config/db');

const getDb = (req) => {
  if (!req.db) throw new Error('DB no inicializada en req.db (falta withDbRole en la ruta)');
  return req.db;
};

const registrarVenta = async (req, res) => {
  // IMPORTANTE: para transacciones necesitamos una conexión, no solo db.query
  const db = getDb(req);
  const conn = await db.getConnection(); // db debe ser un pool mysql2/promise
  try {
    const cliente_id = req.body.cliente_id;
    const empleado_id = req.body.empleado_id;
    const sucursal_id = req.body.sucursal_id;
    const productos = req.body.productos;

    if (!cliente_id || !empleado_id || !sucursal_id) {
      return res.status(400).json({ exito: false, msg: 'cliente_id, empleado_id y sucursal_id son requeridos' });
    }
    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ exito: false, msg: 'productos debe ser un arreglo con al menos 1 producto' });
    }

    await conn.beginTransaction();

    let total = 0;

    // Insertar venta con total=0 (se recalcula al final)
    const [resultado] = await conn.query(
      'INSERT INTO ventas (total, cliente_id, empleado_id, sucursal_id) VALUES (0, ?, ?, ?)',
      [cliente_id, empleado_id, sucursal_id]
    );

    const venta_id = resultado.insertId;

    for (const prod of productos) {
      if (!prod.producto_id || !prod.cantidad || !prod.precio) {
        await conn.rollback();
        return res.status(400).json({ exito: false, msg: 'Cada producto debe incluir producto_id, cantidad y precio' });
      }

      const subtotal = Number(prod.cantidad) * Number(prod.precio);
      total += subtotal;

      // Insertar detalle (si no hay stock, tu trigger lanza error y se hace rollback)
      await conn.query(
        'INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)',
        [venta_id, prod.producto_id, prod.cantidad, prod.precio, subtotal]
      );

      // Actualizar stock
      await conn.query(
        'UPDATE productos SET stock = stock - ? WHERE id_producto = ?',
        [prod.cantidad, prod.producto_id]
      );
    }

    // Actualizar total venta
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

    return res.status(500).json({
      exito: false,
      msg: 'Error en el servidor al Registrar Venta',
      error: error.message
    });
  } finally {
    try { conn.release(); } catch (_) {}
  }
};

// -----------------------------------------------------------------------------
// REPORTES / CONSULTAS relacionadas a CLIENTE (usando VENTAS)
// -----------------------------------------------------------------------------

// GET /api/venta/clientes/compras/superiores-promedio
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
      error: error.message
    });
  }
};

// GET /api/venta/clientes/clasificacion
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
      error: error.message
    });
  }
};

// GET /api/venta/clientes/:id_cliente/historial
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
      error: error.message
    });
  }
};

// -----------------------------------------------------------------------------
// REPORTES / CONSULTAS relacionadas a VENTAS
// -----------------------------------------------------------------------------

// GET /api/venta/reportes/ventas-total-calculado
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
      error: error.message
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