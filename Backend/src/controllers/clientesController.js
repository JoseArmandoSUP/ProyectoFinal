const pool = require('../config/db');

const obtenerClientes = async (req, res) => {
    try{
        const [resultado] = await pool.query('SELECT * FROM clientes');
        res.json({
            exito: true,
            datos: resultado
        });
    }catch (error){
        res.status(500).json({
            exito: false,
            msg: "Error en el servidor en Obtener Clientes",
            error: error.message
        });
    }
};

const agregarCliente = async (req, res) => {
    try{
        const nombre = req.body.nombre;
        const apellido_p = req.body.apellido_p;
        const apellido_m = req.body.apellido_m;
        const telefono = req.body.telefono;
        const email = req.body.email;
        const calle = req.body.calle;
        const cp = req.body.cp;
        const tipo_cliente = req.body.tipo_cliente;
        const fecha_registro = req.body.fecha_registro;
        
        const [resultado] = await pool.query(
            'INSERT INTO clientes clientes (nombre, apellido_p, apellido_m, telefono, email, calle, cp, tipo_cliente, fecha_registro) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [nombre, apellido_p, apellido_m, telefono, email, calle, cp, tipo_cliente, fecha_registro]
        );

        res.status(201).json({
            exito: true,
            msg: "Cliente agregado correctamente",
            id_cliente: resultado.insertId
        })
    }catch (error){
        res.status(500).json({
            exito: false,
            msg: "Error en el servidor al Agregar Cliente",
            error: error.message
        });
    }
};

module.exports = {obtenerClientes, agregarCliente};