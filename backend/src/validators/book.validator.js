const { body } = require('express-validator');
const { BOOK_CATEGORIES } = require('../config/constants');
exports.bookRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('author').trim().notEmpty().withMessage('Author is required'),
  body('isbn').trim().notEmpty().withMessage('ISBN is required'),
  body('category').optional().isIn(BOOK_CATEGORIES).withMessage('Invalid category'),
  body('totalCopies').optional().isInt({ min: 1 }).withMessage('Total copies must be at least 1'),
  body('publishedYear').optional().isInt({ min: 1500 }).withMessage('Invalid published year'),
];
exports.bookUpdateRules = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('author').optional().trim().notEmpty().withMessage('Author cannot be empty'),
  body('category').optional().isIn(BOOK_CATEGORIES).withMessage('Invalid category'),
  body('totalCopies').optional().isInt({ min: 1 }).withMessage('Total copies must be at least 1'),
];
