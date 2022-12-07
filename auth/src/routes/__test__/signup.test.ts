import request from 'supertest';
import { app } from '../../app';

it('return 201 on successful signup', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'user@example.com',
      password: 'password',
    })
    .expect(201);
});

it('return 400 with invalid email', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'userexample.com',
      password: 'password',
    })
    .expect(400);
});

it('return 400 with invalid password', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'user@example.com',
      password: '132',
    })
    .expect(400);
});

it('return 400 with missing email and password', async () => {
  return request(app).post('/api/users/signup').send({}).expect(400);
});

it('disallow duplicated email', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'user@example.com',
      password: 'password',
    })
    .expect(201);

  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'user@example.com',
      password: 'password',
    })
    .expect(400);
});

it('set a cookie after successful signup', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'user@example.com',
      password: 'password',
    })
    .expect(201);
  expect(response.get('Set-Cookie')).toBeDefined();
});
