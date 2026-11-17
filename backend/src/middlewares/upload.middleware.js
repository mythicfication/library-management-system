const multer = require('multer');
const path = require('path');
const ApiError = require('../utils/ApiError');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(file.originalname)}`),
});
const fileFilter = (req, file, cb) => {
  const ok = /jpeg|jpg|png/.test(file.mimetype);
  ok ? cb(null, true) : cb(new ApiError(400, 'Only JPG or PNG allowed'));
};
module.exports = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } });
