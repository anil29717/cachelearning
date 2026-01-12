import React, { useCallback, useState } from 'react';
import RazorpayButton from './RazorpayButton';
import { PaymentStatus } from './PaymentStatus';

interface CardPaymentFormProps {
  total: number;
  courseIds: string[];
  onSuccess: () => void;
}

export const CardPaymentForm: React.FC<CardPaymentFormProps> = ({ total, courseIds, onSuccess }) => {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | undefined>();

  const handleSuccess = useCallback(() => {
    setStatus('success');
    setMessage('Your enrollment will be provisioned shortly.');
    onSuccess();
  }, [onSuccess]);

  const handleError = useCallback((error: any) => {
    setStatus('error');
    const msg = (error && (error.message || error.error)) || 'Payment failed';
    setMessage(msg);
  }, []);

  const startProcessing = useCallback(() => {
    setStatus('processing');
    setMessage(undefined);
  }, []);

  return (
    <div className="space-y-4">
      <PaymentStatus status={status} message={message} />
      <RazorpayButton
        amount={total}
        courseIds={courseIds}
        label={`Pay with Razorpay`}
        onSuccess={handleSuccess}
        onError={handleError}
        onInit={startProcessing as any}
        className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-colors"
      />
    </div>
  );
};

export default CardPaymentForm;
