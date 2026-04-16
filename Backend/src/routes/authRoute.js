const express = require('express');
const router = express.Router();
const c = require('../controllers/authController');

router.post('/login', c.login);

module.exports = router;