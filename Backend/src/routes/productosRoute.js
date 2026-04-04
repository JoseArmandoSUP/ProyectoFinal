const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');

router.get('/', productosController.obtenerProductos);
router.post('/', productosController.agregarProductos);
router.put('/:id_producto', productosController.editarProducto);
router.delete('/:id_producto', productosController.borrarProducto);

module.exports = router;