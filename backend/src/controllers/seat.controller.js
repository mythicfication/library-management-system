const Seat = require('../models/Seat');
const SeatBooking = require('../models/SeatBooking');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const dayRange = (dateStr) => {
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  return d;
};

// GET /api/v1/seats?date&floor — seats with booked slots for that date
exports.getSeats = asyncHandler(async (req, res) => {
  const { date, floor } = req.query;
  const filter = {};
  if (floor) filter.floor = Number(floor);
  const seats = await Seat.find(filter).sort('seatNumber');
  let booked = [];
  if (date) {
    booked = await SeatBooking.find({ date: dayRange(date), status: 'booked' }).select('seat timeSlot');
  }
  res.json({ success: true, data: seats.map((s) => ({
    ...s.toObject(),
    bookedSlots: booked.filter((b) => b.seat.equals(s._id)).map((b) => b.timeSlot),
  })) });
});

// POST /api/v1/seats/book { seatId, date, timeSlot } — prevents double-booking
exports.bookSeat = asyncHandler(async (req, res) => {
  const { seatId, date, timeSlot } = req.body;
  const seat = await Seat.findById(seatId);
  if (!seat) throw new ApiError(404, 'Seat not found');
  if (!seat.isAvailable) throw new ApiError(400, 'Seat is not available');
  const day = dayRange(date);
  if (day < new Date(new Date().toISOString().slice(0, 10))) throw new ApiError(400, 'Cannot book a past date');
  // A Full Day booking blocks all slots, and any slot blocks a Full Day booking
  const clash = await SeatBooking.findOne({
    seat: seatId, date: day, status: 'booked',
    $or: [{ timeSlot }, { timeSlot: 'Full Day' }, ...(timeSlot === 'Full Day' ? [{ timeSlot: { $in: ['Morning', 'Afternoon', 'Evening'] } }] : [])],
  });
  if (clash) throw new ApiError(409, 'Seat already booked for that date and slot');
  const booking = await SeatBooking.create({ seat: seatId, user: req.user._id, date: day, timeSlot });
  res.status(201).json({ success: true, message: 'Seat booked', data: booking });
});

// GET /api/v1/seats/my-bookings
exports.getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await SeatBooking.find({ user: req.user._id }).sort('-date').populate('seat', 'seatNumber floor area');
  res.json({ success: true, data: bookings });
});

// DELETE /api/v1/seats/bookings/:id — cancel own booking (librarian/admin can cancel any)
exports.cancelBooking = asyncHandler(async (req, res) => {
  const booking = await SeatBooking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (req.user.role === 'student' && !booking.user.equals(req.user._id)) throw new ApiError(403, 'Not allowed');
  if (booking.status !== 'booked') throw new ApiError(400, 'Booking is already ' + booking.status);
  booking.status = 'cancelled';
  await booking.save();
  res.json({ success: true, message: 'Booking cancelled' });
});
