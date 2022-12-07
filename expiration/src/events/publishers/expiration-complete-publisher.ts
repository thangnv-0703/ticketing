import {
  ExpirationCompleteEvent,
  Publisher,
  Subjects,
} from '@tnvtickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
