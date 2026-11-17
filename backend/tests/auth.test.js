const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');

beforeAll(async () => { await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/library_test'); });
afterAll(async () => { await mongoose.connection.dropDatabase(); await mongoose.disconnect(); });

describe('Auth', () => {
  it('registers a user', async () => {
    const res = await request(app).post('/api/v1/auth/register')
      .send({ name: 'Test', email: 't@test.com', password: 'Password123' });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('student'); // role never taken from body
  });
  it('rejects wrong password', async () => {
    const res = await request(app).post('/api/v1/auth/login')
      .send({ email: 't@test.com', password: 'wrong' });
    expect(res.statusCode).toBe(401);
  });
  it('rejects unauthenticated access to /books', async () => {
    const res = await request(app).get('/api/v1/books');
    expect(res.statusCode).toBe(401);
  });
});
