const mongoose = require('mongoose');
const { BOOK_CATEGORIES } = require('../config/constants');

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    author: { type: String, required: true, trim: true, maxlength: 100 },
    isbn: { type: String, required: true, unique: true, trim: true },
    category: { type: String, enum: BOOK_CATEGORIES, default: 'Other' },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    totalCopies: { type: Number, required: true, min: 1, default: 1 },
    availableCopies: { type: Number, required: true, min: 0, default: 1 },
    coverImage: { type: String, default: '' },
    publishedYear: { type: Number, min: 1500, max: new Date().getFullYear() + 1 },
    shelfLocation: { type: String, trim: true, default: '' }, // e.g. "Floor 1, Shelf A3"
  },
  { timestamps: true }
);

bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ category: 1 });

module.exports = mongoose.model('Book', bookSchema);
