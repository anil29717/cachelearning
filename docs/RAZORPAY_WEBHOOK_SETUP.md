# Razorpay Webhook Configuration Guide

## Webhook URL

Your Razorpay webhook is now configured and ready to receive events at:

```
https://count-door-40486460.figma.site/webhook
```

## Setup Steps

### 1. Configure Webhook in Razorpay Dashboard

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Navigate to **Settings** → **Webhooks**
3. Click **Add New Webhook**
4. Enter the webhook URL:
   ```
   https://count-door-40486460.figma.site/webhook
   ```
5. Select the following events to monitor:
   - ✅ `payment.captured` - When payment is successfully captured
   - ✅ `payment.failed` - When payment fails
   - ✅ `refund.processed` - When refund is processed
   - ✅ `order.paid` - When order is marked as paid (optional)

6. Set the **Alert Email** (optional but recommended)
7. Click **Create Webhook**

### 2. Configure Webhook Secret

After creating the webhook, Razorpay will provide a **Webhook Secret**.

1. Copy the webhook secret from the Razorpay dashboard
2. In your Supabase project, add the environment variable:
   - Variable name: `RAZORPAY_WEBHOOK_SECRET`
   - Value: (paste your webhook secret)

**Important:** The webhook secret is used to verify that webhook requests are genuinely from Razorpay.

### 3. Test the Webhook

Razorpay provides a webhook testing feature:

1. In the Razorpay Dashboard, go to your webhook settings
2. Click **Send Test Webhook**
3. Select an event type (e.g., `payment.captured`)
4. Click **Send**

Check your server logs to confirm the webhook was received and processed successfully.

## Webhook Events Handled

### payment.captured
- Triggered when a payment is successfully captured
- Updates order status to `paid`
- Records payment details (method, email, etc.)
- Automatically creates course enrollments

### payment.failed
- Triggered when a payment fails
- Updates order status to `failed`
- Records failure reason

### refund.processed
- Triggered when a refund is processed
- Updates order status to `refunded`
- Records refund details (amount, refund ID)

## Security

- All webhook requests are verified using the HMAC SHA256 signature
- Only requests with valid signatures are processed
- Invalid signatures return a 400 error
- All webhook events are logged for audit purposes

## Webhook Response

The webhook endpoint always responds with:
- **Success (200):** `{ "success": true }`
- **Error (400/500):** `{ "error": "error message" }`

## Troubleshooting

### Webhook Not Receiving Events

1. **Check webhook URL:** Ensure the URL is exactly as configured
2. **Verify webhook secret:** Confirm `RAZORPAY_WEBHOOK_SECRET` is set correctly
3. **Check server logs:** Look for webhook processing errors
4. **Test manually:** Use Razorpay's test webhook feature

### Signature Verification Failed

- Ensure `RAZORPAY_WEBHOOK_SECRET` matches the secret in Razorpay dashboard
- Check that the secret doesn't have extra spaces or characters
- Verify the environment variable is properly set in Supabase

### Events Not Processing

- Check that the correct events are selected in Razorpay dashboard
- Review server logs for processing errors
- Verify database connectivity

## Testing in Test Mode

When using Razorpay Test Mode:

1. Use test API keys (`rzp_test_...`)
2. Configure webhook with test mode URL
3. Make test payments using test card numbers
4. Webhook events will be sent for test transactions

### Test Card Numbers

- **Success:** 4111 1111 1111 1111
- **Failure:** 4000 0000 0000 0002

Any CVV and future expiry date will work for test cards.

## Production Checklist

Before going live:

- [ ] Switch to live API keys in environment variables
- [ ] Update webhook URL to production domain (if different)
- [ ] Configure webhook secret with live mode secret
- [ ] Test webhook with live mode test webhooks
- [ ] Set up webhook alert emails in Razorpay dashboard
- [ ] Monitor webhook logs for the first few transactions

## Additional Resources

- [Razorpay Webhook Documentation](https://razorpay.com/docs/webhooks/)
- [Webhook Signature Verification](https://razorpay.com/docs/webhooks/validate-test/)
- [Razorpay Dashboard](https://dashboard.razorpay.com/)

## Support

If you encounter issues:
1. Check the Razorpay webhook logs in the dashboard
2. Review your server logs for errors
3. Verify all environment variables are set correctly
4. Test with Razorpay's test webhook feature
