const express = require('express');
const { bookSeats, getAllSeats } = require('../controllers/seatControllers');
const router = express.Router();

router.get('/seats', getAllSeats);      // To get all seats status
router.post('/book', bookSeats);        // To book seats

module.exports = router;
