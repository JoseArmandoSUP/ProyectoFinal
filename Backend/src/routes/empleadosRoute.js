const express = require('express');
const router = express.Router();
const c = require('../controllers/empleadosController');

const { requireAuth } = require('../middlewares/auth');
const { withDbRole } = require('../middlewares/withDbRole');

// CRUD (lista)
router.get('/', requireAuth, withDbRole, c.getEmpleados);

// Reportes (antes de "/:id")
router.get('/reportes/ventas-por-empleado', requireAuth, withDbRole, c.getVentasPorEmpleado);
router.get('/reportes/ventas-por-empleado-vista', requireAuth, withDbRole, c.getVentasPorEmpleadoVista);
router.get('/reportes/total-vendido-funcion', requireAuth, withDbRole, c.getTotalVendidoPorEmpleadoFuncion);
router.get('/reportes/total-vendido-vista', requireAuth, withDbRole, c.getTotalVendidoPorEmpleadoVista);

// Filtros y búsquedas
router.get('/sucursal/:sucursal_id', requireAuth, withDbRole, c.getEmpleadosBySucursal);
router.get('/:id', requireAuth, withDbRole, c.getEmpleadoById);

// Escrituras
router.post('/', requireAuth, withDbRole, c.createEmpleado);
router.put('/:id', requireAuth, withDbRole, c.updateEmpleado);
router.delete('/:id', requireAuth, withDbRole, c.deleteEmpleado);

module.exports = router;