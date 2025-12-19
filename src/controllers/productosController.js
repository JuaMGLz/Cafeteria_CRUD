const db = require('../config/db');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM productos');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener productos', details: error.message });
    }
};

exports.create = async (req, res) => {
    const { nombre, descripcion, precio, stock } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO productos (nombre, descripcion, precio, stock) VALUES (?, ?, ?, ?)',
            [nombre, descripcion, precio, stock]
        );
        res.status(201).json({ id: result.insertId, message: 'Producto creado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear producto', details: error.message });
    }
};

exports.update = async (req, res) => {
    const { id } = req.params; 
    const { nombre, descripcion, precio, stock } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE productos SET nombre=?, descripcion=?, precio=?, stock=? WHERE id=?',
            [nombre, descripcion, precio, stock, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        
        res.json({ message: 'Producto actualizado con éxito' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM productos WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};