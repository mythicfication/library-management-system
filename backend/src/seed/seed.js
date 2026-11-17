// Seed script: npm run seed — creates demo users, 12 books, 30 seats.
// Run with MONGO_URI set (loads backend/.env). Safe to re-run: it clears the collections first.
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Book = require('../models/Book');
const Seat = require('../models/Seat');
const Borrow = require('../models/Borrow');
const SeatBooking = require('../models/SeatBooking');

const books = [
  { title: 'Clean Code', author: 'Robert C. Martin', isbn: '9780132350884', category: 'Technology', totalCopies: 3, publishedYear: 2008, shelfLocation: 'Floor 1, Shelf A1', description: 'A handbook of agile software craftsmanship.' },
  { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', isbn: '9780262033848', category: 'Technology', totalCopies: 2, publishedYear: 2009, shelfLocation: 'Floor 1, Shelf A2', description: 'The classic algorithms textbook (CLRS).' },
  { title: 'Python Crash Course', author: 'Eric Matthes', isbn: '9781593279288', category: 'Technology', totalCopies: 4, publishedYear: 2019, shelfLocation: 'Floor 1, Shelf A3', description: 'A hands-on, project-based introduction to programming in Python.' },
  { title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '9780553380163', category: 'Science', totalCopies: 3, publishedYear: 1998, shelfLocation: 'Floor 2, Shelf B1', description: 'From the Big Bang to black holes.' },
  { title: 'The Selfish Gene', author: 'Richard Dawkins', isbn: '9780199291151', category: 'Science', totalCopies: 2, publishedYear: 2006, shelfLocation: 'Floor 2, Shelf B1', description: 'A gene-centred view of evolution.' },
  { title: 'Wings of Fire', author: 'A. P. J. Abdul Kalam', isbn: '9788173711466', category: 'Biography', totalCopies: 5, publishedYear: 1999, shelfLocation: 'Floor 1, Shelf C1', description: 'Autobiography of Dr A. P. J. Abdul Kalam.' },
  { title: 'Long Walk to Freedom', author: 'Nelson Mandela', isbn: '9780316545853', category: 'Biography', totalCopies: 2, publishedYear: 1995, shelfLocation: 'Floor 1, Shelf C1', description: 'The autobiography of Nelson Mandela.' },
  { title: 'The Discovery of India', author: 'Jawaharlal Nehru', isbn: '9780143031031', category: 'History', totalCopies: 3, publishedYear: 2004, shelfLocation: 'Floor 2, Shelf B2', description: 'History, culture and philosophy of India.' },
  { title: 'Indian Polity', author: 'M. Laxmikanth', isbn: '9789356065173', category: 'Competitive Exams', totalCopies: 5, publishedYear: 2023, shelfLocation: 'Floor 1, Shelf D1', description: 'Essential for UPSC and other competitive exams.' },
  { title: 'Quantitative Aptitude', author: 'R. S. Aggarwal', isbn: '9789352831242', category: 'Competitive Exams', totalCopies: 4, publishedYear: 2022, shelfLocation: 'Floor 1, Shelf D1', description: 'Practice book for aptitude tests.' },
  { title: 'The Alchemist', author: 'Paulo Coelho', isbn: '9780062315007', category: 'Fiction', totalCopies: 4, publishedYear: 2014, shelfLocation: 'Floor 2, Shelf E1', description: 'A fable about following your dream.' },
  { title: "Harry Potter and the Philosopher's Stone", author: 'J. K. Rowling', isbn: '9780747532699', category: 'Children', totalCopies: 3, publishedYear: 1997, shelfLocation: 'Floor 2, Shelf E2', description: 'The first Harry Potter book.' },
];

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User.deleteMany(), Book.deleteMany(), Seat.deleteMany(), Borrow.deleteMany(), SeatBooking.deleteMany()]);
  await User.create([
    { name: 'Admin', email: 'admin@demo.com', password: 'Admin@123', role: 'admin' },
    { name: 'Librarian', email: 'librarian@demo.com', password: 'Librarian@123', role: 'librarian' },
    { name: 'Student', email: 'student@demo.com', password: 'Student@123', role: 'student' },
  ]);
  await Book.insertMany(books.map((b) => ({ ...b, availableCopies: b.totalCopies })));
  const seats = [];
  for (let n = 1; n <= 30; n++) {
    seats.push({ seatNumber: n, floor: n <= 15 ? 1 : 2, area: n <= 15 ? 'Reading Hall A' : 'Reading Hall B', isAvailable: true });
  }
  await Seat.insertMany(seats);
  console.log('Seeded: 3 users, 12 books, 30 seats');
  await mongoose.disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
