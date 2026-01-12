#!/bin/bash

# Check environment variables
if [ -z "$JWT_SECRET" ]; then
  echo "ERROR: JWT_SECRET environment variable is required"
  exit 1
fi

if [ -z "$RAZORPAY_KEY_ID" ] || [ -z "$RAZORPAY_KEY_SECRET" ]; then
  echo "WARNING: Razorpay keys not set, payments will not work"
fi

# Start the server
echo "Starting Express server in ${NODE_ENV:-development} mode..."
node index.js
