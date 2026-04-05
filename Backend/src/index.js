const express = require('express');
const cors = require('cors');
const app = express();
const clientesRoute = require('./routes/clientesRoute');
const productosRoute = require('./routes/productosRoute');
const ventaRoute = require('./routes/ventaRoute');
require('dotenv').config();

app.use(express.json());
app.use(cors());

app.use('/api/clientes', clientesRoute);
app.use('/api/productos', productosRoute);
app.use('/api/venta', ventaRoute);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {console.log(`Servidor conectado al puerto ${PORT}`)});