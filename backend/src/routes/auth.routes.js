const router = require('express').Router();
const { register, login, getMe, changePassword } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { registerRules, loginRules, changePasswordRules } = require('../validators/auth.validator');

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePasswordRules, validate, changePassword);
module.exports = router;
