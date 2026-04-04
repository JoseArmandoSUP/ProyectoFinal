const express = require('express');
const router = express.Router();
const clientesCrontoller = require('../controllers/clientesController');

router.get('/', clientesCrontoller.obtenerClientes);
router.post('/', clientesCrontoller.agregarCliente);

module.exports = router;