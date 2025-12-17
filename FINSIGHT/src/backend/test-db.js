const pool = require('./config/db');

(async () => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        console.log('Database connected! Result:', rows[0]);
    }catch (err) {
        console.error('Database connection failed:', err);
    }
})();
