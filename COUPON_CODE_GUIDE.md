# Coupon Code Implementation Guide

## Overview

The checkout system now includes full coupon code functionality that allows customers to apply discount codes during checkout. Discounts are automatically calculated and applied to the order total.

## How It Works

### User Experience

1. **Step 3 (Payment)**: On the payment screen, users see a "Have a Coupon Code?" section
2. Users enter their coupon code (automatically converted to uppercase)
3. Click "Apply" button or press Enter
4. System validates the code (with visual feedback: "Validating...")
5. If valid:
   - Success message shows the discount amount
   - Order summary updates to show the discount
   - Total price updates automatically
   - Input field and button are disabled
6. If invalid:
   - Error message displays
   - User can try a different code

### Technical Implementation

#### Frontend Files Modified

**checkout.html**
- Added coupon code input section between payment form and payment status
- Added discount line in order summary sidebar (initially hidden)

**styles.css**
- Added `.coupon-section` styling
- Added `.coupon-success` and `.coupon-error` message styling
- Added `.discount-line` styling for order summary

**checkout.js**
- Added `discount` property to `checkoutState` object
- Added `applyCouponCode()` function to handle coupon application
- Added `validateCoupon()` function for validation (currently client-side, ready for backend)
- Updated `updateOrderSummary()` to calculate and display discounts
- Updated `processPayment()` to include discount in payment amount

## Discount Types

The system supports two types of discounts:

### 1. Percentage Discounts
```javascript
{
    type: 'percentage',
    value: 10  // 10% off
}
```
Applied as: `discountAmount = subtotal * (percentage / 100)`

### 2. Fixed Amount Discounts
```javascript
{
    type: 'fixed',
    value: 20  // $20.00 off
}
```
Applied as: `discountAmount = value`

## Sample Coupon Codes (For Testing)

The system currently has these demo coupons configured:

| Code | Type | Discount | Description |
|------|------|----------|-------------|
| `WELCOME10` | Percentage | 10% | New customer discount |
| `SAVE20` | Fixed | $20.00 | Fixed dollar discount |
| `IRELAND25` | Percentage | 25% | Irish heritage discount |
| `FREESHIP` | Fixed | $0.00 | Free shipping (already free) |

**Note:** These are hardcoded for demonstration. Replace with backend validation in production.

## Backend Integration

### Current State (Client-Side Validation)

Currently, `validateCoupon()` uses hardcoded coupon codes for testing. This works for development but is **NOT secure** for production.

### Production Implementation (Backend Validation)

You need to create a backend endpoint to securely validate coupons:

#### Backend Endpoint: `/api/validate-coupon`

**Request:**
```javascript
POST /api/validate-coupon
Content-Type: application/json

{
    "code": "WELCOME10"
}
```

**Response (Valid Coupon):**
```javascript
HTTP 200 OK
{
    "valid": true,
    "discount": {
        "type": "percentage",  // or "fixed"
        "value": 10
    }
}
```

**Response (Invalid Coupon):**
```javascript
HTTP 400 Bad Request
{
    "valid": false,
    "message": "Invalid coupon code"
}
```

#### Example Backend Implementation (Node.js/Express)

```javascript
const express = require('express');
const app = express();
app.use(express.json());

// Store coupons in database (this is a simple example)
const coupons = {
    'WELCOME10': { type: 'percentage', value: 10, active: true, expiresAt: '2026-12-31' },
    'SAVE20': { type: 'fixed', value: 20, active: true, expiresAt: '2026-12-31' },
    'IRELAND25': { type: 'percentage', value: 25, active: true, expiresAt: '2026-12-31' }
};

app.post('/api/validate-coupon', async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({
            valid: false,
            message: 'Coupon code is required'
        });
    }

    const normalizedCode = code.toUpperCase();
    const coupon = coupons[normalizedCode];

    // Check if coupon exists and is active
    if (!coupon || !coupon.active) {
        return res.status(400).json({
            valid: false,
            message: 'Invalid coupon code'
        });
    }

    // Check expiration
    if (new Date(coupon.expiresAt) < new Date()) {
        return res.status(400).json({
            valid: false,
            message: 'This coupon has expired'
        });
    }

    // Coupon is valid
    res.json({
        valid: true,
        discount: {
            type: coupon.type,
            value: coupon.value
        }
    });
});
```

#### Database Schema for Coupons

```sql
CREATE TABLE coupons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    type ENUM('percentage', 'fixed') NOT NULL,
    value DECIMAL(10, 2) NOT NULL,
    active BOOLEAN DEFAULT true,
    max_uses INT DEFAULT NULL,
    current_uses INT DEFAULT 0,
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Enabling Backend Validation

In `js/checkout.js`, update the `validateCoupon()` function:

```javascript
async function validateCoupon(couponCode) {
    // Remove the sample coupons object
    // Replace with actual API call:

    try {
        const response = await fetch('/api/validate-coupon', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code: couponCode })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Invalid coupon code');
        }

        const data = await response.json();

        if (data.valid) {
            return data.discount;  // { type: 'percentage' | 'fixed', value: number }
        } else {
            return null;
        }
    } catch (error) {
        throw new Error(error.message || 'Failed to validate coupon');
    }
}
```

## Square Orders API Integration

When processing payments with discounts, you need to create an Order object with the discount applied before charging the payment.

### Backend Payment Processing with Discounts

Update your `/api/process-payment` endpoint:

```javascript
const { Client, Environment } = require('square');

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Sandbox
});

app.post('/api/process-payment', async (req, res) => {
    const { sourceId, amountMoney, locationId, billingContact, plots, quantity, discount } = req.body;

    try {
        // Create order with line items and discounts
        const orderBody = {
            order: {
                locationId: locationId,
                lineItems: [
                    {
                        name: 'Irish Land Plot',
                        quantity: quantity.toString(),
                        basePriceMoney: {
                            amount: 9999,  // $99.99 in cents
                            currency: 'USD'
                        }
                    }
                ]
            }
        };

        // Add discount if present
        if (discount && discount.code) {
            if (discount.type === 'percentage') {
                orderBody.order.discounts = [
                    {
                        name: `Coupon: ${discount.code}`,
                        percentage: discount.value.toString(),
                        scope: 'ORDER'
                    }
                ];
            } else if (discount.type === 'fixed') {
                orderBody.order.discounts = [
                    {
                        name: `Coupon: ${discount.code}`,
                        amountMoney: {
                            amount: Math.round(discount.value * 100),  // Convert to cents
                            currency: 'USD'
                        },
                        scope: 'ORDER'
                    }
                ];
            }
        }

        // Create the order
        const { result: orderResult } = await client.ordersApi.createOrder(orderBody);
        const orderId = orderResult.order.id;

        // Process payment for the order
        const { result: paymentResult } = await client.paymentsApi.createPayment({
            sourceId: sourceId,
            orderId: orderId,
            amountMoney: amountMoney,
            locationId: locationId,
            idempotencyKey: crypto.randomUUID(),
            buyerEmailAddress: billingContact.email
        });

        res.json({
            success: true,
            orderId: paymentResult.payment.orderId,
            paymentId: paymentResult.payment.id,
            receiptUrl: paymentResult.payment.receiptUrl
        });

    } catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});
```

## Security Considerations

### ⚠️ Important Security Notes

1. **Never validate coupons on the client-side in production** - The current implementation is for testing only
2. **Always validate coupons on the backend** - Client-side validation can be bypassed
3. **Track coupon usage** - Prevent unlimited use of single-use coupons
4. **Validate discount amounts** - Ensure discounts don't exceed order total
5. **Log coupon usage** - Track who used which coupons and when
6. **Set expiration dates** - Automatically disable expired coupons
7. **Implement rate limiting** - Prevent coupon code enumeration attacks

## Testing the Feature

### 1. Start Your Development Server
```bash
cd C:\Users\Seapoint\Documents\Frontend
python -m http.server 8000
```

### 2. Navigate to Checkout
1. Open `http://localhost:8000/buy-now.html`
2. Select quantity and proceed to checkout
3. Fill in certificate names and customer details
4. On the payment step, you'll see the coupon code section

### 3. Test Sample Coupons
- Try `WELCOME10` - should show 10% discount
- Try `SAVE20` - should show $20 discount
- Try `INVALID` - should show error message

### 4. Verify Calculations
- Check that the order summary updates correctly
- Verify the total reflects the discount
- Ensure the "Complete Purchase" button shows the correct amount

## Advanced Features (Future Enhancements)

### 1. Minimum Order Requirements
```javascript
if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
    throw new Error(`Minimum order of $${coupon.minOrderAmount} required`);
}
```

### 2. Product-Specific Coupons
```javascript
if (coupon.applicableProducts && !coupon.applicableProducts.includes(productId)) {
    throw new Error('This coupon is not valid for this product');
}
```

### 3. First-Time Customer Only
```javascript
if (coupon.newCustomersOnly && customer.previousOrders > 0) {
    throw new Error('This coupon is for new customers only');
}
```

### 4. Usage Limits
```javascript
if (coupon.currentUses >= coupon.maxUses) {
    throw new Error('This coupon has reached its usage limit');
}
```

### 5. Remove/Clear Coupon
Add a "Remove" button next to applied coupons:
```javascript
function removeCoupon() {
    checkoutState.discount = null;
    updateOrderSummary();
    document.getElementById('couponCode').value = '';
    document.getElementById('couponCode').disabled = false;
    document.getElementById('applyCoupon').disabled = false;
    document.getElementById('applyCoupon').textContent = 'Apply';
    document.getElementById('coupon-status').innerHTML = '';
}
```

## Troubleshooting

### Coupon Not Applying
- Check browser console for errors
- Verify coupon code is in uppercase
- Ensure `updateOrderSummary()` is called after applying discount

### Incorrect Discount Amount
- Verify discount type (percentage vs fixed)
- Check calculation logic in `updateOrderSummary()`
- Ensure discount doesn't exceed subtotal

### UI Not Updating
- Verify all element IDs match between HTML and JavaScript
- Check that `.hidden` class is being added/removed correctly
- Inspect order summary sidebar for discount line visibility

## Summary

The coupon code feature is fully implemented and ready to use. The current implementation uses client-side validation for testing, but includes commented code showing how to integrate with a backend API for production use.

**Next Steps:**
1. Create backend `/api/validate-coupon` endpoint
2. Set up coupon database table
3. Replace client-side validation with backend API calls
4. Implement coupon usage tracking
5. Add coupon management interface (optional)

The discount is automatically included in the payment data sent to Square, ready for integration with the Orders API discount system.
