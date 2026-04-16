const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');

const { requireAuth } = require('../middlewares/auth');
const { withDbRole } = require('../middlewares/withDbRole');

// Primero rutas específicas
router.get('/compras/superiores-promedio', requireAuth, withDbRole, clientesController.clientesComprasSuperioresPromedio);
router.get('/clasificacion', requireAuth, withDbRole, clientesController.obtenerClientesConClasificacion);
router.get('/:id_cliente/historial', requireAuth, withDbRole, clientesController.obtenerHistorialCliente);

// CRUD
router.get('/', requireAuth, withDbRole, clientesController.obtenerClientes);
router.post('/', requireAuth, withDbRole, clientesController.agregarCliente);

module.exports = router;