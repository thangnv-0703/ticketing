import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';
import { getFakeSession } from '../../test/fake-session';

it('returns an error if the ticket does not exist ', async () => {
  const ticketId = new mongoose.Types.ObjectId();
  await request(app)
    .post('/api/orders/')
    .set('Cookie', getFakeSession())
    .send({ ticketId })
    .expect(404);
});

it('returns an error if the ticket is already reserved', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 10,
    title: 'Test',
  });
  await ticket.save();
  const order = Order.build({
    ticket,
    status: OrderStatus.Created,
    userId: 'asdfqwer',
    expiresAt: new Date(),
  });
  await order.save();
  await request(app)
    .post('/api/orders/')
    .set('Cookie', getFakeSession())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it('reserved a ticket', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 10,
    title: 'Test',
  });
  await ticket.save();
  const response = await request(app)
    .post('/api/orders/')
    .set('Cookie', getFakeSession())
    .send({ ticketId: ticket.id })
    .expect(201);
  const order = await Order.findById(response.body.id);
  expect(order).toBeDefined();
  expect(order?.status).toEqual(OrderStatus.Created);
});

it('emis an order created event', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 10,
    title: 'Test',
  });
  await ticket.save();
  await request(app)
    .post('/api/orders/')
    .set('Cookie', getFakeSession())
    .send({ ticketId: ticket.id })
    .expect(201);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
