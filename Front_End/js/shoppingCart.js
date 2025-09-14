const cartItemsContainer = document.getElementById('cart-items');
const totalPriceEl = document.getElementById('total-price');
const clearCartBtn = document.getElementById('clear-cart');

function formatPrice(price) {
  return `LKR${price.toFixed(2)}`;
}

function renderCart() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];

  cartItemsContainer.innerHTML = '';

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="text-center">Your cart is empty.</p>';
    totalPriceEl.textContent = 'Total: LKR0.00';
    clearCartBtn.disabled = true;
    return;
  }

  clearCartBtn.disabled = false;

  let total = 0;

  cart.forEach(item => {
    total += item.price * item.quantity;

    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item d-flex justify-content-between align-items-center mb-3 border rounded p-3';

    itemEl.innerHTML = `
      <div class="item-info">
        <h5 class="mb-1">${item.name}</h5>
        <p class="mb-1">Price: ${formatPrice(item.price)}</p>
        <div>
          Quantity: 
          <input type="number" min="1" value="${item.quantity}" class="quantity-input" data-id="${item.id}" style="width:60px;">
          <button class="btn btn-sm btn-danger ms-2 remove-item" data-id="${item.id}">Remove</button>
        </div>
      </div>
      <div class="item-subtotal fw-bold">${formatPrice(item.price * item.quantity)}</div>
    `;

    cartItemsContainer.appendChild(itemEl);
  });

  totalPriceEl.textContent = `Total: ${formatPrice(total)}`;

  document.querySelectorAll('.quantity-input').forEach(input => {
    input.addEventListener('change', e => {
      const id = e.target.dataset.id;
      let newQuantity = parseInt(e.target.value);
      if (isNaN(newQuantity) || newQuantity < 1) {
        newQuantity = 1;
        e.target.value = 1;
      }
      updateQuantity(id, newQuantity);
    });
  });

  document.querySelectorAll('.remove-item').forEach(button => {
    button.addEventListener('click', e => {
      const id = e.target.dataset.id;
      removeItem(id);
    });
  });
}

function updateQuantity(id, quantity) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const item = cart.find(i => i.id === id);
  if (item) {
    item.quantity = quantity;
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
  }
}

function removeItem(id) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart = cart.filter(i => i.id !== id);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

clearCartBtn.addEventListener('click', () => {
  Swal.fire({
    title: 'Are you sure?',
    text: "Do you want to clear your cart?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, clear it!',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem('cart');
      renderCart();
      Swal.fire(
        'Cleared!',
        'Your cart has been emptied.',
        'success'
      );
    }
  });
});

renderCart();

document.getElementById("checkout-btn").addEventListener("click", () => {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    Swal.fire({
      icon: 'info',
      title: 'Your cart is empty',
      text: 'Add some items before proceeding to checkout.',
    });
    return;
  }

  window.location.href = "../pages/shopping-checkout.html";
});