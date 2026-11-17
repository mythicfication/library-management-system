// Shared constants — roles, statuses, library rules
module.exports = {
  ROLES: ['student', 'librarian', 'admin'],
  BOOK_CATEGORIES: ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Competitive Exams', 'Children', 'Other'],
  BORROW_DAYS: 14, // due date = borrowedAt + 14 days
  FINE_PER_DAY: 10, // Rs 10 per overdue day
  MAX_ACTIVE_BORROWS: 3, // per student
  TIME_SLOTS: ['Morning', 'Afternoon', 'Evening', 'Full Day'],
  TOTAL_SEATS: 30, // Floor 1: 1-15 (Reading Hall A), Floor 2: 16-30 (Reading Hall B)
};
