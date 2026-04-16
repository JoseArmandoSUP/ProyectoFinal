const express = require('express');
const router = express.Router();
const c = require('../controllers/sucursalesController');

const { requireAuth } = require('../middlewares/auth');
const { withDbRole } = require('../middlewares/withDbRole');

// CRUD (lista)
router.get('/', requireAuth, withDbRole, c.getSucursales);

// Reportes (antes de "/:id")
router.get('/reportes/mayores-ingresos', requireAuth, withDbRole, c.getSucursalesMayoresIngresos);
router.get('/reportes/ventas-por-sucursal-vista', requireAuth, withDbRole, c.getVentasPorSucursalVista);

// CRUD por id + escrituras
router.get('/:id', requireAuth, withDbRole, c.getSucursalById);
router.post('/', requireAuth, withDbRole, c.createSucursal);
router.put('/:id', requireAuth, withDbRole, c.updateSucursal);
router.delete('/:id', requireAuth, withDbRole, c.deleteSucursal);

module.exports = router;