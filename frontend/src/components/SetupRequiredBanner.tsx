import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { AlertCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export function SetupRequiredBanner() {
  const navigate = useNavigate();
  const [showBanner, setShowBanner] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'ok' | 'missing'>('checking');

  useEffect(() => {
    // In local dev, fall back to hiding the banner to avoid blocking
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) {
      setBackendStatus('ok');
      setShowBanner(false);
      return;
    }
    checkBackendConfig();
  }, []);

  const checkBackendConfig = async () => {
    try {
      const response = await fetch(
        `https://${(window as any).SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-ff6dfb68/config/check`,
        {
          headers: {
            'Authorization': `Bearer ${(window as any).SUPABASE_ANON_KEY}`
          }
        }
      );
      
      if (!response.ok) {
        setBackendStatus('missing');
        setShowBanner(true);
        return;
      }

      const data = await response.json();
      
      if (!data.razorpay?.keyIdExists || !data.razorpay?.keySecretExists) {
        setBackendStatus('missing');
        setShowBanner(true);
      } else {
        setBackendStatus('ok');
        setShowBanner(false);
      }
    } catch (error) {
      // If we can't check, assume it might be missing
      console.log('Could not check backend config:', error);
      setBackendStatus('missing');
      setShowBanner(true);
    }
  };

  // Don't show banner if already on config page
  if (window.location.pathname === '/config-debug') {
    return null;
  }

  if (!showBanner || backendStatus !== 'missing') {
    return null;
  }

  return (
    <div className="fixed top-16 left-0 right-0 z-50 px-4 animate-fade-in">
      <div className="container mx-auto max-w-4xl">
        <Alert className="border-red-500 bg-red-50 shadow-lg animate-pulse-slow">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-900 text-lg">⚠️ Setup Required: Backend Configuration Missing</AlertTitle>
          <AlertDescription className="text-red-800 space-y-3">
            <p className="mt-2">
              <strong>Razorpay payment keys are not configured in the backend.</strong> All payment attempts will fail until this is fixed.
            </p>
            
            <div className="bg-white border border-red-200 rounded-lg p-4 space-y-2">
              <p className="text-sm">
                <strong>Quick Fix (2 minutes):</strong>
              </p>
              <ol className="text-sm list-decimal list-inside space-y-1 ml-2">
                <li>Click "View Setup Guide" below</li>
                <li>Copy the two secret keys</li>
                <li>Add them to Supabase Dashboard → Edge Functions → Secrets</li>
                <li>Wait 1-2 minutes and refresh</li>
              </ol>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              <Button
                onClick={() => navigate('/config-debug')}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                View Setup Guide & Keys
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Supabase Dashboard
              </Button>

              <Button
                variant="ghost"
                onClick={() => setShowBanner(false)}
                className="text-red-700 hover:bg-red-50"
              >
                Dismiss
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
