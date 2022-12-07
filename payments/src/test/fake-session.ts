import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const getFakeSession = (id?: string): string[] => {
  // build a JWT payload {id, email}
  const payload = {
    id: id ? id : new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com',
  };

  // create the JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // build the session object
  const session = { jwt: token };

  // turn the session into a JSON
  const sessionJson = JSON.stringify(session);

  // take JSON and encode it as base64
  const base64 = Buffer.from(sessionJson).toString('base64');

  // return a string that the cookie with session data
  return [`session=${base64}`];
};

export { getFakeSession };
