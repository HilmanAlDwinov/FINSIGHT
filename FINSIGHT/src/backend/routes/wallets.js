const express = require('express');
const router = express.Router();
const controller = require('../controllers/walletsController');
const auth = require('../middleware/authMiddleware');

router.use(auth); // protect all wallet routes

router.get('/', controller.getWallets);
router.post('/', controller.createWallet);
router.put('/:id', controller.updateWallet);
router.delete('/:id', controller.deleteWallet);

module.exports = router;
