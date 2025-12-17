const pool = require('../config/db');

// GET all wallets
exports.getWallets = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM wallets WHERE user_id = ?", [req.user_id]);
        res.json(rows);
    } catch (err) {
    res.status(500).json({ error: "Error fetching wallets" });
    }
};

// CREATE wallet
exports.createWallet = async (req, res) => {
    const { wallet_name, balance, type } = req.body;

    try {
        const [result] = await pool.query(
        "INSERT INTO wallets (user_id, wallet_name, balance, type) VALUES (?, ?, ?, ?)",
        [req.user_id, wallet_name, balance, type]
        );
    res.json({ id: result.insertId, message: "Wallet created" });
    } catch (err) {
    res.status(500).json({ error: "Error creating wallet" });
    }
};

// UPDATE wallet
exports.updateWallet = async (req, res) => {
    const { wallet_name, balance, type } = req.body;
    const { id } = req.params;

    try {
        await pool.query(
        "UPDATE wallets SET wallet_name=?, balance=?, type=? WHERE id=? AND user_id=?",
        [wallet_name, balance, type, id, req.user_id]
    );
    res.json({ message: "Wallet updated" });
    } catch (err) {
    res.status(500).json({ error: "Error updating wallet" });
    }
};

// DELETE wallet
exports.deleteWallet = async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query("DELETE FROM wallets WHERE id=? AND user_id=?", [id, req.user_id]);
        res.json({ message: "Wallet deleted" });
    } catch (err) {
    res.status(500).json({ error: "Error deleting wallet" });
    }
};
