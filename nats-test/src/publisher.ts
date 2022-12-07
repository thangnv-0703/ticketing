import { randomBytes } from 'crypto';
import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './event/ticket-created-publisher';

console.clear();

const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222',
});

stan.on('connect', async () => {
  console.log('Publisher connected to nats');
  // const data = JSON.stringify({
  //   id: '123',
  //   title: 'Publisher',
  //   price: 20,
  // });

  // stan.publish('ticket:created', data, () => {
  //   console.log('Event Published');
  // });

  const publisher = new TicketCreatedPublisher(stan);
  await publisher.publish({
    id: '123',
    title: 'Publisher',
    price: 20,
  });
});
