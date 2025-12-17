require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// routes
app.use('/auth', require('./routes/auth'));
app.use('/wallets', require('./routes/wallets'));
app.use('/transactions', require('./routes/transactions'));

// health
app.get('/', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`FINSIGHT backend running on http://localhost:${PORT}`);
});
