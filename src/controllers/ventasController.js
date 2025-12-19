const db = require('../config/db');

exports.getAll = async (req, res) => {
    try {
        const query = `
            SELECT v.id, v.fecha, c.nombre AS cliente, p.nombre AS producto, 
                   v.cliente_id, v.producto_id, v.cantidad, v.total 
            FROM ventas v
            JOIN clientes c ON v.cliente_id = c.id
            JOIN productos p ON v.producto_id = p.id
            ORDER BY v.fecha DESC`;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    const { cliente_id, producto_id, cantidad, precio_unitario } = req.body;
    const total = parseFloat(cantidad) * parseFloat(precio_unitario);
    try {
        await db.query(
            'INSERT INTO ventas (cliente_id, producto_id, cantidad, total) VALUES (?, ?, ?, ?)',
            [cliente_id, producto_id, cantidad, total]
        );
        await db.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [cantidad, producto_id]);
        res.status(201).json({ message: "Venta creada" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    const { id } = req.params;
    const { cliente_id, producto_id, cantidad, precio_unitario } = req.body;
    const total = parseFloat(cantidad) * parseFloat(precio_unitario);

    try {
        const [oldVenta] = await db.query('SELECT cantidad, producto_id FROM ventas WHERE id = ?', [id]);
        if (oldVenta.length > 0) {
            await db.query('UPDATE productos SET stock = stock + ? WHERE id = ?', [oldVenta[0].cantidad, oldVenta[0].producto_id]);
            await db.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [cantidad, producto_id]);
        }
        await db.query(
            'UPDATE ventas SET cliente_id = ?, producto_id = ?, cantidad = ?, total = ? WHERE id = ?',
            [cliente_id, producto_id, cantidad, total, id]
        );
        res.json({ message: "Venta actualizada correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    const { id } = req.params;
    try {
        const [venta] = await db.query('SELECT cantidad, producto_id FROM ventas WHERE id = ?', [id]);
        if (venta.length > 0) {
            await db.query('UPDATE productos SET stock = stock + ? WHERE id = ?', [venta[0].cantidad, venta[0].producto_id]);
        }
        await db.query('DELETE FROM ventas WHERE id = ?', [id]);
        res.json({ message: "Venta eliminada" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};