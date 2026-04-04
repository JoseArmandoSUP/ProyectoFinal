const pool = require('../config/db');

const obtenerProductos = async (req, res) => {
    try{
        const [resultado] = await pool.query('SELECT * FROM productos');
        res.json({
            exito: true,
            datos: resultado
        });
    }catch (error){
        res.status(500).json({
            exito: false,
            msg: "Error en el servidor en Obtener Productos",
            error: error.message
        });
    }
};

const agregarProductos = async (req, res) => {
    try{
        const nombre = req.body.nombre;
        const descripcion = req.body.descripcion;
        const precio = req.body.precio;
        const stock = req.body.stock;
        const stock_minimo = req.body.stock_minimo;

        const [resultado] = await pool.query(
            'INSERT INTO productos (nombre, descripcion, precio, stock, stock_minimo) VALUES (?, ?, ?, ?, ?)', 
            [nombre, descripcion, precio, stock, stock_minimo]
        );

        res.status(201).json({
            exito: true,
            id_producto: resultado.insertId
        });
    }catch (error){
        res.status(500).json({
            exito: false,
            msg: "Error en el servidor al Agregar Productos",
            error: error.message
        });
    }
};

const editarProducto = async (req, res) => {
    try{
        const id_producto = req.params.id_producto;
        const nombre = req.body.nombre;
        const precio = req.body.precio;
        const stock = req.body.stock;

        const [resultado] = await pool.query(
            'UPDATE productos SET nombre=?, precio=?, stock=? WHERE id_producto=?',
            [nombre, precio, stock, id_producto]
        );

        if(resultado.affectedRows === 0){
            return res.status(404).json({ error: 'Error al editar' });
        }

        res.status(200).json({
            exito: true,
            datos: resultado,
            msg: "Producto editado correctamente"
        });
    }catch (error){
        res.status(500).json({
            exito: false,
            msg: "Error al editar producto",
            error: error.message
        });
    }
};

const borrarProducto = async (req, res) => {
    try{
        const id_producto = req.params.id_producto;
        
        const [resultado] = await pool.query('DELETE FROM productos WHERE id_producto = ?', [id_producto]);
        
        if(resultado.affectedRows === 0){
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        res.status(200).json({ 
            exito: true,
            msg: 'Producto eliminado: ', 
            id_producto: id_producto
        });
    }catch (error){
        res.status(500).json({ 
            exito: false,
            msg: "Error al eliminar producto",
            error: error.message 
        });
    }
};

module.exports = {obtenerProductos, agregarProductos, editarProducto, borrarProducto};