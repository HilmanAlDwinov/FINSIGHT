const express = require('express');
const router = express.Router();
const controller = require('../controllers/walletsController');

// Untuk testing sementara (hardcode user_id 1)
router.use((req, res, next) => {
    req.user_id = 1;
    next();
});

router.get('/', controller.getWallets);
router.post('/', controller.createWallet);
router.put('/:id', controller.updateWallet);
router.delete('/:id', controller.deleteWallet);

module.exports = router;