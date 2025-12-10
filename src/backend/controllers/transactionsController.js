const pool = require('../config/db');

// GET all transactions
exports.getTransactions = async (req, res) => {
    try {
    const [rows] = await pool.query(
        "SELECT t.*, c.name AS category_name, w.wallet_name " +
        "FROM transactions t " +
        "JOIN categories c ON t.category_id = c.id " +
        "JOIN wallets w ON t.wallet_id = w.id " +
        "WHERE t.user_id = ? ORDER BY t.transaction_date DESC",
        [req.user_id]
    );
    res.json(rows);
    } catch (err) {
    res.status(500).json({ error: "Error fetching transactions" });
    }
};

// CREATE transaction
exports.createTransaction = async (req, res) => {
    const { wallet_id, category_id, amount, transaction_type, description, transaction_date } = req.body;

    try {
        const [result] = await pool.query(
        "INSERT INTO transactions (user_id, wallet_id, category_id, amount, transaction_type, description, transaction_date) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [req.user_id, wallet_id, category_id, amount, transaction_type, description, transaction_date]
    );
    res.json({ id: result.insertId, message: "Transaction created" });
    } catch (err) {
    res.status(500).json({ error: "Error creating transaction" });
    }
};

// DELETE transaction
exports.deleteTransaction = async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query("DELETE FROM transactions WHERE id=? AND user_id=?", [id, req.user_id]);
        res.json({ message: "Transaction deleted" });
    } catch (err) {
        res.status(500).json({ error: "Error deleting transaction" });
    }
};