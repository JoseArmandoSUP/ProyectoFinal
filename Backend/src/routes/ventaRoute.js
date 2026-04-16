const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');

const { requireAuth } = require('../middlewares/auth');
const { withDbRole } = require('../middlewares/withDbRole');

// Clientes (relacionado a ventas)
router.get('/clientes/compras/superiores-promedio', requireAuth, withDbRole, ventaController.clientesComprasSuperioresPromedio);
router.get('/clientes/clasificacion', requireAuth, withDbRole, ventaController.obtenerClientesConClasificacion);
router.get('/clientes/:id_cliente/historial', requireAuth, withDbRole, ventaController.obtenerHistorialCliente);

// Reportes
router.get('/reportes/ventas-total-calculado', requireAuth, withDbRole, ventaController.ventasTotalCalculado);

// Registrar venta
router.post('/', requireAuth, withDbRole, ventaController.registrarVenta);

module.exports = router;