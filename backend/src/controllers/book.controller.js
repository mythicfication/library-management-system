const Book = require('../models/Book');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/v1/books?page&limit&search&category&available&sort
exports.getBooks = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, category, available, sort = '-createdAt' } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (available === 'true') filter.availableCopies = { $gt: 0 };
  if (search) filter.$text = { $search: search };
  const skip = (Number(page) - 1) * Number(limit);
  const [books, total] = await Promise.all([
    Book.find(filter).sort(sort.split(',').join(' ')).skip(skip).limit(Number(limit)),
    Book.countDocuments(filter),
  ]);
  res.json({ success: true, data: books, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } });
});

exports.createBook = asyncHandler(async (req, res) => {
  const { totalCopies = 1 } = req.body;
  const book = await Book.create({ ...req.body, totalCopies, availableCopies: totalCopies });
  res.status(201).json({ success: true, message: 'Book created', data: book });
});

exports.getBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) throw new ApiError(404, 'Book not found');
  res.json({ success: true, data: book });
});

exports.updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) throw new ApiError(404, 'Book not found');
  // Whitelisted fields only; keep availableCopies consistent when total changes
  const allowed = ['title', 'author', 'category', 'description', 'totalCopies', 'publishedYear', 'shelfLocation'];
  const oldTotal = book.totalCopies;
  allowed.forEach((k) => { if (req.body[k] !== undefined) book[k] = req.body[k]; });
  if (req.body.totalCopies !== undefined) {
    book.availableCopies = Math.max(0, book.availableCopies + (book.totalCopies - oldTotal));
  }
  await book.save();
  res.json({ success: true, message: 'Book updated', data: book });
});

exports.deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) throw new ApiError(404, 'Book not found');
  await book.deleteOne();
  res.json({ success: true, message: 'Book deleted' });
});

// POST /api/v1/books/:id/cover — multer file in req.file
exports.uploadCover = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) throw new ApiError(404, 'Book not found');
  if (!req.file) throw new ApiError(400, 'No file uploaded');
  book.coverImage = `/uploads/${req.file.filename}`;
  await book.save();
  res.json({ success: true, message: 'Cover uploaded', data: book });
});
