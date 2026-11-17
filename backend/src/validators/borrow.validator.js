const { body } = require('express-validator');
exports.borrowRules = [
  body('bookId').isMongoId().withMessage('Valid bookId is required'),
];
exports.seatBookingRules = [
  body('seatId').isMongoId().withMessage('Valid seatId is required'),
  body('date').isISO8601().withMessage('Valid date (YYYY-MM-DD) is required'),
  body('timeSlot').isIn(['Morning', 'Afternoon', 'Evening', 'Full Day']).withMessage('Invalid time slot'),
];
