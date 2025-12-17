const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

module.exports = async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: token missing' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        // optional: verify user still exists in DB
        const [rows] = await pool.query('SELECT id, email FROM users WHERE id = ?', [payload.user_id]);
        if (!rows.length) return res.status(401).json({ error: 'Unauthorized: user not found' });

        req.user_id = payload.user_id;
        req.user = rows[0];
        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        return res.status(401).json({ error: 'Unauthorized: invalid token' });
    }
};
