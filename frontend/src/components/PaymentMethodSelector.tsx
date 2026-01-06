import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { CreditCard, Smartphone, Building2, Wallet, QrCode, Globe } from 'lucide-react';

export type PaymentMethod = 
  | 'card' 
  | 'upi' 
  | 'netbanking' 
  | 'wallet' 
  | 'cardless_emi'
  | 'paylater'
  | 'international_card';

interface PaymentMethodInfo {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: React.ReactNode;
  popular?: boolean;
}

const paymentMethods: PaymentMethodInfo[] = [
  {
    id: 'upi',
    name: 'UPI',
    description: 'Google Pay, PhonePe, Paytm, BHIM & more',
    icon: <Smartphone className="h-5 w-5" />,
    popular: true
  },
  {
    id: 'card',
    name: 'Credit / Debit Card',
    description: 'Visa, MasterCard, RuPay, Amex',
    icon: <CreditCard className="h-5 w-5" />
  },
  {
    id: 'international_card',
    name: 'International Card',
    description: 'Visa, Mastercard, Amex issued outside India',
    icon: <Globe className="h-5 w-5" />,
    popular: true
  },
  {
    id: 'netbanking',
    name: 'Net Banking',
    description: 'All major Indian banks',
    icon: <Building2 className="h-5 w-5" />
  },
  {
    id: 'wallet',
    name: 'Wallets',
    description: 'Paytm, MobiKwik, Freecharge',
    icon: <Wallet className="h-5 w-5" />
  }
];

interface PaymentMethodSelectorProps {
  onMethodSelect?: (method: PaymentMethod) => void;
  selectedMethod?: PaymentMethod;
}

export function PaymentMethodSelector({ 
  onMethodSelect, 
  selectedMethod = 'upi' 
}: PaymentMethodSelectorProps) {
  const [selected, setSelected] = useState<PaymentMethod>(selectedMethod);

  const handleSelect = (method: PaymentMethod) => {
    setSelected(method);
    onMethodSelect?.(method);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3>Select Payment Method</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          <span>100% Secure</span>
        </div>
      </div>

      <RadioGroup value={selected} onValueChange={(value) => handleSelect(value as PaymentMethod)}>
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div key={method.id} className="relative">
              <RadioGroupItem
                value={method.id}
                id={method.id}
                className="peer sr-only"
              />
              <Label
                htmlFor={method.id}
                className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-200 cursor-pointer transition-all hover:border-blue-300 peer-checked:border-blue-500 peer-checked:bg-blue-50"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-gray-700 peer-checked:text-blue-600">
                    {method.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{method.name}</span>
                      {method.popular && (
                        <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {method.description}
                    </p>
                  </div>
                </div>
                <div className="ml-4">
                  <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                    selected === method.id
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selected === method.id && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>

      {/* Payment method specific information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="space-y-2 text-sm">
            {selected === 'upi' && (
              <>
                <p className="text-blue-900">
                  <strong>Pay using any UPI app:</strong>
                </p>
                <ul className="list-disc list-inside text-blue-800 space-y-1 ml-2">
                  <li>Google Pay</li>
                  <li>PhonePe</li>
                  <li>Paytm</li>
                  <li>BHIM UPI</li>
                  <li>Any bank UPI app</li>
                </ul>
                <p className="text-blue-700 mt-2">
                  ✓ Instant payment confirmation
                </p>
              </>
            )}
            {selected === 'card' && (
              <>
                <p className="text-blue-900">
                  <strong>Accepted cards:</strong>
                </p>
                <ul className="list-disc list-inside text-blue-800 space-y-1 ml-2">
                  <li>Visa & MasterCard Credit/Debit Cards</li>
                  <li>RuPay Cards</li>
                  <li>American Express</li>
                </ul>
                <p className="text-blue-700 mt-2">
                  ✓ 3D Secure authentication for safety
                </p>
              </>
            )}
            {selected === 'international_card' && (
              <>
                <p className="text-blue-900">
                  <strong>International cards accepted:</strong>
                </p>
                <ul className="list-disc list-inside text-blue-800 space-y-1 ml-2">
                  <li>Visa, Mastercard, American Express</li>
                </ul>
                <p className="text-blue-700 mt-2">
                  ✓ Requires international payments enabled on your Razorpay account
                </p>
              </>
            )}
            {selected === 'netbanking' && (
              <>
                <p className="text-blue-900">
                  <strong>Supported banks:</strong>
                </p>
                <p className="text-blue-800">
                  All major Indian banks including SBI, HDFC, ICICI, Axis, PNB, 
                  Bank of Baroda, and more.
                </p>
                <p className="text-blue-700 mt-2">
                  ✓ Secure bank gateway redirect
                </p>
              </>
            )}
            {selected === 'wallet' && (
              <>
                <p className="text-blue-900">
                  <strong>Supported wallets:</strong>
                </p>
                <ul className="list-disc list-inside text-blue-800 space-y-1 ml-2">
                  <li>Paytm Wallet</li>
                  <li>MobiKwik Wallet</li>
                  <li>Freecharge Wallet</li>
                  <li>Airtel Money</li>
                </ul>
                <p className="text-blue-700 mt-2">
                  ✓ One-click payment
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security badges */}
      <div className="flex items-center justify-center gap-4 pt-4 border-t">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
            🔒
          </div>
          <span>SSL Encrypted</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
            ✓
          </div>
          <span>PCI DSS Compliant</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
            💳
          </div>
          <span>RBI Approved</span>
        </div>
      </div>
    </div>
  );
}
