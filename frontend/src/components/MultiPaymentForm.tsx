import React, { useCallback, useMemo, useState } from 'react';
import RazorpayButton from './RazorpayButton';
import { PaymentStatus } from './PaymentStatus';
import { PaymentMethodSelector, PaymentMethod } from './PaymentMethodSelector';

interface MultiPaymentFormProps {
  total: number;
  courseIds: string[];
  onSuccess: () => void;
}

export const MultiPaymentForm: React.FC<MultiPaymentFormProps> = ({ total, courseIds, onSuccess }) => {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | undefined>();
  const [method, setMethod] = useState<PaymentMethod>('upi');

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

  const label = 'Pay with Razorpay';

  const preferredMethod = useMemo(() => {
    // Map selector value to Razorpay method keys
    if (method === 'cardless_emi') return 'emi';
    if (method === 'international_card') return 'card';
    return method as any;
  }, [method]);

  return (
    <div className="space-y-6">
      <PaymentStatus status={status} message={message} />
      <PaymentMethodSelector selectedMethod={method} onMethodSelect={setMethod} />
      <div>
        <RazorpayButton
          amount={total}
          courseIds={courseIds}
          label={label}
          preferredMethod={preferredMethod}
          onSuccess={handleSuccess}
          onError={handleError}
          onInit={startProcessing as any}
          className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-colors"
        />
        <p className="mt-2 text-xs text-gray-600">
          Recommended methods include UPI, Cards, Netbanking, Wallet, EMI, Pay Later.
        </p>
      </div>
    </div>
  );
};

export default MultiPaymentForm;
