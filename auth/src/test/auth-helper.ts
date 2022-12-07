import request from 'supertest';
import { app } from '../app';

const signup = async (
  email: string = 'test@test.com',
  password: string = '#3aBq13l',
) => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email,
      password,
    })
    .expect(201);

  return response.get('Set-Cookie');
};

export { signup };
