const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/v1/users — admin only, paginated
exports.getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, role } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter).sort('-createdAt').skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ]);
  res.json({ success: true, data: users, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } });
});

// PUT /api/v1/users/profile — own profile only, whitelisted fields
exports.updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['name', 'avatar'];
  allowed.forEach((k) => { if (req.body[k] !== undefined) req.user[k] = req.body[k]; });
  await req.user.save();
  res.json({ success: true, message: 'Profile updated', data: req.user });
});

// DELETE /api/v1/users/:id — admin: deactivate (soft delete)
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  if (user._id.equals(req.user._id)) throw new ApiError(400, 'You cannot deactivate yourself');
  user.isActive = false;
  await user.save();
  res.json({ success: true, message: 'User deactivated' });
});
