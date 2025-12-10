const express = require('express');
const router = express.Router();
const controller = require('../controllers/transactionsController');

router.use((req, res, next) => {
    req.user_id = 1;
    next();
});

router.get('/', controller.getTransactions);
router.post('/', controller.createTransaction);
router.delete('/:id', controller.deleteTransaction);

module.exports = router;
