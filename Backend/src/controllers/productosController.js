// Ya NO uses el pool global aquí
// const pool = require('../config/db');

const getDb = (req) => {
  if (!req.db) throw new Error('DB no inicializada en req.db (falta withDbRole en la ruta)');
  return req.db;
};

/**
 * GET /productos
 */
const obtenerProductos = async (req, res) => {
  try {
    const db = getDb(req);
    const [resultado] = await db.query('SELECT * FROM productos');
    return res.json({ exito: true, datos: resultado });
  } catch (error) {
    return res.status(500).json({
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
    const db = getDb(req);

    const nombre = req.body.nombre;
    const descripcion = req.body.descripcion;
    const precio = req.body.precio;
    const stock = req.body.stock;
    const stock_minimo = req.body.stock_minimo;

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

    const [resultado] = await db.query(
      'INSERT INTO productos (nombre, descripcion, precio, stock, stock_minimo) VALUES (?, ?, ?, ?, ?)',
      [nombre, descripcion, precio, stock, stock_minimo]
    );

    return res.status(201).json({
      exito: true,
      msg: 'Producto agregado correctamente',
      id_producto: resultado.insertId
    });
  } catch (error) {
    return res.status(500).json({
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
    const db = getDb(req);

    const id_producto = parseInt(req.params.id_producto, 10);
    const nombre = req.body.nombre;
    const precio = req.body.precio;
    const stock = req.body.stock;

    if (!Number.isInteger(id_producto) || id_producto <= 0) {
      return res.status(400).json({ exito: false, msg: 'id_producto inválido' });
    }

    if (nombre !== undefined && String(nombre).trim().length === 0) {
      return res.status(400).json({ exito: false, msg: 'nombre inválido' });
    }
    if (precio !== undefined && Number(precio) <= 0) {
      return res.status(400).json({ exito: false, msg: 'precio debe ser > 0' });
    }
    if (stock !== undefined && Number(stock) < 0) {
      return res.status(400).json({ exito: false, msg: 'stock debe ser >= 0' });
    }

    const [resultado] = await db.query(
      'UPDATE productos SET nombre=?, precio=?, stock=? WHERE id_producto=?',
      [nombre, precio, stock, id_producto]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ exito: false, msg: 'Producto no encontrado' });
    }

    return res.status(200).json({
      exito: true,
      datos: resultado,
      msg: 'Producto editado correctamente'
    });
  } catch (error) {
    return res.status(500).json({
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
    const db = getDb(req);

    const id_producto = parseInt(req.params.id_producto, 10);
    if (!Number.isInteger(id_producto) || id_producto <= 0) {
      return res.status(400).json({ exito: false, msg: 'id_producto inválido' });
    }

    const [resultado] = await db.query(
      'DELETE FROM productos WHERE id_producto = ?',
      [id_producto]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ exito: false, msg: 'Producto no encontrado' });
    }

    return res.status(200).json({
      exito: true,
      msg: 'Producto eliminado correctamente',
      id_producto
    });
  } catch (error) {
    return res.status(500).json({
      exito: false,
      msg: 'Error al eliminar producto',
      error: error.message
    });
  }
};

/**
 * GET /productos/stock-bajo
 */
const obtenerProductosStockBajo = async (req, res) => {
  try {
    const db = getDb(req);

    const [rows] = await db.query(`
      SELECT id_producto, nombre, stock, stock_minimo
      FROM productos
      WHERE stock <= stock_minimo
      ORDER BY stock ASC
    `);

    return res.json({ exito: true, datos: rows });
  } catch (error) {
    return res.status(500).json({
      exito: false,
      msg: 'Error en el servidor en Obtener Productos Stock Bajo',
      error: error.message
    });
  }
};

/**
 * GET /productos/mas-vendidos
 */
const obtenerProductosMasVendidos = async (req, res) => {
  try {
    const db = getDb(req);

    const [rows] = await db.query(`
      SELECT p.id_producto, p.nombre, SUM(dv.cantidad) AS total_vendido
      FROM productos p
      JOIN detalle_ventas dv ON p.id_producto = dv.producto_id
      GROUP BY p.id_producto, p.nombre
      ORDER BY total_vendido DESC
    `);

    return res.json({ exito: true, datos: rows });
  } catch (error) {
    return res.status(500).json({
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