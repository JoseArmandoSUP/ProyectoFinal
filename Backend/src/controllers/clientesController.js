// const pool = require('../config/db');

// Helpers simples (opcionales)
const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());
const isDateYYYYMMDD = (v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v || '').trim());

const getDb = (req) => {
  // req.db lo pone el middleware withDbRole
  if (!req.db) throw new Error('DB no inicializada en req.db (falta withDbRole en la ruta)');
  return req.db;
};

/**
 * GET /clientes
 */
const obtenerClientes = async (req, res) => {
  try {
    const db = getDb(req);
    const [resultado] = await db.query('SELECT * FROM clientes');
    return res.json({ exito: true, datos: resultado });
  } catch (error) {
    return res.status(500).json({
      exito: false,
      msg: 'Error en el servidor en Obtener Clientes',
      error: error.message
    });
  }
};

/**
 * POST /clientes
 */
const agregarCliente = async (req, res) => {
  try {
    const db = getDb(req);

    const nombre = req.body.nombre;
    const apellido_p = req.body.apellido_p;
    const apellido_m = req.body.apellido_m;
    const telefono = req.body.telefono;
    const email = req.body.email;
    const calle = req.body.calle;
    const cp = req.body.cp;
    const tipo_cliente = req.body.tipo_cliente;
    const fecha_registro = req.body.fecha_registro;

    if (!isNonEmptyString(nombre)) return res.status(400).json({ exito: false, msg: 'nombre es requerido' });
    if (!isNonEmptyString(apellido_p)) return res.status(400).json({ exito: false, msg: 'apellido_p es requerido' });
    if (!isNonEmptyString(apellido_m)) return res.status(400).json({ exito: false, msg: 'apellido_m es requerido' });
    if (!isNonEmptyString(telefono)) return res.status(400).json({ exito: false, msg: 'telefono es requerido' });
    if (!isEmail(email)) return res.status(400).json({ exito: false, msg: 'email inválido' });
    if (!isNonEmptyString(calle)) return res.status(400).json({ exito: false, msg: 'calle es requerida' });
    if (!isNonEmptyString(cp)) return res.status(400).json({ exito: false, msg: 'cp es requerido' });
    if (!isNonEmptyString(tipo_cliente)) return res.status(400).json({ exito: false, msg: 'tipo_cliente es requerido' });
    if (!isDateYYYYMMDD(fecha_registro)) return res.status(400).json({ exito: false, msg: 'fecha_registro debe ser YYYY-MM-DD' });

    const [resultado] = await db.query(
      'INSERT INTO clientes (nombre, apellido_p, apellido_m, telefono, email, calle, cp, tipo_cliente, fecha_registro) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, apellido_p, apellido_m, telefono, email, calle, cp, tipo_cliente, fecha_registro]
    );

    return res.status(201).json({
      exito: true,
      msg: 'Cliente agregado correctamente',
      id_cliente: resultado.insertId
    });
  } catch (error) {
    if (error && (error.code === 'ER_DUP_ENTRY' || error.errno === 1062)) {
      return res.status(409).json({
        exito: false,
        msg: 'El email ya está registrado',
        error: error.message
      });
    }

    return res.status(500).json({
      exito: false,
      msg: 'Error en el servidor al Agregar Cliente',
      error: error.message
    });
  }
};

/**
 * GET /clientes/compras/superiores-promedio
 */
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

/**
 * GET /clientes/clasificacion
 */
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

/**
 * GET /clientes/:id_cliente/historial
 */
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

module.exports = {
  obtenerClientes,
  agregarCliente,
  clientesComprasSuperioresPromedio,
  obtenerClientesConClasificacion,
  obtenerHistorialCliente
};