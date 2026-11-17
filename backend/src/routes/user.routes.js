const router = require('express').Router();
const c = require('../controllers/user.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
router.use(protect);
router.get('/', restrictTo('admin'), c.getUsers);
router.put('/profile', c.updateProfile);
router.delete('/:id', restrictTo('admin'), c.deleteUser);
module.exports = router;
