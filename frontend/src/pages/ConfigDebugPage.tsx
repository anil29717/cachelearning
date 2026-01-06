import { RazorpayConfigChecker } from '../components/RazorpayConfigChecker';
import { RazorpayTestKeysDisplay } from '../components/RazorpayTestKeysDisplay';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { ArrowLeft, AlertTriangle, CheckCircle2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ConfigDebugPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Configuration & Testing
            </h1>
            <p className="text-muted-foreground">Check Express backend configuration and test credentials</p>
          </div>

          {/* Important Setup Instructions */}
          <Alert className="border-amber-500 bg-gradient-to-r from-amber-50 to-orange-50">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <AlertTitle className="text-amber-900">⚠️ Backend Setup Required</AlertTitle>
            <AlertDescription className="text-amber-800 space-y-3">
              <p className="mt-2">Configure keys and secrets in Express backend environment.</p>
              
              <div className="bg-white rounded-lg p-4 space-y-2 border border-amber-200">
                <p className="text-sm">
                  <strong>📍 Where to add them:</strong>
                </p>
                <p className="text-sm text-muted-foreground">Server .env: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, JWT_SECRET</p>

                <div className="space-y-2 mt-3">
                  <h3 className="text-lg font-semibold">Express Backend Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="font-medium">Backend URL</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {(import.meta as any).env?.VITE_BACKEND_URL || 'Not set'}
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="font-medium">Razorpay Key ID</div>
                      <div className="text-sm text-muted-foreground">
                        {(import.meta as any).env?.VITE_RAZORPAY_KEY_ID ? '✅ Set' : '❌ Not set'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-amber-200">
                <p className="text-sm mb-2">
                  <strong>✅ After adding secrets:</strong>
                </p>
                <ol className="text-sm list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Restart backend after updating .env</li>
                  <li>Refresh this page</li>
                  <li>Check that "Config Checker" below shows all green ✅</li>
                  <li>Try a test payment</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>

          {/* Test Keys Display */}
          <RazorpayTestKeysDisplay />

          {/* Config Checker */}
          <div className="flex justify-center">
            <RazorpayConfigChecker />
          </div>

          <div className="border rounded-lg p-6 bg-card">
            <h2 className="text-xl mb-4">Troubleshooting</h2>
            <div className="space-y-4">
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>Ensure <code className="bg-muted px-1 rounded">VITE_BACKEND_URL</code> points to your Express server</li>
                <li>Set <code className="bg-muted px-1 rounded">VITE_RAZORPAY_KEY_ID</code> in .env file</li>
                <li>Verify Express server is running and accessible</li>
                <li>Check browser console for CORS errors</li>
                <li>Ensure JWT_SECRET is set in Express server .env</li>
              </ul>
            </div>
          </div>

          <div className="border rounded-lg p-6 bg-card">
            <h2 className="text-xl mb-4">Documentation Resources</h2>
            <ul className="space-y-2">
              <li>
                <span className="font-medium">RAZORPAY_ENV_SETUP.md</span>
                <p className="text-sm text-muted-foreground">
                  Complete guide for setting up Razorpay environment variables
                </p>
              </li>
              <li>
                <span className="font-medium">RAZORPAY_WEBHOOK_SETUP.md</span>
                <p className="text-sm text-muted-foreground">
                  Guide for configuring Razorpay webhooks
                </p>
              </li>
              <li>
                <span className="font-medium">RAZORPAY_TESTING_GUIDE.md</span>
                <p className="text-sm text-muted-foreground">
                  Instructions for testing payments with test cards
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
