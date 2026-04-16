const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');

const { requireAuth } = require('../middlewares/auth');
const { withDbRole } = require('../middlewares/withDbRole');

// Rutas específicas
router.get('/stock-bajo', requireAuth, withDbRole, productosController.obtenerProductosStockBajo);
router.get('/mas-vendidos', requireAuth, withDbRole, productosController.obtenerProductosMasVendidos);

// CRUD
router.get('/', requireAuth, withDbRole, productosController.obtenerProductos);
router.post('/', requireAuth, withDbRole, productosController.agregarProductos);
router.put('/:id_producto', requireAuth, withDbRole, productosController.editarProducto);
router.delete('/:id_producto', requireAuth, withDbRole, productosController.borrarProducto);

module.exports = router;