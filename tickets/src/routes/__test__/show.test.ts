import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { getFakeSession } from '../../test/fake-session';

it('return a 404 if the ticket is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app).get(`/api/tickets/${id}`).send({}).expect(404);
});

it('return a ticket if the ticket is found', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', getFakeSession())
    .send({
      title: 'New title',
      price: 10,
    })
    .expect(201);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);
  expect(ticketResponse.body.title).toEqual('New title');
  expect(ticketResponse.body.price).toEqual(10);
});
