const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const roleByDbUser = (username) => {
  if (username === 'usu_admin') return 'admin';
  if (username === 'usu_vendedor') return 'vendedor';
  if (username === 'usu_analista') return 'analista';
  return null; // no permitido
};

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ exito: false, msg: 'username y password son requeridos' });
  }

  const role = roleByDbUser(username);
  if (!role) {
    return res.status(403).json({ exito: false, msg: 'Usuario no permitido para el sistema' });
  }

  // Intentar conexión con ese usuario de BD (solo para validar credenciales)
  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: username,
      password,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306
    });

    // Si conecta, credenciales OK
    // NOTA: evitar alias "current_user" para no chocar con palabra reservada / función
    const [rows] = await conn.query('SELECT CURRENT_USER() AS db_user');
    const db_user = rows?.[0]?.db_user || '';

    const token = jwt.sign(
      { sub: username, role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    return res.json({
      exito: true,
      msg: 'Login correcto',
      token,
      role,
      db_user
    });
  } catch (err) {
    return res.status(401).json({ exito: false, msg: 'Credenciales inválidas', error: err.message });
  } finally {
    try { if (conn) await conn.end(); } catch (_) {}
  }
};

module.exports = { login };