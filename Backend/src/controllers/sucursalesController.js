// const pool = require('../config/db');

const getDb = (req) => {
  if (!req.db) throw new Error('DB no inicializada en req.db (falta withDbRole en la ruta)');
  return req.db;
};


// GET /api/sucursales
const getSucursales = async (req, res) => {
  try {
    const db = getDb(req);
    const [rows] = await db.query(`
      SELECT id_sucursal, nombre, ciudad, direccion, telefono
      FROM sucursales
      ORDER BY id_sucursal ASC
    `);
    return res.json({ exito: true, datos: rows });
  } catch (err) {
    return res.status(500).json({ exito: false, msg: 'Error al obtener sucursales', error: err.message });
  }
};

// GET /api/sucursales/:id
const getSucursalById = async (req, res) => {
  try {
    const db = getDb(req);
    const { id } = req.params;

    const [rows] = await db.query(`
      SELECT id_sucursal, nombre, ciudad, direccion, telefono
      FROM sucursales
      WHERE id_sucursal = ?
    `, [id]);

    if (!rows.length) return res.status(404).json({ exito: false, msg: 'Sucursal no encontrada' });
    return res.json({ exito: true, datos: rows[0] });
  } catch (err) {
    return res.status(500).json({ exito: false, msg: 'Error al obtener sucursal', error: err.message });
  }
};

// POST /api/sucursales
const createSucursal = async (req, res) => {
  try {
    const db = getDb(req);
    const { nombre, ciudad, direccion, telefono } = req.body;

    if (!nombre || !ciudad || !direccion || !telefono) {
      return res.status(400).json({ exito: false, msg: 'Faltan campos: nombre, ciudad, direccion, telefono' });
    }

    const [result] = await db.query(
      `INSERT INTO sucursales (nombre, ciudad, direccion, telefono)
       VALUES (?, ?, ?, ?)`,
      [nombre, ciudad, direccion, telefono]
    );

    return res.status(201).json({ exito: true, msg: 'Sucursal creada', id_sucursal: result.insertId });
  } catch (err) {
    return res.status(500).json({ exito: false, msg: 'Error al crear sucursal', error: err.message });
  }
};

// PUT /api/sucursales/:id
const updateSucursal = async (req, res) => {
  try {
    const db = getDb(req);
    const { id } = req.params;
    const { nombre, ciudad, direccion, telefono } = req.body;

    const fields = [];
    const values = [];

    if (nombre !== undefined) { fields.push('nombre = ?'); values.push(nombre); }
    if (ciudad !== undefined) { fields.push('ciudad = ?'); values.push(ciudad); }
    if (direccion !== undefined) { fields.push('direccion = ?'); values.push(direccion); }
    if (telefono !== undefined) { fields.push('telefono = ?'); values.push(telefono); }

    if (!fields.length) return res.status(400).json({ exito: false, msg: 'No enviaste campos para actualizar' });

    values.push(id);

    const [result] = await db.query(
      `UPDATE sucursales SET ${fields.join(', ')} WHERE id_sucursal = ?`,
      values
    );

    if (result.affectedRows === 0) return res.status(404).json({ exito: false, msg: 'Sucursal no encontrada' });

    return res.json({ exito: true, msg: 'Sucursal actualizada' });
  } catch (err) {
    return res.status(500).json({ exito: false, msg: 'Error al actualizar sucursal', error: err.message });
  }
};

// DELETE /api/sucursales/:id
const deleteSucursal = async (req, res) => {
  try {
    const db = getDb(req);
    const { id } = req.params;

    const [result] = await db.query(
      `DELETE FROM sucursales WHERE id_sucursal = ?`,
      [id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ exito: false, msg: 'Sucursal no encontrada' });

    return res.json({ exito: true, msg: 'Sucursal eliminada' });
  } catch (err) {
    return res.status(500).json({ exito: false, msg: 'Error al eliminar sucursal', error: err.message });
  }
};

// CONSULTAS / REPORTES

// GET /api/sucursales/reportes/mayores-ingresos
const getSucursalesMayoresIngresos = async (req, res) => {
  try {
    const db = getDb(req);

    const sql = `
      SELECT
        s.id_sucursal,
        s.nombre,
        SUM(v.total) AS ingresos
      FROM sucursales s
      JOIN ventas v ON s.id_sucursal = v.sucursal_id
      GROUP BY s.id_sucursal, s.nombre
      ORDER BY ingresos DESC
    `;
    const [rows] = await db.query(sql);
    return res.json({ exito: true, datos: rows });
  } catch (err) {
    return res.status(500).json({ exito: false, msg: 'Error al obtener sucursales con mayores ingresos', error: err.message });
  }
};

// GET /api/sucursales/reportes/ventas-por-sucursal-vista
const getVentasPorSucursalVista = async (req, res) => {
  try {
    const db = getDb(req);
    const [rows] = await db.query(`SELECT * FROM ventas_por_sucursal ORDER BY monto_total DESC`);
    return res.json({ exito: true, datos: rows });
  } catch (err) {
    return res.status(500).json({ exito: false, msg: 'Error al obtener ventas_por_sucursal (vista)', error: err.message });
  }
};

module.exports = {
  getSucursales,
  getSucursalById,
  createSucursal,
  updateSucursal,
  deleteSucursal,
  getSucursalesMayoresIngresos,
  getVentasPorSucursalVista
};