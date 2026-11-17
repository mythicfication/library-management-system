const router = require('express').Router();
const c = require('../controllers/seat.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { seatBookingRules } = require('../validators/borrow.validator');

router.use(protect);
router.get('/', c.getSeats);
router.post('/book', seatBookingRules, validate, c.bookSeat);
router.get('/my-bookings', c.getMyBookings);
router.delete('/bookings/:id', c.cancelBooking);
module.exports = router;
