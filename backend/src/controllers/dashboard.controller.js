const Book = require('../models/Book');
const Borrow = require('../models/Borrow');
const SeatBooking = require('../models/SeatBooking');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/v1/dashboard/stats
exports.getStats = asyncHandler(async (req, res) => {
  await Borrow.updateMany({ status: 'issued', dueDate: { $lt: new Date() } }, { $set: { status: 'overdue' } });
  const today = new Date(new Date().toISOString().slice(0, 10));
  const [totalBooks, availableBooks, activeBorrows, overdue, totalUsers, seatsBookedToday, byCategory, myBorrows] = await Promise.all([
    Book.countDocuments(),
    Book.aggregate([{ $group: { _id: null, total: { $sum: '$availableCopies' } } }]).then((r) => r[0]?.total || 0),
    Borrow.countDocuments({ status: 'issued' }),
    Borrow.countDocuments({ status: 'overdue' }),
    User.countDocuments(),
    SeatBooking.countDocuments({ date: today, status: 'booked' }),
    Book.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Borrow.countDocuments({ user: req.user._id, status: { $in: ['issued', 'overdue'] } }),
  ]);
  res.json({ success: true, data: { totalBooks, availableBooks, activeBorrows, overdue, totalUsers, seatsBookedToday, totalSeats: 30, byCategory, myBorrows } });
});
