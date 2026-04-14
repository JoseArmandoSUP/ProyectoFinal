const pool = require('../config/db');

const obtenerEmpleados = async (req, res) => {
    try{
        const [resultado] = await pool.query('SELECT * FROM empleados');
        res.json({
            exito: true,
            datos: resultado
        });
    }catch (error){
        res.status(500).json({
            exito: false,
            msg: "Error en el servidor en Obtener Empleados",
            error: error.message
        });
    }
};

const agregarEmpleado = async (req, res) => {
    try{
        const nombre = req.body.nombre;
        const apellido_p = req.body.apellido_p;
        const apellido_m = req.body.apellido_m;
        const salario = req.body.salario;
        const fecha_contratacion = req.body.fecha_contratacion;
        const sucursal_id = req.body.sucursal_id;
        
        const [resultado] = await pool.query(
            'INSERT INTO empleados (nombre, apellido_p, apellido_m, salario, fecha_contratacion, sucursal_id) VALUES (?,?,?,?,?,?)', [nombre, apellido_p, apellido_m, salario, fecha_contratacion, sucursal_id]
        );

        res.status(201).json({
            exito: true,
            msg: "Empleado agregado correctamente",
            id_cliente: resultado.insertId
        })
    }catch (error){
        res.status(500).json({
            exito: false,
            msg: "Error en el servidor al Agregar Empleado",
            error: error.message
        });
    }
};

module.exports = {obtenerEmpleados, agregarEmpleado};