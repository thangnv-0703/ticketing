import React, { useState } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';

export default () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');

  const { doRequest, errors } = useRequest({
    url: '/api/tickets',
    method: 'post',
    body: {
      title,
      price,
    },
    onSuccess: () => Router.push('/'),
  });

  const onSubmit = (e) => {
    e.preventDefault();
    doRequest();
  };

  const onBlur = () => {
    const value = parseFloat(price);
    if (isNaN(value)) {
      return;
    }
    setPrice(value.toFixed(2));
  };

  return (
    <form onSubmit={onSubmit}>
      <h1>Create new ticket</h1>
      <div className='mb-3'>
        <label>Title</label>
        <input
          type='text'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className='form-control'
        />
      </div>
      <div className='mb-3'>
        <label>Price</label>
        <input
          type='text'
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          onBlur={onBlur}
          className='form-control'
        />
      </div>
      {errors}
      <button className='btn btn-primary'>Submit</button>
    </form>
  );
};
