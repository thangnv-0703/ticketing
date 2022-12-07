import request from 'supertest';
import { app } from '../../app';

it('fail when an email that does not exist is supplied', async () => {
  return request(app)
    .post('/api/users/signin')
    .send({
      email: 'user@example.com',
      password: 'password',
    })
    .expect(400);
});

it('fail when invalid password is supplied', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'user@example.com',
      password: 'password',
    })
    .expect(201);
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'user@example.com',
      password: '1234qwer',
    })
    .expect(400);
});

it('response with a cookie when given valid credentials ', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'user@example.com',
      password: 'password',
    })
    .expect(201);
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'user@example.com',
      password: 'password',
    })
    .expect(200);
});
