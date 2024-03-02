const express = require('express');
const {getShops, getShop, createShop, updateShop, deleteShop} = require('../controllers/shops');

// Include auth access routes
const {protect, authorize} = require('../middleware/auth');

// Include other access routes
//reservation

const router = express.Router();

//Re-route to reservations
router.use('/:shopID/reservations/', reservationRouter);

//Route to shop
router.route('/').get(getShops).post(protect, authorize('admin'), createShop);
router.route('/:id').get(getShop).put(protect, authorize('admin'), updateShop).delete(protetc, authorize('admin'), deleteShop);

module.exports = router;