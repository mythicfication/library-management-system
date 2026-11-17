const router = require('express').Router();
const c = require('../controllers/borrow.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { borrowRules } = require('../validators/borrow.validator');

router.use(protect);
router.route('/').get(c.getBorrows).post(borrowRules, validate, c.createBorrow);
router.get('/my', c.getMyBorrows);
router.get('/:id', c.getBorrow);
router.put('/:id/return', c.returnBorrow);
module.exports = router;
