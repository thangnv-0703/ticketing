import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';
import { getFakeSession } from '../../test/fake-session';

it('mark an order as cancelled', async () => {
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

  // make a request to cancel the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send({})
    .expect(204);

  // expectation to make sure the order is cancelled
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('return an 404 if user tries to fetch an order that is not exist', async () => {
  const orderId = new mongoose.Types.ObjectId();
  await request(app)
    .delete(`/api/orders/${orderId}`)
    .set('Cookie', getFakeSession())
    .send({})
    .expect(404);
});

it('emis an order cancelled event', async () => {
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

  // make a request to cancel the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send({})
    .expect(204);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
