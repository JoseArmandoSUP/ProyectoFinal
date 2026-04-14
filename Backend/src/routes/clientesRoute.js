const express = require('express');
const router = express.Router();
const clientesCrontoller = require('../controllers/clientesController');


router.get('/compras/superiores-promedio', clientesCrontoller.clientesComprasSuperioresPromedio);
router.get('/clasificacion', clientesCrontoller.obtenerClientesConClasificacion);
router.get('/:id_cliente/historial', clientesCrontoller.obtenerHistorialCliente);

// Rutas que ya tenías
router.get('/', clientesCrontoller.obtenerClientes);
router.post('/', clientesCrontoller.agregarCliente);

module.exports = router;