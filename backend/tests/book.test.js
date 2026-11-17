const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Book = require('../src/models/Book');

let token;
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/library_test');
  await User.deleteMany(); await Book.deleteMany();
  const admin = await User.create({ name: 'Admin', email: 'admin@test.com', password: 'Password123', role: 'admin' });
  const jwt = require('jsonwebtoken');
  token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'testsecret', { expiresIn: '1d' });
});
afterAll(async () => { await mongoose.connection.dropDatabase(); await mongoose.disconnect(); });

describe('Books', () => {
  it('creates a book as admin', async () => {
    const res = await request(app).post('/api/v1/books')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Book', author: 'Author', isbn: '1234567890', category: 'Fiction', totalCopies: 2 });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.availableCopies).toBe(2);
  });
  it('lists books with pagination', async () => {
    const res = await request(app).get('/api/v1/books?page=1&limit=10').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.pagination).toBeDefined();
  });
});
