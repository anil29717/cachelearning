import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { apiClient } from '../utils/api';

interface ConfigStatus {
  status: string;
  razorpay: {
    keyId: {
      isSet: boolean;
      length: number;
      prefix: string;
      startsWithRzp: boolean;
      isTestMode: boolean;
      isLiveMode: boolean;
    };
    keySecret: {
      isSet: boolean;
      length: number;
      prefix: string;
    };
    webhookSecret: {
      isSet: boolean;
      length: number;
    };
  };
  instructions: string;
  helpUrl: string;
  timestamp: string;
}

export function RazorpayConfigChecker() {
  const [status, setStatus] = useState<ConfigStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkConfig = async () => {
    setLoading(true);
    setError(null);

    try {
      const backend = (import.meta as any).env?.VITE_BACKEND_URL;
      const response = await fetch(`${backend}/api/config/check`);

      if (!response.ok) {
        throw new Error('Failed to fetch configuration status');
      }

      const data = await response.json();
      setStatus(data);
    } catch (err: any) {
      setError(err.message || 'Failed to check configuration');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (isSet: boolean, isValid: boolean = true) => {
    if (!isSet) return <XCircle className="w-5 h-5 text-red-500" />;
    if (!isValid) return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  const getStatusBadge = () => {
    if (!status) return null;

    const keyIdValid = status.razorpay.keyId.isSet && status.razorpay.keyId.startsWithRzp;
    const keySecretValid = status.razorpay.keyId.isSet && status.razorpay.keySecret.length >= 10;

    if (keyIdValid && keySecretValid) {
      return <Badge className="bg-green-500">Configured</Badge>;
    } else if (status.razorpay.keyId.isSet || status.razorpay.keySecret.isSet) {
      return <Badge className="bg-yellow-500">Partially Configured</Badge>;
    }
    return <Badge className="bg-red-500">Not Configured</Badge>;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Razorpay Configuration Status</CardTitle>
            <CardDescription>
              Check if your Razorpay API credentials are properly configured
            </CardDescription>
          </div>
          {status && getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Check Button */}
        <Button onClick={checkConfig} disabled={loading} className="w-full">
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Check Configuration
            </>
          )}
        </Button>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Status Display */}
        {status && (
          <div className="space-y-4">
            {/* Instructions */}
            <Alert>
              <AlertTitle>Status</AlertTitle>
              <AlertDescription>{status.instructions}</AlertDescription>
            </Alert>

            {/* Key ID Status */}
            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Key ID (RAZORPAY_KEY_ID)</h3>
                {getStatusIcon(
                  status.razorpay.keyId.isSet,
                  status.razorpay.keyId.startsWithRzp
                )}
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>• Set: {status.razorpay.keyId.isSet ? 'Yes' : 'No'}</p>
                {status.razorpay.keyId.isSet && (
                  <>
                    <p>• Length: {status.razorpay.keyId.length} characters</p>
                    <p>• Prefix: {status.razorpay.keyId.prefix}...</p>
                    <p>
                      • Format: {status.razorpay.keyId.startsWithRzp ? 'Valid' : 'Invalid (should start with rzp_)'}
                    </p>
                    <p>
                      • Mode:{' '}
                      {status.razorpay.keyId.isTestMode
                        ? 'Test Mode'
                        : status.razorpay.keyId.isLiveMode
                        ? 'Live Mode'
                        : 'Unknown'}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Key Secret Status */}
            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Key Secret (RAZORPAY_KEY_SECRET)</h3>
                {getStatusIcon(
                  status.razorpay.keySecret.isSet,
                  status.razorpay.keySecret.length >= 10
                )}
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>• Set: {status.razorpay.keySecret.isSet ? 'Yes' : 'No'}</p>
                {status.razorpay.keySecret.isSet && (
                  <>
                    <p>• Length: {status.razorpay.keySecret.length} characters</p>
                    <p>• Prefix: {status.razorpay.keySecret.prefix}...</p>
                  </>
                )}
              </div>
            </div>

            {/* Webhook Secret Status */}
            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Webhook Secret (RAZORPAY_WEBHOOK_SECRET)</h3>
                {status.razorpay.webhookSecret.isSet ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                )}
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>• Set: {status.razorpay.webhookSecret.isSet ? 'Yes' : 'No (Optional)'}</p>
                {status.razorpay.webhookSecret.isSet && (
                  <p>• Length: {status.razorpay.webhookSecret.length} characters</p>
                )}
                <p className="text-xs mt-2 italic">
                  Webhook secret is only required for production webhooks
                </p>
              </div>
            </div>

            {/* Help Links */}
            <div className="border rounded-lg p-4 bg-muted/50">
              <h3 className="font-medium mb-2">Need Help?</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://dashboard.razorpay.com/app/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    → Get your API keys from Razorpay Dashboard
                  </a>
                </li>
                <li>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    → Set environment variables in Supabase Dashboard
                  </a>
                </li>
                <li>
                  <span className="text-muted-foreground">
                    → Check RAZORPAY_ENV_SETUP.md for detailed instructions
                  </span>
                </li>
              </ul>
            </div>

            {/* Timestamp */}
            <p className="text-xs text-muted-foreground text-center">
              Last checked: {new Date(status.timestamp).toLocaleString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
