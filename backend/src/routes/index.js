const router = require('express').Router();
router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/books', require('./book.routes'));
router.use('/borrows', require('./borrow.routes'));
router.use('/seats', require('./seat.routes'));
router.use('/dashboard', require('./dashboard.routes'));
module.exports = router;
