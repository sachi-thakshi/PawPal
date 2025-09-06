// Simulate user data
const user = {
  name: "Alex", // fallback name
  avatarUrl: null // or provide URL like "/images/alex.jpg"
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

// Add items to cart with SweetAlert confirmation
document.querySelectorAll(".add-to-cart").forEach(button => {
  button.addEventListener("click", () => {
    const item = {
      id: button.dataset.id,
      name: button.dataset.name,
      price: parseFloat(button.dataset.price),
      quantity: 1
    };

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push(item);
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    Swal.fire({
      icon: 'success',
      title: 'Added to cart',
      text: `${item.name} has been added to your cart.`,
      timer: 1500,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  });
});

// Clear cart button listener (make sure clearCartBtn is defined in your script)
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
      renderCart(); // Make sure renderCart() is defined to refresh cart display
      Swal.fire(
        'Cleared!',
        'Your cart has been emptied.',
        'success'
      );
    }
  });
});
