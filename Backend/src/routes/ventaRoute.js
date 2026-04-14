const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');


router.get('/clientes/compras/superiores-promedio', ventaController.clientesComprasSuperioresPromedio);
router.get('/clientes/clasificacion', ventaController.obtenerClientesConClasificacion);
router.get('/clientes/:id_cliente/historial', ventaController.obtenerHistorialCliente);


router.post('/', ventaController.registrarVenta);

module.exports = router;