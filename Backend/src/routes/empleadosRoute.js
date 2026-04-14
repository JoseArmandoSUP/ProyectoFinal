const express = require('express');
const router = express.Router();
const empleadosCrontoller = require('../controllers/empleadosController');

router.get('/', empleadosCrontoller.obtenerEmpleados);
router.post('/', empleadosCrontoller.agregarEmpleado);

module.exports = router;