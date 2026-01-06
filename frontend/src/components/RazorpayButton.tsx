import React, { useCallback, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { RAZORPAY_KEY_ID as CONFIG_RAZORPAY_KEY_ID } from '../config/razorpay';

type Props = {
  amount: number; // amount in INR rupees (e.g., 499)
  courseIds?: string[];
  label?: string;
  onSuccess?: (payload: any) => void;
  onError?: (error: any) => void;
  onInit?: () => void;
  className?: string;
  disabled?: boolean;
  preferredMethod?: 'card' | 'upi' | 'netbanking' | 'wallet' | 'emi' | 'paylater' | 'all';
};

// Minimal loader to add Razorpay script only when needed
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const RazorpayButton: React.FC<Props> = ({ amount, courseIds = [], label = 'Pay Now', onSuccess, onError, onInit, className, disabled, preferredMethod = 'all' }) => {
  const [loading, setLoading] = useState(false);
  const { session, user } = useAuth();

  const handleClick = useCallback(async () => {
    try {
      setLoading(true);
      onInit?.();

      // Guard: require login and student role
      if (!session?.access_token) {
        throw new Error('Please sign in to continue');
      }
      if (user && user.role !== 'student') {
        throw new Error('Only students can purchase courses');
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Use Express backend only
      const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL as string | undefined;
      if (!BACKEND_URL) {
        throw new Error('Backend URL not configured');
      }

      const createOrderUrl = `${BACKEND_URL}/api/razorpay/create-order`;
      let res: Response | null = null;
      res = await fetch(createOrderUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ amount, course_ids: courseIds })
      });

      if (!res || !res.ok) {
        const err = await res?.json().catch(() => ({ error: 'Create order failed' }));
        throw new Error(err.error || 'Create order failed');
      }

      const { razorpay_order_id, order_id, currency } = await res.json();

      // Normalize/trim key id to avoid hidden whitespace causing auth failures
      const rawKeyId = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || (import.meta as any).env?.NEXT_PUBLIC_RAZORPAY_KEY_ID || CONFIG_RAZORPAY_KEY_ID || '';
      const effectiveKeyId = String(rawKeyId).trim();
      if (!effectiveKeyId) {
        throw new Error('Razorpay Key ID not configured');
      }

      const options: any = {
        key: effectiveKeyId,
        amount: Math.round(amount * 100),
        currency: currency || 'INR',
        name: 'Payment',
        description: 'Course purchase',
        order_id: razorpay_order_id,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: (user as any)?.phone || '',
        },
        ...(preferredMethod && preferredMethod !== 'all'
          ? {
              method: {
                card: preferredMethod === 'card' ? '1' : '0',
                upi: preferredMethod === 'upi' ? '1' : '0',
                netbanking: preferredMethod === 'netbanking' ? '1' : '0',
                wallet: preferredMethod === 'wallet' ? '1' : '0',
                emi: preferredMethod === 'emi' ? '1' : '0',
                paylater: preferredMethod === 'paylater' ? '1' : '0',
              }
            }
          : {})
        ,
        handler: async function (response: any) {
          try {
            const verifyUrl = `${BACKEND_URL}/api/razorpay/verify-payment`;
            const verifyRes = await fetch(verifyUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session?.access_token}`
              },
              body: JSON.stringify({
                order_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verifyJson = await verifyRes.json().catch(() => ({}));
            if (verifyRes.ok && verifyJson?.success) {
              onSuccess?.(verifyJson);
            } else {
              throw new Error(verifyJson?.error || 'Payment verification failed');
            }
          } catch (err) {
            console.error('Verification failed', err);
            onError?.(err);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        },
        theme: { color: '#3399cc' }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        onError?.(response?.error || response);
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      console.error('Payment init error', err);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  }, [amount, courseIds, onSuccess, onError, onInit]);

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={
        className ||
        'inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-colors disabled:opacity-50'
      }
    >
      {loading ? `Processing… ₹${amount}` : label}
    </button>
  );
};

export default RazorpayButton;
