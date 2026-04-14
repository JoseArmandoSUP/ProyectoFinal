const pool = require('../config/db');

const registrarVenta = async (req, res) => {
  const conn = await pool.getConnection(); // requiere mysql2 pool
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

    res.status(201).json({
      exito: true,
      msg: 'Venta registrada exitosamente',
      id_venta: venta_id,
      total_venta: total
    });
  } catch (error) {
    try { await conn.rollback(); } catch (_) {}

    // Si el trigger de stock falla, normalmente llega como error 1644 (SIGNAL)
    res.status(500).json({
      exito: false,
      msg: 'Error en el servidor al Registrar Venta',
      error: error.message
    });
  } finally {
    conn.release();
  }
};

// -----------------------------------------------------------------------------
// REPORTES / CONSULTAS relacionadas a CLIENTE (usando VENTAS)
// -----------------------------------------------------------------------------

/**
 * Consulta #3 de tu script:
 * CLIENTES CON COMPRAS SUPERIORES AL PROMEDIO
 *
 * GET /ventas/clientes/compras/superiores-promedio
 */
const clientesComprasSuperioresPromedio = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.id_cliente, c.nombre, SUM(v.total) AS compras_hechas
      FROM clientes c
      JOIN ventas v ON c.id_cliente = v.cliente_id
      GROUP BY c.id_cliente, c.nombre
      HAVING compras_hechas > (SELECT AVG(total) FROM ventas)
    `);

    res.json({ exito: true, datos: rows });
  } catch (error) {
    res.status(500).json({
      exito: false,
      msg: 'Error en el servidor en Clientes con compras superiores al promedio',
      error: error.message
    });
  }
};

/**
 * Consulta #6 de tu script:
 * CLIENTES CON CLASIFICACION (función clasificacion_cliente)
 *
 * GET /ventas/clientes/clasificacion
 */
const obtenerClientesConClasificacion = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id_cliente, nombre, clasificacion_cliente(id_cliente) AS tipo_cliente
      FROM clientes
    `);

    res.json({ exito: true, datos: rows });
  } catch (error) {
    res.status(500).json({
      exito: false,
      msg: 'Error en el servidor en Obtener Clientes con Clasificación',
      error: error.message
    });
  }
};

/**
 * Procedimiento: historial_cliente(p_cliente_id)
 *
 * GET /ventas/clientes/:id_cliente/historial
 */
const obtenerHistorialCliente = async (req, res) => {
  try {
    const id_cliente = parseInt(req.params.id_cliente, 10);

    if (!Number.isInteger(id_cliente) || id_cliente <= 0) {
      return res.status(400).json({ exito: false, msg: 'id_cliente inválido' });
    }

    const [resultSets] = await pool.query('CALL historial_cliente(?)', [id_cliente]);
    const datos = Array.isArray(resultSets) ? (resultSets[0] || []) : [];

    res.json({ exito: true, datos });
  } catch (error) {
    res.status(500).json({
      exito: false,
      msg: 'Error en el servidor en Historial de Cliente',
      error: error.message
    });
  }
};

module.exports = {
  registrarVenta,
  clientesComprasSuperioresPromedio,
  obtenerClientesConClasificacion,
  obtenerHistorialCliente
};