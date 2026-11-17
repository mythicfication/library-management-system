const Book = require('../models/Book');
const Borrow = require('../models/Borrow');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { FINE_PER_DAY, MAX_ACTIVE_BORROWS } = require('../config/constants');

// Mark overdue borrows whose due date has passed (called on list/detail)
async function refreshOverdue() {
  await Borrow.updateMany(
    { status: 'issued', dueDate: { $lt: new Date() } },
    { $set: { status: 'overdue' } }
  );
}

// GET /api/v1/borrows — students see only their own; librarian/admin see all
exports.getBorrows = asyncHandler(async (req, res) => {
  await refreshOverdue();
  const { page = 1, limit = 10, status } = req.query;
  const filter = req.user.role === 'student' ? { user: req.user._id } : {};
  if (status) filter.status = status;
  const skip = (Number(page) - 1) * Number(limit);
  const [borrows, total] = await Promise.all([
    Borrow.find(filter).sort('-createdAt').skip(skip).limit(Number(limit)).populate('book', 'title author isbn').populate('user', 'name email'),
    Borrow.countDocuments(filter),
  ]);
  res.json({ success: true, data: borrows, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } });
});

exports.getMyBorrows = asyncHandler(async (req, res) => {
  await refreshOverdue();
  const borrows = await Borrow.find({ user: req.user._id }).sort('-createdAt').populate('book', 'title author isbn coverImage');
  res.json({ success: true, data: borrows });
});

exports.getBorrow = asyncHandler(async (req, res) => {
  const borrow = await Borrow.findById(req.params.id).populate('book').populate('user', 'name email');
  if (!borrow) throw new ApiError(404, 'Borrow record not found');
  if (req.user.role === 'student' && !borrow.user._id.equals(req.user._id)) throw new ApiError(403, 'Not allowed');
  res.json({ success: true, data: borrow });
});

// POST /api/v1/borrows { bookId } — decrements availableCopies, max 3 active per student
exports.createBorrow = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.body.bookId);
  if (!book) throw new ApiError(404, 'Book not found');
  if (book.availableCopies <= 0) throw new ApiError(400, 'No copies available');
  const active = await Borrow.countDocuments({ user: req.user._id, status: { $in: ['issued', 'overdue'] } });
  if (active >= MAX_ACTIVE_BORROWS) throw new ApiError(400, `You can borrow at most ${MAX_ACTIVE_BORROWS} books at a time`);
  const already = await Borrow.findOne({ user: req.user._id, book: book._id, status: { $in: ['issued', 'overdue'] } });
  if (already) throw new ApiError(409, 'You already have this book issued');
  const borrow = await Borrow.create({ book: book._id, user: req.user._id });
  book.availableCopies -= 1;
  await book.save();
  res.status(201).json({ success: true, message: 'Book issued for 14 days', data: borrow });
});

// PUT /api/v1/borrows/:id/return — fine Rs 10/day overdue, increments availableCopies
exports.returnBorrow = asyncHandler(async (req, res) => {
  const borrow = await Borrow.findById(req.params.id);
  if (!borrow) throw new ApiError(404, 'Borrow record not found');
  if (borrow.status === 'returned') throw new ApiError(400, 'Book already returned');
  if (req.user.role === 'student' && !borrow.user.equals(req.user._id)) throw new ApiError(403, 'Not allowed');
  const now = new Date();
  let fine = 0;
  if (now > borrow.dueDate) {
    const daysLate = Math.ceil((now - borrow.dueDate) / (24 * 60 * 60 * 1000));
    fine = daysLate * FINE_PER_DAY;
  }
  borrow.returnedAt = now;
  borrow.status = 'returned';
  borrow.fine = fine;
  await borrow.save();
  await Book.findByIdAndUpdate(borrow.book, { $inc: { availableCopies: 1 } });
  res.json({ success: true, message: fine ? `Returned with fine of Rs ${fine}` : 'Book returned', data: borrow });
});
