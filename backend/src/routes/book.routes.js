const router = require('express').Router();
const c = require('../controllers/book.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const upload = require('../middlewares/upload.middleware');
const { bookRules, bookUpdateRules } = require('../validators/book.validator');

router.use(protect);
router.route('/').get(c.getBooks).post(restrictTo('librarian', 'admin'), bookRules, validate, c.createBook);
router.route('/:id').get(c.getBook)
  .put(restrictTo('librarian', 'admin'), bookUpdateRules, validate, c.updateBook)
  .delete(restrictTo('librarian', 'admin'), c.deleteBook);
router.post('/:id/cover', restrictTo('librarian', 'admin'), upload.single('file'), c.uploadCover);
module.exports = router;
