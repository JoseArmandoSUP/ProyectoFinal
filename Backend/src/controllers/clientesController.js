const pool = require('../config/db');

// Helpers simples (opcionales, puedes quitarlos si no los quieres)
const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());
const isDateYYYYMMDD = (v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v || '').trim());

/**
 * GET /clientes
 */
const obtenerClientes = async (req, res) => {
  try {
    const [resultado] = await pool.query('SELECT * FROM clientes');
    res.json({
      exito: true,
      datos: resultado
    });
  } catch (error) {
    res.status(500).json({
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
    const nombre = req.body.nombre;
    const apellido_p = req.body.apellido_p;
    const apellido_m = req.body.apellido_m;
    const telefono = req.body.telefono;
    const email = req.body.email;
    const calle = req.body.calle;
    const cp = req.body.cp;
    const tipo_cliente = req.body.tipo_cliente;
    const fecha_registro = req.body.fecha_registro;

    // Validación mínima (si no quieres validar, puedes borrar este bloque)
    if (!isNonEmptyString(nombre)) return res.status(400).json({ exito: false, msg: 'nombre es requerido' });
    if (!isNonEmptyString(apellido_p)) return res.status(400).json({ exito: false, msg: 'apellido_p es requerido' });
    if (!isNonEmptyString(apellido_m)) return res.status(400).json({ exito: false, msg: 'apellido_m es requerido' });
    if (!isNonEmptyString(telefono)) return res.status(400).json({ exito: false, msg: 'telefono es requerido' });
    if (!isEmail(email)) return res.status(400).json({ exito: false, msg: 'email inválido' });
    if (!isNonEmptyString(calle)) return res.status(400).json({ exito: false, msg: 'calle es requerida' });
    if (!isNonEmptyString(cp)) return res.status(400).json({ exito: false, msg: 'cp es requerido' });
    if (!isNonEmptyString(tipo_cliente)) return res.status(400).json({ exito: false, msg: 'tipo_cliente es requerido' });
    if (!isDateYYYYMMDD(fecha_registro)) return res.status(400).json({ exito: false, msg: 'fecha_registro debe ser YYYY-MM-DD' });

    const [resultado] = await pool.query(
      'INSERT INTO clientes (nombre, apellido_p, apellido_m, telefono, email, calle, cp, tipo_cliente, fecha_registro) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, apellido_p, apellido_m, telefono, email, calle, cp, tipo_cliente, fecha_registro]
    );

    res.status(201).json({
      exito: true,
      msg: 'Cliente agregado correctamente',
      id_cliente: resultado.insertId
    });
  } catch (error) {
    // Email duplicado (UNIQUE)
    if (error && (error.code === 'ER_DUP_ENTRY' || error.errno === 1062)) {
      return res.status(409).json({
        exito: false,
        msg: 'El email ya está registrado',
        error: error.message
      });
    }

    res.status(500).json({
      exito: false,
      msg: 'Error en el servidor al Agregar Cliente',
      error: error.message
    });
  }
};

// -----------------------------------------------------------------------------// NUEVOS ENDPOINTS (CONSULTAS RELACIONADAS A CLIENTE)
// -----------------------------------------------------------------------------

/**
 * CONSULTA #3 (tu script):
 * CLIENTES CON COMPRAS SUPERIORES AL PROMEDIO
 *
 * GET /clientes/compras/superiores-promedio
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
 * CONSULTA #6 (tu script):
 * CLIENTES CON CLASIFICACION (función clasificacion_cliente)
 *
 * GET /clientes/clasificacion
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
 * PROCEDIMIENTO (tu script):
 * historial_cliente(p_cliente_id)
 *
 * GET /clientes/:id_cliente/historial
 */
const obtenerHistorialCliente = async (req, res) => {
  try {
    const id_cliente = parseInt(req.params.id_cliente, 10);

    if (!Number.isInteger(id_cliente) || id_cliente <= 0) {
      return res.status(400).json({ exito: false, msg: 'id_cliente inválido' });
    }

    // mysql2/promise suele regresar un array de result sets:
    // resultSets[0] = rows del SELECT interno del procedimiento
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
  obtenerClientes,
  agregarCliente,
  clientesComprasSuperioresPromedio,
  obtenerClientesConClasificacion,
  obtenerHistorialCliente
};