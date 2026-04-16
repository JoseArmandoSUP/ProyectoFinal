const mysql = require('mysql2/promise');
require('dotenv').config();

function makePool(user, password) {
  return mysql.createPool({
    host: process.env.DB_HOST,
    user,
    password,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10
  });
}

const pools = {
  admin: makePool(process.env.DB_ADMIN_USER, process.env.DB_ADMIN_PASSWORD),
  vendedor: makePool(process.env.DB_VENDEDOR_USER, process.env.DB_VENDEDOR_PASSWORD),
  analista: makePool(process.env.DB_ANALISTA_USER, process.env.DB_ANALISTA_PASSWORD),
};

const getPoolByRole = (role) => pools[role] || pools.vendedor;

module.exports = { getPoolByRole };