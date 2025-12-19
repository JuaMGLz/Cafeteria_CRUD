const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json());

app.use('/api/productos', require('./routes/productosRoutes'));
app.use('/api/clientes', require('./routes/clientesRoutes'));
app.use('/api/ventas', require('./routes/ventasRoutes'));

const PORT = process.env.PORT || 3000;
app.use(express.static('public'));
app.listen(PORT, () => {
    console.log(`Servidor iniciado en puerto ${PORT}`);
});