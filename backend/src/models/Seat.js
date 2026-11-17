const mongoose = require('mongoose');

// A physical study seat. 30 seats total:
// Floor 1: seats 1-15, Reading Hall A | Floor 2: seats 16-30, Reading Hall B
// Long shared tables, staircase outside, building faces north (Anmol's library plan).
const seatSchema = new mongoose.Schema(
  {
    seatNumber: { type: Number, required: true, unique: true, min: 1, max: 30 },
    floor: { type: Number, required: true, enum: [1, 2] },
    area: { type: String, required: true, trim: true }, // e.g. "Reading Hall A"
    isAvailable: { type: Boolean, default: true }, // false = under maintenance / closed
  },
  { timestamps: true }
);

module.exports = mongoose.model('Seat', seatSchema);
