/**
 * Razorpay Error Handler Utility
 * Provides user-friendly error messages for common Razorpay errors
 */

export interface RazorpayError {
  code: string;
  description: string;
  source: string;
  step: string;
  reason: string;
  metadata?: Record<string, any>;
}

export interface ErrorResponse {
  message: string;
  userMessage: string;
  action: string;
  retryable: boolean;
}

/**
 * Handle Razorpay payment errors
 */
export function handleRazorpayError(error: any): ErrorResponse {
  const errorCode = error.code || error.error?.code || 'UNKNOWN_ERROR';
  const errorDescription = error.description || error.error?.description || error.message || 'Unknown error occurred';

  // Configuration errors
  if (
    errorCode === 'RAZORPAY_CONFIG_ERROR' ||
    errorCode === 'RAZORPAY_AUTH_ERROR' ||
    errorDescription.includes('authentication') ||
    errorDescription.includes('credentials')
  ) {
    return {
      message: errorDescription,
      userMessage: 'Payment system is not properly configured. Please contact support.',
      action: 'Contact administrator to update Razorpay API keys',
      retryable: false
    };
  }

  // Network errors
  if (
    errorCode === 'NETWORK_ERROR' ||
    errorDescription.includes('network') ||
    errorDescription.includes('timeout')
  ) {
    return {
      message: errorDescription,
      userMessage: 'Network connection issue. Please check your internet connection.',
      action: 'Please try again',
      retryable: true
    };
  }

  // Payment declined
  if (
    errorCode === 'BAD_REQUEST_ERROR' ||
    errorDescription.includes('insufficient') ||
    errorDescription.includes('declined')
  ) {
    return {
      message: errorDescription,
      userMessage: 'Payment was declined by your bank or payment provider.',
      action: 'Please try a different payment method or card',
      retryable: true
    };
  }

  // Invalid card
  if (
    errorDescription.includes('invalid card') ||
    errorDescription.includes('card number')
  ) {
    return {
      message: errorDescription,
      userMessage: 'Invalid card details provided.',
      action: 'Please check your card number and try again',
      retryable: true
    };
  }

  // CVV error
  if (errorDescription.includes('cvv') || errorDescription.includes('cvc')) {
    return {
      message: errorDescription,
      userMessage: 'Invalid CVV/CVC code.',
      action: 'Please check the CVV code on your card',
      retryable: true
    };
  }

  // OTP failure
  if (
    errorDescription.includes('otp') ||
    errorDescription.includes('authentication failed')
  ) {
    return {
      message: errorDescription,
      userMessage: 'Authentication failed. OTP not entered or incorrect.',
      action: 'Please try again and enter the correct OTP',
      retryable: true
    };
  }

  // Session timeout
  if (errorDescription.includes('timeout') || errorDescription.includes('expired')) {
    return {
      message: errorDescription,
      userMessage: 'Payment session expired.',
      action: 'Please start the payment process again',
      retryable: true
    };
  }

  // UPI specific errors
  if (errorDescription.includes('upi') || errorDescription.includes('vpa')) {
    return {
      message: errorDescription,
      userMessage: 'UPI payment failed. Please check your UPI ID or try another UPI app.',
      action: 'Verify your UPI ID and try again',
      retryable: true
    };
  }

  // Wallet errors
  if (errorDescription.includes('wallet') || errorDescription.includes('insufficient balance')) {
    return {
      message: errorDescription,
      userMessage: 'Wallet payment failed. Please check your wallet balance.',
      action: 'Add funds to your wallet or use another payment method',
      retryable: true
    };
  }

  // Bank errors
  if (
    errorDescription.includes('bank') ||
    errorDescription.includes('netbanking')
  ) {
    return {
      message: errorDescription,
      userMessage: 'Net banking payment failed.',
      action: 'Please try again or use a different payment method',
      retryable: true
    };
  }

  // Generic payment failure
  if (errorDescription.includes('payment') && errorDescription.includes('failed')) {
    return {
      message: errorDescription,
      userMessage: 'Payment could not be processed.',
      action: 'Please try again or contact support if the issue persists',
      retryable: true
    };
  }

  // Default error
  return {
    message: errorDescription,
    userMessage: 'An unexpected error occurred during payment.',
    action: 'Please try again or contact support',
    retryable: true
  };
}

/**
 * Handle payment verification errors
 */
export function handleVerificationError(error: any): ErrorResponse {
  const errorMessage = error.message || error.error || 'Verification failed';

  if (errorMessage.includes('signature')) {
    return {
      message: errorMessage,
      userMessage: 'Payment verification failed. This may be a security issue.',
      action: 'Please contact support immediately',
      retryable: false
    };
  }

  if (errorMessage.includes('order not found')) {
    return {
      message: errorMessage,
      userMessage: 'Order not found. Payment may not have been initiated.',
      action: 'Please try placing the order again',
      retryable: true
    };
  }

  if (errorMessage.includes('already processed')) {
    return {
      message: errorMessage,
      userMessage: 'This payment has already been processed.',
      action: 'Please check your orders or contact support',
      retryable: false
    };
  }

  return {
    message: errorMessage,
    userMessage: 'Payment verification failed.',
    action: 'Please contact support with your payment details',
    retryable: false
  };
}

/**
 * Get user-friendly status message
 */
export function getPaymentStatusMessage(status: string): string {
  const statusMessages: Record<string, string> = {
    created: 'Payment initiated',
    attempted: 'Payment in progress',
    paid: 'Payment successful',
    failed: 'Payment failed',
    refunded: 'Payment refunded',
    authorized: 'Payment authorized',
    captured: 'Payment captured',
  };

  return statusMessages[status] || 'Unknown status';
}

/**
 * Format error for logging
 */
export function formatErrorForLogging(error: any, context: string): string {
  const timestamp = new Date().toISOString();
  const errorCode = error.code || 'NO_CODE';
  const errorMessage = error.message || error.description || 'No message';
  const stack = error.stack || 'No stack trace';

  return `
[${timestamp}] Razorpay Error in ${context}
Code: ${errorCode}
Message: ${errorMessage}
Stack: ${stack}
  `.trim();
}
