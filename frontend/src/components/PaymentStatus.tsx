import React from 'react';

type Status = 'idle' | 'processing' | 'success' | 'error';

export const PaymentStatus: React.FC<{ status: Status; message?: string }> = ({ status, message }) => {
  if (status === 'idle') return null;
  const base = 'rounded-md p-3 text-sm';
  if (status === 'processing') {
    return <div className={`${base} bg-blue-50 text-blue-700`}>Processing payment… {message || ''}</div>;
  }
  if (status === 'success') {
    return <div className={`${base} bg-green-50 text-green-700`}>Payment successful! {message || ''}</div>;
  }
  return <div className={`${base} bg-red-50 text-red-700`}>Payment failed. {message || ''}</div>;
};

export default PaymentStatus;
