import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Copy, Check, ExternalLink, Key } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription } from './ui/alert';

export function RazorpayTestKeysDisplay() {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const testKeyId = 'rzp_test_RbXgQEgViEoRDT';
  const testKeySecret = 'TogymjROObpyGc2MVIoPovYx';

  return (
    <Card className="border-2 border-purple-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
            <Key className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle>Razorpay Test Keys</CardTitle>
            <CardDescription>Use these credentials for testing payments</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-6">
        {/* Alert */}
        <Alert className="bg-amber-50 border-amber-200">
          <AlertDescription className="text-amber-900">
            <strong>⚠️ Important:</strong> These are test keys. Never use them in production!
          </AlertDescription>
        </Alert>

        {/* Frontend Key ID */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Frontend Key ID</p>
              <p className="text-xs text-muted-foreground mt-1">Location: <code className="bg-gray-100 px-1 rounded">/config/razorpay.ts</code></p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
              ✅ Configured
            </span>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm break-all">
              {testKeyId}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(testKeyId, 'keyId')}
              className="shrink-0"
            >
              {copiedField === 'keyId' ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Backend Secrets */}
        <div className="border-t pt-6 space-y-4">
          <div>
            <p className="text-sm mb-3">
              Add these secrets to Supabase Edge Functions:
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://supabase.com/dashboard/project/_/settings/functions', '_blank')}
              className="w-full justify-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open Supabase Dashboard
            </Button>
          </div>

          {/* RAZORPAY_KEY_ID */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Secret Name: <code className="bg-gray-100 px-2 py-1 rounded text-xs">RAZORPAY_KEY_ID</code>
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm break-all">
                {testKeyId}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(testKeyId, 'envKeyId')}
                className="shrink-0"
              >
                {copiedField === 'envKeyId' ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* RAZORPAY_KEY_SECRET */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Secret Name: <code className="bg-gray-100 px-2 py-1 rounded text-xs">RAZORPAY_KEY_SECRET</code>
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm break-all">
                {testKeySecret}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(testKeySecret, 'keySecret')}
                className="shrink-0"
              >
                {copiedField === 'keySecret' ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Test Cards Section */}
        <div className="border-t pt-6">
          <h4 className="text-sm mb-3">Test Card Details</h4>
          <div className="space-y-3 text-sm">
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="text-green-900 mb-2">✅ Successful Payment</p>
              <div className="space-y-1 text-xs text-green-800">
                <p><strong>Card:</strong> 4111 1111 1111 1111</p>
                <p><strong>CVV:</strong> 123</p>
                <p><strong>Expiry:</strong> 12/25</p>
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-red-900 mb-2">❌ Failed Payment</p>
              <div className="space-y-1 text-xs text-red-800">
                <p><strong>Card:</strong> 4000 0000 0000 0002</p>
                <p><strong>CVV:</strong> 123</p>
                <p><strong>Expiry:</strong> 12/25</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-blue-900 mb-2">💳 UPI Payment</p>
              <div className="space-y-1 text-xs text-blue-800">
                <p><strong>UPI ID:</strong> success@razorpay</p>
              </div>
            </div>
          </div>
        </div>

        {/* Setup Steps */}
        <div className="border-t pt-6">
          <h4 className="text-sm mb-3">Quick Setup Steps</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Copy the Key ID and Key Secret above</li>
            <li>Go to Supabase Dashboard → Edge Functions → Secrets</li>
            <li>Add both secrets (RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET)</li>
            <li>Wait 1-2 minutes for changes to apply</li>
            <li>Test payment with the test card above</li>
          </ol>
        </div>

        {/* Documentation Link */}
        <div className="border-t pt-6">
          <Button
            variant="link"
            onClick={() => window.open('/QUICK_TEST_PAYMENT.md', '_blank')}
            className="w-full justify-center"
          >
            📚 View Complete Testing Guide
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
