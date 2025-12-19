const db = require('../config/db');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM clientes');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener clientes', details: error.message });
    }
};

exports.getById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM clientes WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Cliente no encontrado' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    const { nombre, email, telefono } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO clientes (nombre, email, telefono) VALUES (?, ?, ?)',
            [nombre, email, telefono]
        );
        res.status(201).json({ id: result.insertId, message: 'Cliente registrado con éxito' });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar cliente', details: error.message });
    }
};

exports.update = async (req, res) => {
    const { id } = req.params;
    const { nombre, email, telefono } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE clientes SET nombre=?, email=?, telefono=? WHERE id=?',
            [nombre, email, telefono, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Cliente no encontrado' });
        res.json({ message: 'Datos del cliente actualizados correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM clientes WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Cliente no encontrado' });
        res.json({ message: 'Cliente eliminado del sistema' });
    } catch (error) {
        res.status(500).json({ error: 'No se puede eliminar un cliente con historial de ventas', details: error.message });
    }
};