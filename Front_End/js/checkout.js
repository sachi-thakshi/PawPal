const API_BASE_URL = 'http://localhost:8080/payment';

// Store total globally for payment submission
let orderTotal = 0;

// Render cart summary from localStorage
function renderOrderSummary() {
    const orderSummaryDiv = document.querySelector('.order-summary');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        orderSummaryDiv.innerHTML = '<h2>📋 Order Summary</h2><p>Your cart is empty.</p>';
        return 0;
    }

    orderSummaryDiv.innerHTML = '<h2>📋 Order Summary</h2>';

    // Add cart items
    cart.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('order-item');
        itemDiv.innerHTML = `
            <span>${item.name} x${item.quantity}</span>
            <span>LKR ${(item.price * item.quantity).toFixed(2)}</span>
        `;
        orderSummaryDiv.appendChild(itemDiv);
    });

    // Totals
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = 300.00;
    const total = subtotal + shipping;

    const summaryData = [
        { label: 'Subtotal', value: subtotal },
        { label: 'Shipping', value: shipping },
        { label: 'Total', value: total },
    ];

    summaryData.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('order-item');
        div.innerHTML = `<span>${item.label}</span><span>LKR ${item.value.toFixed(2)}</span>`;
        orderSummaryDiv.appendChild(div);
    });

    const buttonText = document.getElementById('buttonText');
    if (buttonText) {
        buttonText.textContent = `🔒 Pay LKR ${total.toFixed(2)} with PayHere`;
    }

    return total;
}

// Load summary on page ready
document.addEventListener('DOMContentLoaded', () => {
    orderTotal = renderOrderSummary();
    testBackendConnection();
});

// Form submission
document.getElementById('checkoutForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const payButton = document.getElementById('payButton');
    const buttonText = document.getElementById('buttonText');
    const loading = document.getElementById('loading');
    const successAlert = document.getElementById('successAlert');
    const errorAlert = document.getElementById('errorAlert');
    const errorMessage = document.getElementById('errorMessage');

    successAlert.style.display = 'none';
    errorAlert.style.display = 'none';

    if (!validateForm()) {
        showError('Please fill in all required fields correctly.');
        return;
    }

    payButton.disabled = true;
    buttonText.style.display = 'none';
    loading.style.display = 'block';

    const formData = new FormData(this);

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemDescription = cart.map(i => `${i.name} x${i.quantity}`).join(', ') || 'No items';

    const paymentRequest = {
        amount: orderTotal || 3300.00,
        currency: 'LKR',
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        city: formData.get('city'),
        country: formData.get('country'),
        itemDescription
    };

    console.log('Sending payment request:', paymentRequest);

    fetch(`${API_BASE_URL}/process`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentRequest)
    })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const contentType = response.headers.get('content-type');
            if (!contentType.includes('application/json')) throw new Error('Expected JSON response');
            return response.json();
        })
        .then(data => {
            if (data.success) {
                successAlert.style.display = 'block';

                const payhereForm = document.getElementById('payhere-payment');
                payhereForm.action = data.paymentUrl;
                payhereForm.innerHTML = '';

                Object.entries(data.paymentData).forEach(([key, value]) => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = value;
                    payhereForm.appendChild(input);
                });

                if (!payhereForm.action || payhereForm.action.includes('undefined')) {
                    showError('Invalid payment URL. Please try again.');
                    return;
                }

                setTimeout(() => payhereForm.submit(), 1500);
            } else {
                showError(data.error || 'Payment failed');
            }
        })
        .catch(error => {
            console.error('Payment error:', error);
            if (error.message.includes('fetch')) {
                showError('Could not connect to backend. Make sure it is running.');
            } else {
                showError(error.message);
            }
        });

    function showError(message) {
        errorMessage.textContent = message;
        errorAlert.style.display = 'block';
        resetButton();
    }

    function resetButton() {
        payButton.disabled = false;
        buttonText.style.display = 'block';
        loading.style.display = 'none';
    }
});

// Validate form fields
function validateForm() {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city'];
    let isValid = true;

    requiredFields.forEach(id => {
        const field = document.getElementById(id);
        if (!field.value.trim()) {
            field.style.borderColor = '#003092';
            isValid = false;
        } else {
            field.style.borderColor = '#e9ecef';
        }
    });

    const email = document.getElementById('email').value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        document.getElementById('email').style.borderColor = '#003092';
        isValid = false;
    }

    return isValid;
}

// Validate email on blur
document.getElementById('email').addEventListener('blur', function () {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value);
    this.style.borderColor = valid ? '#e9ecef' : '#003092';
});

// Validate phone on blur (Sri Lankan format)
document.getElementById('phone').addEventListener('blur', function () {
    const phone = this.value.replace(/\s/g, '');
    const valid = /^(\+94|94|0)?[0-9]{9}$/.test(phone);
    this.style.borderColor = valid ? '#e9ecef' : '#003092';
});

// Ping backend server on load
function testBackendConnection() {
    fetch(`${API_BASE_URL.replace('/payment', '')}/health`)
        .then(res => res.text())
        .then(msg => console.log('✅ Backend connection:', msg))
        .catch(err => console.error('❌ Backend down:', err));
}
