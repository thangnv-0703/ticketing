import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { getFakeSession } from '../../test/fake-session';

it('fetches orders for a particular user', async () => {
  // Create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 10,
    title: 'Test',
  });
  await ticket.save();

  const user = getFakeSession();

  // make a request to build an order with this ticket
  const { body: order } = await request(app)
    .post('/api/orders/')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // make a request to fetch the order
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send({})
    .expect(200);

  expect(order.id).toEqual(fetchedOrder.id);
});

it('return an 401 if one user tries to fetch an order of another user', async () => {
  // Create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 10,
    title: 'Test',
  });
  await ticket.save();

  const user = getFakeSession();

  // make a request to build an order with this ticket
  const { body: order } = await request(app)
    .post('/api/orders/')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // make a request to fetch the order
  await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', getFakeSession())
    .send({})
    .expect(401);
});

it('return an 404 if user tries to fetch an order that is not exist', async () => {
  const orderId = new mongoose.Types.ObjectId();
  await request(app)
    .get(`/api/orders/${orderId}`)
    .set('Cookie', getFakeSession())
    .send({})
    .expect(404);
});
