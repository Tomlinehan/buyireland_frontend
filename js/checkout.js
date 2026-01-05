// Buy Ireland - Checkout JavaScript
// Handles multi-step checkout flow and Square payment integration

// Square credentials - Sandbox mode
// Get these from: https://developer.squareup.com/apps
const SQUARE_APPLICATION_ID = 'sandbox-sq0idb-lBNpYQ7rRHcNjbvXdcjJ9g';
const SQUARE_LOCATION_ID = 'LNWW9H24A5AZY';

// Checkout state
let checkoutState = {
    currentStep: 1,
    quantity: 1,
    basePrice: 99.99,
    plots: [],
    payments: null,
    card: null,
    discount: null,  // Will store: { code, type, value, amount }
    volumeDiscount: null,  // Auto-applied volume discount (separate from coupon)
    shippingMethod: 'standard',  // 'standard' (free) or 'express' ($44)
    shippingCost: 0
};

// Initialize checkout on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeCheckout();
});

function initializeCheckout() {
    // Get quantity from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const quantity = parseInt(urlParams.get('quantity')) ||
                    parseInt(localStorage.getItem('checkoutQuantity')) || 1;

    checkoutState.quantity = quantity;
    updateQuantityDisplay(quantity);
    updateOrderSummary();

    // Generate initial certificate name fields
    generatePlotDetailsForms();

    // Setup event listeners
    setupEventListeners();

    // Initialize Square (will be called when reaching step 3)
    // initializeSquare();
}

function setupEventListeners() {
    // Quantity controls in step 1
    document.getElementById('decreaseQty').addEventListener('click', () => adjustQuantity(-1));
    document.getElementById('increaseQty').addEventListener('click', () => adjustQuantity(1));
    document.getElementById('checkoutQuantity').addEventListener('change', function() {
        const newQty = parseInt(this.value);
        if (newQty >= 1 && newQty <= 99) {
            checkoutState.quantity = newQty;
            updateQuantityDisplay(newQty);
            updateOrderSummary();
            // Regenerate certificate name fields
            generatePlotDetailsForms();
        }
    });

    // Step navigation buttons
    document.getElementById('continueToDetails').addEventListener('click', validateAndContinueToDetails);
    document.getElementById('backToOrder').addEventListener('click', () => goToStep(1));
    document.getElementById('continueToShipping').addEventListener('click', validateAndContinueToShipping);
    document.getElementById('backToDetails').addEventListener('click', () => goToStep(2));
    document.getElementById('continueToPayment').addEventListener('click', () => goToStep(4));
    document.getElementById('backToShipping').addEventListener('click', () => goToStep(3));
    document.getElementById('completePayment').addEventListener('click', handlePayment);

    // Coupon code functionality
    document.getElementById('applyCoupon').addEventListener('click', applyCouponCode);
    document.getElementById('couponCode').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            applyCouponCode();
        }
    });

    // Shipping method selection
    const shippingRadios = document.querySelectorAll('input[name="shippingMethod"]');
    shippingRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            checkoutState.shippingMethod = this.value;
            checkoutState.shippingCost = this.value === 'express' ? 44 : 0;
            updateOrderSummary();
        });
    });
}

function adjustQuantity(change) {
    const newQty = checkoutState.quantity + change;
    if (newQty >= 1 && newQty <= 99) {
        checkoutState.quantity = newQty;
        document.getElementById('checkoutQuantity').value = newQty;
        updateQuantityDisplay(newQty);
        updateOrderSummary();
        // Regenerate certificate name fields
        generatePlotDetailsForms();
    }
}

function updateQuantityDisplay(quantity) {
    document.getElementById('reviewQuantity').textContent = quantity;
    document.getElementById('checkoutQuantity').value = quantity;
}

function updateOrderSummary() {
    const quantity = checkoutState.quantity;
    const subtotal = quantity * checkoutState.basePrice;

    let discountAmount = 0;
    let discountCode = '';

    // Check for automatic volume discount (6+ items = 10% off)
    if (quantity >= 6 && !checkoutState.discount) {
        checkoutState.volumeDiscount = {
            code: 'VOLUME DISCOUNT',
            type: 'percentage',
            value: 10,
            amount: 0
        };
    } else if (quantity < 6) {
        // Remove volume discount if quantity drops below 6
        checkoutState.volumeDiscount = null;
    }

    // Calculate coupon discount if applied
    if (checkoutState.discount) {
        if (checkoutState.discount.type === 'percentage') {
            discountAmount = (subtotal * checkoutState.discount.value / 100);
        } else if (checkoutState.discount.type === 'fixed') {
            discountAmount = checkoutState.discount.value;
        }
        checkoutState.discount.amount = discountAmount;
        discountCode = checkoutState.discount.code;
    }
    // Otherwise, apply volume discount if eligible
    else if (checkoutState.volumeDiscount) {
        discountAmount = (subtotal * checkoutState.volumeDiscount.value / 100);
        checkoutState.volumeDiscount.amount = discountAmount;
        discountCode = checkoutState.volumeDiscount.code;
    }

    // Add shipping cost to get final total
    const total = Math.max(0, subtotal - discountAmount + checkoutState.shippingCost);

    document.getElementById('summaryQuantity').textContent = quantity;
    document.getElementById('summarySubtotal').textContent = `$${subtotal.toFixed(2)}`;

    // Update discount display
    const discountLine = document.getElementById('summaryDiscountLine');
    if (discountAmount > 0) {
        document.getElementById('summaryDiscountCode').textContent = discountCode;
        document.getElementById('summaryDiscount').textContent = `-$${discountAmount.toFixed(2)}`;
        discountLine.classList.remove('hidden');
    } else {
        discountLine.classList.add('hidden');
    }

    // Update shipping display
    const shippingElement = document.getElementById('summaryShipping');
    if (shippingElement) {
        if (checkoutState.shippingCost > 0) {
            shippingElement.innerHTML = `$${checkoutState.shippingCost.toFixed(2)}`;
        } else {
            shippingElement.innerHTML = '<span class="free-badge">FREE</span>';
        }
    }

    document.getElementById('summaryTotal').textContent = `$${total.toFixed(2)}`;
    document.getElementById('finalTotal').textContent = total.toFixed(2);

    // Show/hide volume discount notification
    const volumeNotification = document.getElementById('volume-discount-notification');
    if (volumeNotification) {
        if (checkoutState.volumeDiscount && !checkoutState.discount) {
            volumeNotification.classList.remove('hidden');
        } else {
            volumeNotification.classList.add('hidden');
        }
    }
}

function goToStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.checkout-step').forEach(step => {
        step.classList.add('hidden');
    });

    // Remove active class from all progress steps
    document.querySelectorAll('.progress-step').forEach(step => {
        step.classList.remove('active');
    });

    // Show current step
    document.getElementById(`step${stepNumber}`).classList.remove('hidden');

    // Update progress indicator
    for (let i = 1; i <= stepNumber; i++) {
        document.querySelector(`.progress-step[data-step="${i}"]`).classList.add('active');
    }

    checkoutState.currentStep = stepNumber;

    // Special actions for each step
    if (stepNumber === 4) {
        // Populate review summary before payment
        populateReviewSummary();
        // Initialize Square payment form
        initializeSquare();
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function generatePlotDetailsForms() {
    const container = document.getElementById('plotDetailsContainer');

    // Save existing values before regenerating
    const existingValues = {};
    const existingInputs = container.querySelectorAll('.certificate-input');
    existingInputs.forEach(input => {
        existingValues[input.dataset.plot] = input.value;
    });

    container.innerHTML = '';

    for (let i = 1; i <= checkoutState.quantity; i++) {
        const plotForm = createCertificateNameInput(i);
        container.appendChild(plotForm);

        // Restore existing value if it exists
        if (existingValues[i]) {
            const input = plotForm.querySelector('.certificate-input');
            if (input) {
                input.value = existingValues[i];
            }
        }
    }
}

function createCertificateNameInput(plotNumber) {
    const formDiv = document.createElement('div');
    formDiv.className = 'certificate-name-input';
    formDiv.dataset.plotNumber = plotNumber;

    formDiv.innerHTML = `
        <div class="form-group">
            <label for="certificateName${plotNumber}">Plot #${plotNumber} - Name on Certificate *</label>
            <input type="text"
                   id="certificateName${plotNumber}"
                   name="certificateName"
                   required
                   data-plot="${plotNumber}"
                   class="certificate-input"
                   placeholder="e.g., John Michael O'Connor">
            <small class="input-hint">This name will appear on the official title deed exactly as entered</small>
        </div>
    `;

    return formDiv;
}

function validateAndContinueToDetails() {
    // Collect certificate names
    const certificateNames = collectCertificateNames();

    if (!certificateNames) {
        alert('Please enter a name for each certificate.');
        return;
    }

    // Store certificate names
    checkoutState.plots = certificateNames;

    // Continue to details
    goToStep(2);
}

function validateAndContinueToShipping() {
    // Validate and collect contact/delivery information
    const customerInfo = validateCustomerDetails();

    if (!customerInfo) {
        return; // Error message already shown
    }

    // Store customer information
    checkoutState.customerInfo = customerInfo;

    // Continue to shipping selection
    goToStep(3);
}

function validateCustomerDetails() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address1 = document.getElementById('address1').value.trim();
    const address2 = document.getElementById('address2').value.trim();
    const city = document.getElementById('city').value.trim();
    const state = document.getElementById('state').value.trim();
    const zip = document.getElementById('zip').value.trim();
    const country = document.getElementById('country').value;

    // Check required fields
    if (!firstName || !lastName || !email || !phone || !address1 || !city || !state || !zip || !country) {
        alert('Please fill in all required fields.');
        return null;
    }

    // Validate email
    if (!validateEmail(email)) {
        alert('Please enter a valid email address.');
        return null;
    }

    return {
        firstName,
        lastName,
        email,
        phone,
        address1,
        address2,
        city,
        state,
        zip,
        country
    };
}

function populateReviewSummary() {
    const info = checkoutState.customerInfo;

    // Update plot count
    document.getElementById('reviewPlotCount').textContent = checkoutState.quantity;

    // Update name
    document.getElementById('reviewDeliveryName').textContent = `${info.firstName} ${info.lastName}`;

    // Update address
    const addressParts = [
        info.address1,
        info.address2,
        `${info.city}, ${info.state} ${info.zip}`,
        info.country
    ].filter(Boolean);

    document.getElementById('reviewAddress').innerHTML = addressParts.join('<br>');

    // Update shipping method
    const shippingMethodText = checkoutState.shippingMethod === 'express'
        ? 'Tracked Express Shipping ($44.00)'
        : 'Standard Airmail (Free)';
    document.getElementById('reviewShippingMethod').textContent = shippingMethodText;
}

function collectCertificateNames() {
    const certificateNames = [];
    const inputs = document.querySelectorAll('.certificate-input');

    for (let input of inputs) {
        const name = input.value.trim();

        if (!name) {
            return null; // Required field empty
        }

        certificateNames.push({
            plotNumber: parseInt(input.dataset.plot),
            certificateName: name
        });
    }

    return certificateNames;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Coupon Code Functionality
async function applyCouponCode() {
    const couponInput = document.getElementById('couponCode');
    const couponCode = couponInput.value.trim().toUpperCase();
    const statusContainer = document.getElementById('coupon-status');
    const applyButton = document.getElementById('applyCoupon');

    // Clear previous status
    statusContainer.innerHTML = '';

    if (!couponCode) {
        statusContainer.innerHTML = '<div class="coupon-error">Please enter a coupon code</div>';
        return;
    }

    // Disable button during validation
    applyButton.disabled = true;
    applyButton.textContent = 'Validating...';

    try {
        // Validate coupon with backend
        const discount = await validateCoupon(couponCode);

        if (discount) {
            // Apply discount
            checkoutState.discount = {
                code: couponCode,
                type: discount.type,
                value: discount.value,
                amount: 0  // Will be calculated in updateOrderSummary
            };

            // Update order summary
            updateOrderSummary();

            // Show success message
            const savingsMsg = discount.type === 'percentage'
                ? `${discount.value}% off`
                : `$${discount.value.toFixed(2)} off`;

            statusContainer.innerHTML = `<div class="coupon-success">✓ Coupon applied! You're saving ${savingsMsg}</div>`;

            // Disable input and button
            couponInput.disabled = true;
            applyButton.textContent = 'Applied';
        } else {
            throw new Error('Invalid coupon code');
        }
    } catch (error) {
        statusContainer.innerHTML = `<div class="coupon-error">✗ ${error.message}</div>`;
        applyButton.disabled = false;
        applyButton.textContent = 'Apply';
    }
}

async function validateCoupon(couponCode) {
    // Client-side validation for hardcoded coupon codes
    // All orders are manually processed, so abuse will be caught during review

    // Active coupon codes
    const validCoupons = {
        'RESELLER10': { type: 'percentage', value: 10 }  // 10% off for known resellers
    };

    // Simulate validation delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (validCoupons[couponCode]) {
        return validCoupons[couponCode];
    }

    // If you have a backend endpoint, use this instead:
    /*
    try {
        const response = await fetch('/api/validate-coupon', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code: couponCode })
        });

        if (!response.ok) {
            throw new Error('Invalid coupon code');
        }

        const data = await response.json();
        return data.discount;  // Should return { type: 'percentage' | 'fixed', value: number }
    } catch (error) {
        throw new Error('Invalid coupon code');
    }
    */

    return null;
}

// Square Payment Integration
async function initializeSquare() {
    // Skip if already initialized
    if (checkoutState.payments) {
        return;
    }

    try {
        // Check if Square is loaded
        if (!window.Square) {
            throw new Error('Square.js SDK failed to load. Please check your internet connection.');
        }

        console.log('Initializing Square with:', {
            appId: SQUARE_APPLICATION_ID,
            locationId: SQUARE_LOCATION_ID
        });

        // Initialize Square Payments
        checkoutState.payments = await window.Square.payments(
            SQUARE_APPLICATION_ID,
            SQUARE_LOCATION_ID
        );

        // Initialize Card Payment with styling options
        checkoutState.card = await checkoutState.payments.card({
            style: {
                '.input-container': {
                    borderColor: '#d1d5db',
                    borderRadius: '8px'
                },
                '.input-container.is-focus': {
                    borderColor: '#2d6a4f'
                },
                '.input-container.is-error': {
                    borderColor: '#dc2626'
                },
                '.message-text': {
                    color: '#6b7280'
                },
                '.message-icon': {
                    color: '#2d6a4f'
                }
            }
        });
        await checkoutState.card.attach('#card-container');

        console.log('Square payment form initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Square:', error);

        // Show detailed error message
        let errorMessage = 'Failed to load payment form. ';
        if (error.message) {
            errorMessage += error.message;
        } else {
            errorMessage += 'Please refresh the page and try again.';
        }

        displayPaymentError(errorMessage);
    }
}

async function handlePayment() {
    const paymentButton = document.getElementById('completePayment');
    paymentButton.disabled = true;
    paymentButton.textContent = 'Processing...';

    try {
        // Get billing information
        const billingInfo = getBillingInformation();

        // Tokenize the card
        const result = await checkoutState.card.tokenize();

        if (result.status === 'OK') {
            // Send payment to backend
            await processPayment(result.token, billingInfo);
        } else {
            let errorMessage = 'Payment failed. Please check your card details.';
            if (result.errors) {
                errorMessage = result.errors.map(error => error.message).join(', ');
            }
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('Payment error:', error);
        displayPaymentError(error.message);
        paymentButton.disabled = false;
        paymentButton.innerHTML = `Complete Purchase - $<span id="finalTotal">${(checkoutState.quantity * checkoutState.basePrice).toFixed(2)}</span>`;
    }
}

function getBillingInformation() {
    // Get customer information from form
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address1 = document.getElementById('address1').value.trim();
    const address2 = document.getElementById('address2').value.trim();
    const city = document.getElementById('city').value.trim();
    const state = document.getElementById('state').value.trim();
    const zip = document.getElementById('zip').value.trim();
    const country = document.getElementById('country').value;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !address1 || !city || !state || !zip || !country) {
        throw new Error('Please fill in all required contact and delivery information.');
    }

    // Validate email
    if (!validateEmail(email)) {
        throw new Error('Please enter a valid email address.');
    }

    return {
        givenName: firstName,
        familyName: lastName,
        email: email,
        phone: phone,
        addressLines: [address1, address2].filter(Boolean),
        city: city,
        state: state,
        postalCode: zip,
        countryCode: country
    };
}

async function processPayment(token, billingInfo) {
    // Calculate subtotal
    const subtotal = checkoutState.quantity * checkoutState.basePrice;

    // Calculate discount amount (from either coupon or volume discount)
    let discountAmount = 0;
    let appliedDiscount = null;

    if (checkoutState.discount) {
        discountAmount = checkoutState.discount.amount || 0;
        appliedDiscount = checkoutState.discount;
    } else if (checkoutState.volumeDiscount) {
        discountAmount = checkoutState.volumeDiscount.amount || 0;
        appliedDiscount = checkoutState.volumeDiscount;
    }

    // Calculate total amount (subtract discount, add shipping)
    const totalAmount = Math.max(0, subtotal - discountAmount + checkoutState.shippingCost);
    const amountInCents = Math.round(totalAmount * 100);
    const amountInDollars = (amountInCents / 100).toFixed(2);

    // Prepare order data
    const orderData = {
        sourceId: token,
        amountMoney: {
            amount: amountInCents,
            currency: 'USD'
        },
        locationId: SQUARE_LOCATION_ID,
        idempotencyKey: window.crypto.randomUUID(),
        billingContact: billingInfo,
        plots: checkoutState.plots,
        quantity: checkoutState.quantity,
        discount: appliedDiscount,  // Include discount information (coupon or volume)
        shipping: {
            method: checkoutState.shippingMethod,
            cost: checkoutState.shippingCost
        }
    };

    // TODO: Replace this URL with your actual backend endpoint
    const BACKEND_URL = '/api/process-payment'; // Update this with your backend URL

    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Payment processing failed');
        }

        const result = await response.json();

        // Payment successful!
        handlePaymentSuccess(result);
    } catch (error) {
        throw new Error(`Payment processing failed: ${error.message}`);
    }
}

function handlePaymentSuccess(result) {
    // Clear checkout state
    localStorage.removeItem('checkoutQuantity');

    // Redirect to success page or show success message
    // For now, show an alert (replace with proper success page)
    alert(`Payment successful! Order ID: ${result.orderId || 'N/A'}\n\nYou will receive a confirmation email shortly.`);

    // Redirect to home or thank you page
    window.location.href = 'index.html?purchase=success';
}

function displayPaymentError(message) {
    const statusContainer = document.getElementById('payment-status-container');
    statusContainer.innerHTML = `
        <div class="payment-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="24" height="24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p>${message}</p>
        </div>
    `;
}

// Save checkout state to localStorage when leaving page
window.addEventListener('beforeunload', function() {
    localStorage.setItem('checkoutQuantity', checkoutState.quantity);
});
