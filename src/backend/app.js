const express = require('express');
const cors = require('cors');

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use('/wallets', require('./routes/wallets'));
app.use('/transactions', require('./routes/transactions'));

// server
app.listen(5000, () => {
    console.log("FINSIGHT backend running on http://localhost:5000");
});
