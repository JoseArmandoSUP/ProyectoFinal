const pool = require('../config/db');

const registrarVenta = async (res, req) => {
    try{
        const cliente_id = req.body.cliente_id;
        const empleado_id = req.body.empleado_id;
        const sucursal_id = req.body.sucursal_id;
        const productos = req.body.productos;

        let total = 0;

        // Insertar la venta
        const [resultado] = await pool.query(
            'INSERT INTO ventas (total, cliente_id, empleado_id, sucursal_id) VALUES (0, ?, ?, ?)',
            [cliente_id, empleado_id, sucursal_id]
        );

        const venta_id = resultado.insertId;

        // Procesar cada producto iterando con for...of para soportar await
        for(const prod of productos){
            const subtotal = prod.cantidad * prod.precio;
            total += subtotal;

            // Insertar detalles en las ventas
            await pool.query(
                'INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)',
                [venta_id, prod.producto_id, prod.cantidad, prod.precio, subtotal]
            );

            // Actualizar stock del producto
            await pool.query(
                'UPDATE productos SET stock = stock - ? WHERE id_producto = ?',
                [prod.cantidad, prod.producto_id]
            );
        }

        // Actualizar el total de la venta
        await pool.query(
            'UPDATE ventas SET total = ? WHERE id_venta = ?',
            [total, venta_id]
        );

        // Retornar respuesta exitosa en formato JSON
        res.status(201).json({
            exito: true,
            msg: "Venta registrada exitosamente",
            id_venta: venta_id,
            total_venta: total
        });
    }catch (error) {
        // Manejo de errores estandarizado
        res.status(500).json({
            exito: false,
            msg: "Error en el servidor al Registrar Venta",
            error: error.message
        });
    }
};

module.exports = { registrarVenta };