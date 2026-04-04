const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

pool.getConnection()
    .then(connection => {
        pool.releaseConnection(connection)
        console.log("MySQL conectado")
    })
.catch(err => console.error('Error de conexion', err.code))

module.exports = pool;