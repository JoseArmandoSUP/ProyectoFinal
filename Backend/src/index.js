const express = require('express');
const cors = require('cors');
const app = express();

const clientesRoute = require('./routes/clientesRoute');
const productosRoute = require('./routes/productosRoute');
const ventaRoute = require('./routes/ventaRoute');
const empleadosRoute = require('./routes/empleadosRoute');
const sucursalesRoute = require('./routes/sucursalesRoute');
const authRoute = require('./routes/authRoute');

require('dotenv').config();

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoute);

app.use('/api/clientes', clientesRoute);
app.use('/api/productos', productosRoute);
app.use('/api/venta', ventaRoute);
app.use('/api/empleados', empleadosRoute);
app.use('/api/sucursales', sucursalesRoute);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor conectado al puerto ${PORT}`);
});