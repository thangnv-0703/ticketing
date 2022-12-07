import React, { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id,
    },
    onSuccess: () => Router.push('/orders'),
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    findTimeLeft();
    setInterval(findTimeLeft, 1000);
  }, []);

  if (timeLeft < 0) {
    return <div>Order expires</div>;
  }
  return (
    <div>
      Time left to pay: {timeLeft}seconds
      <StripeCheckout
        token={(token) => doRequest({ token: token.id })}
        stripeKey='pk_test_51M8c7wFBx9yKzekf5jZFGCmLgIwa9FbfZFXchSQErgsrmMMeIMcGbLFEmjlVDg1RqMW179MeAexIVTqDfLWewsyC00lgO9ECDv'
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
      {errors}
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);
  return { order: data };
};

export default OrderShow;
