const express = require('express');
const cors = require('cors'); 
require('dotenv').config();

const app = express();

app.use(cors()); 

app.use(express.json());

app.use('/api/productos', require('./routes/productosRoutes'));
app.use('/api/clientes', require('./routes/clientesRoutes'));
app.use('/api/ventas', require('./routes/ventasRoutes'));

app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor iniciado en puerto ${PORT}`);
});