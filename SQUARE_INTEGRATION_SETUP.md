# Square Payment Integration Setup Guide

This guide will walk you through setting up Square Web Payments SDK for the Buy Ireland checkout system.

## Overview

The checkout system is fully implemented and ready to accept payments via Square. You just need to:
1. Create a Square account
2. Get your API credentials
3. Update the checkout.js file with your credentials
4. Create a backend endpoint to process payments

## Step 1: Create Square Account

1. Go to [Square Developer Portal](https://developer.squareup.com/)
2. Sign up for a free Square Developer account
3. Verify your email address

## Step 2: Create an Application

1. Log into the [Square Developer Dashboard](https://developer.squareup.com/apps)
2. Click the **"+"** button to create a new application
3. Name your application (e.g., "Buy Ireland")
4. Click **Create App**

## Step 3: Get Your Sandbox Credentials

For testing, you'll use Square's sandbox environment:

1. In your application dashboard, click **Credentials** in the left sidebar
2. At the top of the page, toggle to **Sandbox** mode
3. Copy the following credentials:
   - **Sandbox Application ID** (starts with `sandbox-sq0idb-`)
   - **Sandbox Access Token** (starts with `sandbox-sq0atb-`)
4. Click **Locations** in the left sidebar
5. Copy your **Sandbox Location ID**

## Step 4: Update checkout.js with Credentials

Open `js/checkout.js` and update these constants at the top of the file:

```javascript
// BEFORE (lines 4-5):
const SQUARE_APPLICATION_ID = 'sandbox-sq0idb-YOUR_APP_ID';
const SQUARE_LOCATION_ID = 'YOUR_LOCATION_ID';

// AFTER (replace with your actual credentials):
const SQUARE_APPLICATION_ID = 'sandbox-sq0idb-AbCdEf123456...'; // Your actual sandbox app ID
const SQUARE_LOCATION_ID = 'LXXXXXXXXXXXXXX'; // Your actual location ID
```

**Important:** Keep your Access Token secure! It will only be used on your backend server, not in the frontend JavaScript.

## Step 5: Create Backend Payment Processor

The frontend creates a payment token and sends it to your backend. You need to create a backend endpoint to process the payment using Square's Payments API.

### Example Backend Endpoint (Node.js/Express)

Create a backend file (e.g., `server.js`):

```javascript
const express = require('express');
const { Client, Environment } = require('square');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// Initialize Square client
const client = new Client({
  accessToken: 'YOUR_SANDBOX_ACCESS_TOKEN', // Replace with your actual token
  environment: Environment.Sandbox
});

// Payment processing endpoint
app.post('/api/process-payment', async (req, res) => {
  const { sourceId, amountMoney, billingContact, plots, quantity } = req.body;

  try {
    const { result } = await client.paymentsApi.createPayment({
      sourceId: sourceId,
      amountMoney: amountMoney,
      locationId: req.body.locationId,
      idempotencyKey: crypto.randomUUID(),
      buyerEmailAddress: billingContact.email,
      note: `${quantity} plot(s) of Irish land`
    });

    // Store order in database here
    // - Save plot details
    // - Send confirmation email
    // - Generate certificates

    res.json({
      success: true,
      orderId: result.payment.id,
      receiptUrl: result.payment.receiptUrl
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

app.listen(3000, () => {
  console.log('Payment server running on port 3000');
});
```

### Install Square SDK

```bash
npm install square
```

## Step 6: Update Frontend Backend URL

In `js/checkout.js` (around line 353), update the backend URL:

```javascript
// BEFORE:
const BACKEND_URL = '/api/process-payment'; // Update this with your backend URL

// AFTER (update with your actual backend URL):
const BACKEND_URL = 'https://your-backend-domain.com/api/process-payment';
// OR for local testing:
const BACKEND_URL = 'http://localhost:3000/api/process-payment';
```

## Step 7: Test the Integration

### Using Square's Test Cards

Square provides test card numbers for sandbox testing:

**Successful Payment:**
- Card Number: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiration: Any future date
- Postal Code: Any 5 digits

**Declined Payment (insufficient funds):**
- Card Number: `4000 0000 0000 0002`

**Other test scenarios:**
- See [Square's test values documentation](https://developer.squareup.com/docs/devtools/sandbox/payments#test-values)

### Testing Workflow

1. Open `buy-now.html` in your browser
2. Select a quantity of plots
3. Click "Proceed to Checkout"
4. Fill in plot owner details
5. On the payment step, use a test card number
6. Complete the purchase
7. Check your terminal/backend logs for the payment result

## Step 8: Production Deployment

When ready to go live:

1. **Get Production Credentials:**
   - In Square Dashboard, toggle from **Sandbox** to **Production**
   - Copy your Production Application ID and Access Token
   - Copy your Production Location ID

2. **Update checkout.js:**
   ```javascript
   // Change the SDK URL from sandbox to production
   // In checkout.html, line 12, remove 'sandbox.' from the URL:

   // BEFORE:
   <script type="text/javascript" src="https://sandbox.web.squarecdn.com/v1/square.js"></script>

   // AFTER:
   <script type="text/javascript" src="https://web.squarecdn.com/v1/square.js"></script>
   ```

3. **Update checkout.js credentials:**
   ```javascript
   const SQUARE_APPLICATION_ID = 'sq0idp-YOUR_PRODUCTION_APP_ID';
   const SQUARE_LOCATION_ID = 'YOUR_PRODUCTION_LOCATION_ID';
   ```

4. **Update backend:**
   - Change `Environment.Sandbox` to `Environment.Production`
   - Use production access token

5. **Security Checklist:**
   - ✅ Never commit API tokens to git
   - ✅ Use environment variables for sensitive data
   - ✅ Enable HTTPS for your website
   - ✅ Set up proper CORS headers on backend
   - ✅ Implement rate limiting
   - ✅ Add logging and monitoring

## Additional Features to Implement

### 1. Email Confirmations
Send order confirmation emails after successful payment

### 2. Order Management
Store order data in a database:
- Order ID
- Customer details
- Plot details (owner names, addresses)
- Payment status
- Certificate generation status

### 3. Certificate Generation
Automatically generate personalized certificates for each plot after payment

### 4. Webhooks
Set up Square webhooks to handle:
- Payment failures
- Refunds
- Chargebacks

### 5. Error Handling
Improve error messages for:
- Network issues
- Declined cards
- Server errors

## Troubleshooting

### Square.js fails to load
- Check your internet connection
- Verify the SDK URL is correct
- Check browser console for CORS errors

### Payment form doesn't appear
- Verify Application ID is correct
- Check that Square.js loaded successfully
- Look for JavaScript errors in console

### Payment token creation fails
- Ensure all required billing fields are filled
- Verify card details are in correct format
- Check network tab for API errors

### Backend payment fails
- Verify Access Token is correct
- Check Location ID matches your account
- Ensure amount is in cents (e.g., $99.99 = 9999)
- Review Square API error messages

## Resources

- [Square Web Payments SDK Documentation](https://developer.squareup.com/docs/web-payments/overview)
- [Square Payments API Reference](https://developer.squareup.com/reference/square/payments-api)
- [Square Developer Forums](https://developer.squareup.com/forums)
- [Square API Explorer](https://developer.squareup.com/explorer/square)

## Support

For Square integration issues:
- Email: developers@squareup.com
- Forums: https://developer.squareup.com/forums
- Documentation: https://developer.squareup.com/docs

For Buy Ireland checkout issues:
- Review this setup guide
- Check browser console for errors
- Verify all credentials are correct
- Test with Square's test card numbers first
