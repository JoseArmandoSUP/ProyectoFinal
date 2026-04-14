const pool = require('../config/db');

/**
 * GET /productos
 */
const obtenerProductos = async (req, res) => {
  try {
    const [resultado] = await pool.query('SELECT * FROM productos');
    res.json({
      exito: true,
      datos: resultado
    });
  } catch (error) {
    res.status(500).json({
      exito: false,
      msg: 'Error en el servidor en Obtener Productos',
      error: error.message
    });
  }
};

/**
 * POST /productos
 */
const agregarProductos = async (req, res) => {
  try {
    const nombre = req.body.nombre;
    const descripcion = req.body.descripcion;
    const precio = req.body.precio;
    const stock = req.body.stock;
    const stock_minimo = req.body.stock_minimo;

    // Validación básica (por tus CHECK en BD: precio > 0, stock >= 0)
    if (!nombre || !descripcion) {
      return res.status(400).json({ exito: false, msg: 'nombre y descripcion son requeridos' });
    }
    if (precio === undefined || Number(precio) <= 0) {
      return res.status(400).json({ exito: false, msg: 'precio debe ser > 0' });
    }
    if (stock === undefined || Number(stock) < 0) {
      return res.status(400).json({ exito: false, msg: 'stock debe ser >= 0' });
    }
    if (stock_minimo === undefined || Number(stock_minimo) < 0) {
      return res.status(400).json({ exito: false, msg: 'stock_minimo debe ser >= 0' });
    }

    const [resultado] = await pool.query(
      'INSERT INTO productos (nombre, descripcion, precio, stock, stock_minimo) VALUES (?, ?, ?, ?, ?)',
      [nombre, descripcion, precio, stock, stock_minimo]
    );

    res.status(201).json({
      exito: true,
      msg: 'Producto agregado correctamente',
      id_producto: resultado.insertId
    });
  } catch (error) {
    res.status(500).json({
      exito: false,
      msg: 'Error en el servidor al Agregar Productos',
      error: error.message
    });
  }
};

/**
 * PUT /productos/:id_producto
 */
const editarProducto = async (req, res) => {
  try {
    const id_producto = parseInt(req.params.id_producto, 10);
    const nombre = req.body.nombre;
    const precio = req.body.precio;
    const stock = req.body.stock;

    if (!Number.isInteger(id_producto) || id_producto <= 0) {
      return res.status(400).json({ exito: false, msg: 'id_producto inválido' });
    }

    // Validación básica
    if (nombre !== undefined && String(nombre).trim().length === 0) {
      return res.status(400).json({ exito: false, msg: 'nombre inválido' });
    }
    if (precio !== undefined && Number(precio) <= 0) {
      return res.status(400).json({ exito: false, msg: 'precio debe ser > 0' });
    }
    if (stock !== undefined && Number(stock) < 0) {
      return res.status(400).json({ exito: false, msg: 'stock debe ser >= 0' });
    }

    const [resultado] = await pool.query(
      'UPDATE productos SET nombre=?, precio=?, stock=? WHERE id_producto=?',
      [nombre, precio, stock, id_producto]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ exito: false, msg: 'Producto no encontrado' });
    }

    res.status(200).json({
      exito: true,
      datos: resultado,
      msg: 'Producto editado correctamente'
    });
  } catch (error) {
    res.status(500).json({
      exito: false,
      msg: 'Error al editar producto',
      error: error.message
    });
  }
};

/**
 * DELETE /productos/:id_producto
 */
const borrarProducto = async (req, res) => {
  try {
    const id_producto = parseInt(req.params.id_producto, 10);

    if (!Number.isInteger(id_producto) || id_producto <= 0) {
      return res.status(400).json({ exito: false, msg: 'id_producto inválido' });
    }

    const [resultado] = await pool.query(
      'DELETE FROM productos WHERE id_producto = ?',
      [id_producto]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ exito: false, msg: 'Producto no encontrado' });
    }

    res.status(200).json({
      exito: true,
      msg: 'Producto eliminado correctamente',
      id_producto
    });
  } catch (error) {
    res.status(500).json({
      exito: false,
      msg: 'Error al eliminar producto',
      error: error.message
    });
  }
};

// -----------------------------------------------------------------------------
// ENDPOINTS EXTRA basados en tu BD / lógica de inventario
// -----------------------------------------------------------------------------

/**
 * Productos con stock bajo (stock <= stock_minimo)
 * GET /productos/stock-bajo
 */
const obtenerProductosStockBajo = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id_producto, nombre, stock, stock_minimo
      FROM productos
      WHERE stock <= stock_minimo
      ORDER BY stock ASC
    `);

    res.json({ exito: true, datos: rows });
  } catch (error) {
    res.status(500).json({
      exito: false,
      msg: 'Error en el servidor en Obtener Productos Stock Bajo',
      error: error.message
    });
  }
};

/**
 * Productos más vendidos (consulta #2 de tu script)
 * GET /productos/mas-vendidos
 */
const obtenerProductosMasVendidos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id_producto, p.nombre, SUM(dv.cantidad) AS total_vendido
      FROM productos p
      JOIN detalle_ventas dv ON p.id_producto = dv.producto_id
      GROUP BY p.id_producto, p.nombre
      ORDER BY total_vendido DESC
    `);

    res.json({ exito: true, datos: rows });
  } catch (error) {
    res.status(500).json({
      exito: false,
      msg: 'Error en el servidor en Obtener Productos Más Vendidos',
      error: error.message
    });
  }
};

module.exports = {
  obtenerProductos,
  agregarProductos,
  editarProducto,
  borrarProducto,
  obtenerProductosStockBajo,
  obtenerProductosMasVendidos
};