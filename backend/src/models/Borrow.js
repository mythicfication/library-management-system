const mongoose = require('mongoose');
const { BORROW_DAYS } = require('../config/constants');

const borrowSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    borrowedAt: { type: Date, default: Date.now },
    // Due 14 days after borrowing
    dueDate: { type: Date, default: () => new Date(Date.now() + BORROW_DAYS * 24 * 60 * 60 * 1000) },
    returnedAt: { type: Date, default: null },
    status: { type: String, enum: ['issued', 'returned', 'overdue'], default: 'issued' },
    fine: { type: Number, default: 0, min: 0 }, // Rs, calculated on return
  },
  { timestamps: true }
);

borrowSchema.index({ user: 1, status: 1 });
borrowSchema.index({ book: 1, status: 1 });

module.exports = mongoose.model('Borrow', borrowSchema);
