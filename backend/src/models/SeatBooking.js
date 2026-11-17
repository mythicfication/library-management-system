const mongoose = require('mongoose');
const { TIME_SLOTS } = require('../config/constants');

const seatBookingSchema = new mongoose.Schema(
  {
    seat: { type: mongoose.Schema.Types.ObjectId, ref: 'Seat', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true }, // day of the booking (midnight-normalised)
    timeSlot: { type: String, enum: TIME_SLOTS, required: true },
    status: { type: String, enum: ['booked', 'cancelled', 'completed'], default: 'booked' },
  },
  { timestamps: true }
);

// Prevent double-booking: same seat + date + slot can only be booked once
// (cancelled bookings do not block, because the query in the controller
// only counts status='booked'; the index below is a safety net for active ones
// — see seat.controller.js, which checks before creating.)
seatBookingSchema.index({ seat: 1, date: 1, timeSlot: 1 });

module.exports = mongoose.model('SeatBooking', seatBookingSchema);
