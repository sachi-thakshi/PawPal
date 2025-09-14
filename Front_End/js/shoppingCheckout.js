const cartItemsContainer = document.getElementById('cartItems');
const subtotalEl = document.getElementById('subtotal');
const shippingEl = document.getElementById('shipping');
const totalEl = document.getElementById('total');
const proceedPaymentBtn = document.getElementById('proceedPayment');
const cardForm = document.getElementById('cardForm');

// ======= Cart functions =======
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function setCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Render cart items
function renderCartItems() {
    const cart = getCart();

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-center text-muted">Your cart is empty</p>';
        updateOrderSummary();
        return;
    }

    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item mb-3 p-2 border rounded">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6>${item.name}</h6>
                    <small>Price: LKR${item.price.toFixed(2)}</small>
                </div>
                <div class="d-flex align-items-center">
                    <button class="btn btn-sm btn-outline-secondary me-2" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button class="btn btn-sm btn-outline-secondary ms-2" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    <button class="btn btn-sm btn-danger ms-3" onclick="removeItem(${item.id})">Remove</button>
                </div>
                <div>
                    <strong>LKR${(item.price * item.quantity).toFixed(2)}</strong>
                </div>
            </div>
        </div>
    `).join('');

    updateOrderSummary();
}

function updateQuantity(itemId, newQty) {
    if (newQty < 1) return;
    const cart = getCart();
    const item = cart.find(i => i.id === itemId);
    if (item) {
        item.quantity = newQty;
        setCart(cart);
        renderCartItems();
    }
}

function removeItem(itemId) {
    let cart = getCart();
    cart = cart.filter(i => i.id !== itemId);
    setCart(cart);
    renderCartItems();
}

// Order summary calculation
function updateOrderSummary() {
    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal > 0 ? 300 : 0;
    const total = subtotal + shipping;

    subtotalEl.textContent = `LKR${subtotal.toFixed(2)}`;
    shippingEl.textContent = `LKR${shipping.toFixed(2)}`;
    totalEl.textContent = `LKR${total.toFixed(2)}`;
}

// ======= Payment selection =======
document.querySelectorAll('.payment-method').forEach(method => {
    method.addEventListener('click', function() {
        document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
        this.classList.add('selected');
        this.querySelector('input[type="radio"]').checked = true;

        cardForm.style.display = this.dataset.method === 'card' ? 'block' : 'none';
    });
});

// Card input formatting & validation
document.getElementById('cardNumber').addEventListener('input', e => {
    let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/g, '');
    e.target.value = value.match(/.{1,4}/g)?.join(' ') || value;
});
document.getElementById('cvv').addEventListener('input', e => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
});

// ======= Place Order =======
proceedPaymentBtn.addEventListener('click', () => {
    const cart = getCart();
    if (cart.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Empty Cart', text: 'Add items to your cart before proceeding.' });
        return;
    }

    // Validate customer details
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();

    if (!firstName || !lastName || !email || !phone || !address) {
        Swal.fire({ icon: 'warning', title: 'Incomplete Info', text: 'Please fill in all customer details.' });
        return;
    }

    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
    if (!paymentMethod) {
        Swal.fire({ icon: 'warning', title: 'Payment Required', text: 'Please select a payment method.' });
        return;
    }

    if (paymentMethod === 'card' && !validateCard()) return;

    confirmOrder(paymentMethod, { firstName, lastName, email, phone, address }, cart);
});

// Validate card
function validateCard() {
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const expiryMonth = document.getElementById('expiryMonth').value;
    const expiryYear = document.getElementById('expiryYear').value;
    const cvv = document.getElementById('cvv').value;
    const cardHolder = document.getElementById('cardHolder').value.trim();

    if (!cardNumber || !expiryMonth || !expiryYear || !cvv || !cardHolder) {
        Swal.fire({ icon: 'warning', title: 'Incomplete Card Details', text: 'Fill in all card fields.' });
        return false;
    }

    if (cardNumber.length !== 16) {
        Swal.fire({ icon: 'error', title: 'Invalid Card', text: 'Card number must be 16 digits.' });
        return false;
    }

    if (cvv.length !== 3) {
        Swal.fire({ icon: 'error', title: 'Invalid CVV', text: 'CVV must be 3 digits.' });
        return false;
    }

    return true;
}

// Confirm and send order
function confirmOrder(paymentMethod, customer, cart) {
    Swal.fire({
        title: 'Confirm Order',
        text: `Payment Method: ${paymentMethod.toUpperCase()}`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, Place Order'
    }).then(result => {
        if (result.isConfirmed) {
            sendOrderToBackend(paymentMethod, customer, cart);
        }
    });
}

// Send order to backend and trigger email
function sendOrderToBackend(paymentMethod, customer, cart) {
    const token = localStorage.getItem('jwtToken');

    const orderRequest = {
        customerName: `${customer.firstName} ${customer.lastName}`,
        customerAddress: customer.address,
        customerEmail: customer.email,
        paymentMethod: paymentMethod,
        items: cart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
        }))
    };

    fetch('http://localhost:8080/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderRequest)
    })
        .then(res => res.json())
        .then(data => {
            Swal.fire({
                icon: 'success',
                title: 'Order Placed!',
                html: `<p>Order ID: ${data.orderId || 'N/A'}</p><p>An invoice has been sent to your email.</p>`,
                confirmButtonText: 'Continue Shopping'
            }).then(() => {
                localStorage.removeItem('cart');
                window.location.href = '../pages/our-shop.html';
            });
        })
        .catch(err => {
            console.error(err);
            Swal.fire({ icon: 'error', title: 'Order Failed', text: 'Something went wrong. Try again.' });
        });
}

// Initialize page
document.addEventListener('DOMContentLoaded', renderCartItems);
