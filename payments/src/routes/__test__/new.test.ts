import { OrderStatus } from '@tnvtickets/common';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { stripe } from '../../stripe';
import { getFakeSession } from '../../test/fake-session';

jest.mock('../../stripe');

it('return 404 when purchase an order that does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', getFakeSession())
    .send({
      orderId: new mongoose.Types.ObjectId().toHexString(),
      token: 'qwererty',
    })
    .expect(404);
});

it('return 401 when purchase an order that does not belong to user ', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    price: 200,
    status: OrderStatus.Created,
    version: 0,
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', getFakeSession())
    .send({
      orderId: order.id,
      token: 'qwererty',
    })
    .expect(401);
});

it('return 400 when purchase a cancelled order', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    price: 200,
    status: OrderStatus.Cancelled,
    version: 0,
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', getFakeSession(userId))
    .send({
      orderId: order.id,
      token: 'qwererty',
    })
    .expect(400);
});

it('return 201 with valid input', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    price: 200,
    status: OrderStatus.Created,
    version: 0,
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', getFakeSession(userId))
    .send({
      orderId: order.id,
      token: 'tok_visa',
    })
    .expect(201);

  const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  expect(chargeOptions.source).toEqual('tok_visa');
  expect(chargeOptions.amount).toEqual(order.price * 100);
  expect(chargeOptions.currency).toEqual('usd');
});
