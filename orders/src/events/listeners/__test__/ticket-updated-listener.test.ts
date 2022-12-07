import { TicketUpdatedEvent } from '@tnvtickets/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketUpdatedListener } from '../ticket-updated-listener';

const setup = async () => {
  // Create a listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'first title',
    price: 10,
  });
  await ticket.save();

  // Create a fake data object
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'second title',
    price: 99,
    userId: '1asdjhfaiu',
  };

  // Create a fake message object
  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  // Return all of this stuff
  return { listener, data, ticket, message };
};

it('find, update and save a ticket', async () => {
  const { listener, data, ticket, message } = await setup();

  await listener.onMessage(data, message);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
});

it('acks the message', async () => {
  const { listener, data, ticket, message } = await setup();

  await listener.onMessage(data, message);
  expect(message.ack).toHaveBeenCalled();
});

it('does not call acks if the event has a skipped version', async () => {
  const { listener, data, ticket, message } = await setup();
  data.version = 10;
  try {
    await listener.onMessage(data, message);
  } catch (err) {}
  expect(message.ack).not.toHaveBeenCalled();
});
