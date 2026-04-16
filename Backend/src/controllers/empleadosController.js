// const pool = require('../config/db');

const getDb = (req) => {
  if (!req.db) throw new Error('DB no inicializada en req.db (falta withDbRole en la ruta)');
  return req.db;
};

// GET /api/empleados
const getEmpleados = async (req, res) => {
  try {
    const db = getDb(req);
    const sql = `
      SELECT id_empleado, nombre, apellido_p, apellido_m, salario, fecha_contratacion, sucursal_id
      FROM empleados
      ORDER BY id_empleado ASC
    `;
    const [rows] = await db.query(sql);
    return res.json({ exito: true, datos: rows });
  } catch (err) {
    return res.status(500).json({ exito: false, msg: 'Error al obtener empleados', error: err.message });
  }
};

// GET /api/empleados/:id
const getEmpleadoById = async (req, res) => {
  try {
    const db = getDb(req);
    const { id } = req.params;

    const sql = `
      SELECT id_empleado, nombre, apellido_p, apellido_m, salario, fecha_contratacion, sucursal_id
      FROM empleados
      WHERE id_empleado = ?
    `;
    const [rows] = await db.query(sql, [id]);

    if (!rows.length) {
      return res.status(404).json({ exito: false, msg: 'Empleado no encontrado' });
    }
    return res.json({ exito: true, datos: rows[0] });
  } catch (err) {
    return res.status(500).json({ exito: false, msg: 'Error al obtener empleado', error: err.message });
  }
};

// GET /api/empleados/sucursal/:sucursal_id
const getEmpleadosBySucursal = async (req, res) => {
  try {
    const db = getDb(req);
    const { sucursal_id } = req.params;

    const sql = `
      SELECT id_empleado, nombre, apellido_p, apellido_m, salario, fecha_contratacion, sucursal_id
      FROM empleados
      WHERE sucursal_id = ?
      ORDER BY id_empleado ASC
    `;
    const [rows] = await db.query(sql, [sucursal_id]);
    return res.json({ exito: true, datos: rows });
  } catch (err) {
    return res.status(500).json({ exito: false, msg: 'Error al obtener empleados por sucursal', error: err.message });
  }
};

// POST /api/empleados
const createEmpleado = async (req, res) => {
  try {
    const db = getDb(req);
    const { nombre, apellido_p, apellido_m, salario, fecha_contratacion, sucursal_id } = req.body;

    if (!nombre || !apellido_p || !apellido_m) {
      return res.status(400).json({ exito: false, msg: 'Faltan campos: nombre, apellido_p, apellido_m' });
    }
    if (salario === undefined || salario === null || Number.isNaN(Number(salario)) || Number(salario) < 0) {
      return res.status(400).json({ exito: false, msg: 'salario inválido' });
    }
    if (!fecha_contratacion) {
      return res.status(400).json({ exito: false, msg: 'fecha_contratacion es requerida (YYYY-MM-DD)' });
    }
    if (!sucursal_id || Number(sucursal_id) <= 0) {
      return res.status(400).json({ exito: false, msg: 'sucursal_id inválido' });
    }

    const sql = `
      INSERT INTO empleados (nombre, apellido_p, apellido_m, salario, fecha_contratacion, sucursal_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [nombre, apellido_p, apellido_m, Number(salario), fecha_contratacion, Number(sucursal_id)];

    const [result] = await db.query(sql, params);
    return res.status(201).json({ exito: true, msg: 'Empleado creado', id_empleado: result.insertId });
  } catch (err) {
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ exito: false, msg: 'sucursal_id no existe (FK)', error: err.message });
    }
    return res.status(500).json({ exito: false, msg: 'Error al crear empleado', error: err.message });
  }
};

// PUT /api/empleados/:id
const updateEmpleado = async (req, res) => {
  try {
    const db = getDb(req);
    const { id } = req.params;
    const { nombre, apellido_p, apellido_m, salario, fecha_contratacion, sucursal_id } = req.body;

    const fields = [];
    const values = [];

    if (nombre !== undefined) { fields.push('nombre = ?'); values.push(nombre); }
    if (apellido_p !== undefined) { fields.push('apellido_p = ?'); values.push(apellido_p); }
    if (apellido_m !== undefined) { fields.push('apellido_m = ?'); values.push(apellido_m); }
    if (salario !== undefined) {
      if (Number.isNaN(Number(salario)) || Number(salario) < 0) {
        return res.status(400).json({ exito: false, msg: 'salario inválido' });
      }
      fields.push('salario = ?');
      values.push(Number(salario));
    }
    if (fecha_contratacion !== undefined) { fields.push('fecha_contratacion = ?'); values.push(fecha_contratacion); }
    if (sucursal_id !== undefined) {
      if (Number(sucursal_id) <= 0) return res.status(400).json({ exito: false, msg: 'sucursal_id inválido' });
      fields.push('sucursal_id = ?');
      values.push(Number(sucursal_id));
    }

    if (!fields.length) {
      return res.status(400).json({ exito: false, msg: 'No enviaste campos para actualizar' });
    }

    const sql = `UPDATE empleados SET ${fields.join(', ')} WHERE id_empleado = ?`;
    values.push(id);

    const [result] = await db.query(sql, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ exito: false, msg: 'Empleado no encontrado' });
    }

    return res.json({ exito: true, msg: 'Empleado actualizado' });
  } catch (err) {
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ exito: false, msg: 'sucursal_id no existe (FK)', error: err.message });
    }
    return res.status(500).json({ exito: false, msg: 'Error al actualizar empleado', error: err.message });
  }
};

// DELETE /api/empleados/:id
const deleteEmpleado = async (req, res) => {
  try {
    const db = getDb(req);
    const { id } = req.params;

    const [result] = await db.query('DELETE FROM empleados WHERE id_empleado = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ exito: false, msg: 'Empleado no encontrado' });
    }
    return res.json({ exito: true, msg: 'Empleado eliminado' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        exito: false,
        msg: 'No se puede eliminar: el empleado está referenciado en otras tablas',
        error: err.message
      });
    }
    return res.status(500).json({ exito: false, msg: 'Error al eliminar empleado', error: err.message });
  }
};

// ----------------- REPORTES -----------------

// GET /api/empleados/reportes/ventas-por-empleado
const getVentasPorEmpleado = async (req, res) => {
  try {
    const db = getDb(req);
    const sql = `
      SELECT
        e.id_empleado,
        e.nombre,
        e.apellido_p,
        SUM(v.total) AS total_empleado
      FROM empleados e
      JOIN ventas v ON e.id_empleado = v.empleado_id
      GROUP BY e.id_empleado, e.nombre, e.apellido_p
      ORDER BY total_empleado DESC
    `;
    const [rows] = await db.query(sql);
    return res.json({ exito: true, datos: rows });
  } catch (err) {
    return res.status(500).json({ exito: false, msg: 'Error al obtener ventas por empleado', error: err.message });
  }
};

// GET /api/empleados/reportes/ventas-por-empleado-vista
const getVentasPorEmpleadoVista = async (req, res) => {
  try {
    const db = getDb(req);
    const [rows] = await db.query(`SELECT * FROM ventas_por_empleado ORDER BY monto_total DESC`);
    return res.json({ exito: true, datos: rows });
  } catch (err) {
    return res.status(500).json({ exito: false, msg: 'Error al obtener ventas_por_empleado (vista)', error: err.message });
  }
};

// GET /api/empleados/reportes/total-vendido-funcion
const getTotalVendidoPorEmpleadoFuncion = async (req, res) => {
  try {
    const db = getDb(req);
    const sql = `
      SELECT
        id_empleado,
        nombre,
        ventasXempleado(id_empleado) AS total_vendido
      FROM empleados
      ORDER BY total_vendido DESC
    `;
    const [rows] = await db.query(sql);
    return res.json({ exito: true, datos: rows });
  } catch (err) {
    return res.status(500).json({ exito: false, msg: 'Error al obtener total vendido por empleado (función)', error: err.message });
  }
};

// GET /api/empleados/reportes/total-vendido-vista
const getTotalVendidoPorEmpleadoVista = async (req, res) => {
  try {
    const db = getDb(req);
    const [rows] = await db.query(`SELECT * FROM vista_ventas_empleado ORDER BY total_vendido DESC`);
    return res.json({ exito: true, datos: rows });
  } catch (err) {
    return res.status(500).json({ exito: false, msg: 'Error al obtener vista_ventas_empleado', error: err.message });
  }
};

module.exports = {
  getEmpleados,
  getEmpleadoById,
  getEmpleadosBySucursal,
  createEmpleado,
  updateEmpleado,
  deleteEmpleado,
  getVentasPorEmpleado,
  getVentasPorEmpleadoVista,
  getTotalVendidoPorEmpleadoFuncion,
  getTotalVendidoPorEmpleadoVista
};