const express = require('express');
const router = express.Router();
const controller = require('../controllers/transactionsController');
const auth = require('../middleware/authMiddleware');

router.use(auth);

router.get('/', controller.getTransactions);
router.post('/', controller.createTransaction);
router.delete('/:id', controller.deleteTransaction);

module.exports = router;
