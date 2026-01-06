// ✅ RAZORPAY TEST CONFIGURATION
// 
// Test credentials configured for development and testing
// Key ID: rzp_test_RbZA7SxIyR1eRX
// Key Secret: Configured in environment variables
//
// For production:
// 1. Go to: https://dashboard.razorpay.com/app/keys
// 2. Switch to Live Mode
// 3. Replace with your live keys (rzp_live_...)
//
// IMPORTANT NOTES:
// - The key below must match the RAZORPAY_KEY_ID environment variable
// - Get both Key ID and Key Secret from Razorpay dashboard
// - NEVER expose your key_secret in frontend code!
// - The key_secret should ONLY be used on the backend server

export const RAZORPAY_KEY_ID = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || '';
