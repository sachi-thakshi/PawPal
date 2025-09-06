// Simulate user data
const user = {
  name: "Alex",
  avatarUrl: null
};

const avatarContainer = document.getElementById("user-avatar");
if (user.avatarUrl) {
  const img = document.createElement("img");
  img.src = user.avatarUrl;
  img.alt = "User Avatar";
  img.className = "rounded-circle";
  img.width = 36;
  img.height = 36;
  avatarContainer.innerHTML = '';
  avatarContainer.appendChild(img);
} else {
  const initial = user.name ? user.name.charAt(0).toUpperCase() : "?";
  avatarContainer.textContent = initial;
  avatarContainer.style.fontWeight = "700";
  avatarContainer.style.fontSize = "1.2rem";
  avatarContainer.style.userSelect = "none";
}

document.addEventListener("DOMContentLoaded", async () => {
  const checkoutItemsContainer = document.getElementById("checkout-items");
  const checkoutTotal = document.getElementById("checkout-total");
  const checkoutForm = document.getElementById("checkout-form");
  const paymentMethodSelect = document.getElementById("paymentMethod");
  const cardContainer = document.getElementById("card-container");
  const cardErrors = document.getElementById("card-errors");

  let stripe, cardElement;

  function formatPrice(price) {
    return `$${price.toFixed(2)}`;
  }

  function calculateCartTotal() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    return Math.round(cart.reduce((acc, item) => acc + item.price * item.quantity, 0) * 100); // in cents
  }

  function renderCheckoutItems() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    checkoutItemsContainer.innerHTML = '';

    if (cart.length === 0) {
      checkoutItemsContainer.innerHTML = '<p class="text-center">Your cart is empty.</p>';
      checkoutForm.style.display = 'none';
      checkoutTotal.textContent = 'Total: $0.00';
      return;
    }

    let total = 0;

    cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;

      const itemDiv = document.createElement('div');
      itemDiv.className = "checkout-item border-bottom py-3 d-flex justify-content-between";

      itemDiv.innerHTML = `
        <div>
          <h5>${item.name}</h5>
          <p>Quantity: ${item.quantity}</p>
          <p>Unit Price: ${formatPrice(item.price)}</p>
        </div>
        <div class="fw-bold align-self-center">${formatPrice(itemTotal)}</div>
      `;

      checkoutItemsContainer.appendChild(itemDiv);
    });

    checkoutTotal.textContent = `Total: ${formatPrice(total)}`;
  }

  // 💳 Initialize Stripe (only if needed)
  if (window.Stripe) {
    stripe = Stripe("YOUR_STRIPE_PUBLISHABLE_KEY"); //  Replace this with your real key
    const elements = stripe.elements();
    cardElement = elements.create("card");
    cardElement.mount("#card-element");
  }

  // Show/hide card input dynamically
  paymentMethodSelect.addEventListener("change", () => {
    if (paymentMethodSelect.value === "card") {
      cardContainer.style.display = "block";
    } else {
      cardContainer.style.display = "none";
      cardErrors.textContent = '';
    }
  });

  checkoutForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const address = document.getElementById("address").value.trim();
    const paymentMethod = paymentMethodSelect.value;

    if (!fullName || !address || !paymentMethod) {
      Swal.fire("Incomplete!", "Please fill in all required fields.", "warning");
      return;
    }

    // 💵 If COD
    if (paymentMethod !== "card") {
      Swal.fire("Order Placed!", "Cash on delivery selected.", "success").then(() => {
        localStorage.removeItem("cart");
        window.location.href = "/pages/pet-owner-dashboard.html";
      });
      return;
    }

    // 💳 Card Payment Flow
    try {
      const response = await fetch("/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ amount: calculateCartTotal() })
      });

      const { clientSecret, error: backendError } = await response.json();

      if (backendError) throw new Error(backendError);

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: fullName
          }
        }
      });

      if (error) {
        cardErrors.textContent = error.message;
        return;
      }

      if (paymentIntent.status === "succeeded") {
        Swal.fire("Payment Successful", "Thank you for your purchase!", "success").then(() => {
          localStorage.removeItem("cart");
          window.location.href = "/pages/pet-owner-dashboard.html";
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Something went wrong while processing your payment.", "error");
    }
  });

  renderCheckoutItems();
});
