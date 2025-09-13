document.addEventListener('DOMContentLoaded', () => {
  loadPetItems();
});

let allItems = [];

async function loadPetItems() {
  try {
    const token = localStorage.getItem('jwtToken');
    if (!token) throw new Error("No JWT token found");

    const response = await fetch('http://localhost:8080/pet-items/all', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch pet items: ${response.status}`);
    }

    const result = await response.json();

    if (result.status === 200) {
      allItems = result.data;
      renderPetItems(allItems);
      setupCategoryFilters();
    } else {
      throw new Error(`Error: ${result.message}`);
    }
  } catch (error) {
    console.error("Error loading pet items:", error);
    document.getElementById('shop-items').innerHTML =
        `<div class="alert alert-danger">Failed to load pet items.</div>`;
  }
}

function renderPetItems(items) {
  const container = document.getElementById('shop-items');
  container.innerHTML = '';

  items.forEach(item => {
    const itemHtml = `
    <div class="col-md-4 mb-4 pet-item" data-category="${item.petItemCategory}">
      <div class="card h-100">
        <img src="${item.petItemImageUrl || ''}" class="card-img-top" alt="${item.petItemName}">
        <div class="card-body">
          <h5 class="card-title">${item.petItemName}</h5>
          <p class="card-text">${item.petItemDescription}</p>
          <p class="card-text"><strong>LKR ${item.petItemPrice.toFixed(2)}</strong></p>
          <button class="btn btn-primary add-to-cart" 
            data-id="${item.petItemId}" 
            data-name="${item.petItemName}" 
            data-price="${item.petItemPrice}">Add to Cart</button>
        </div>
      </div>
    </div>
  `;
    container.insertAdjacentHTML('beforeend', itemHtml);
  });

  attachAddToCartListeners();
}

function setupCategoryFilters() {
  const filterContainer = document.getElementById('category-filters');
  if (!filterContainer) return;

  filterContainer.innerHTML = '';

  const categories = [...new Set(allItems.map(item => item.petItemCategory))].sort();

  const allBtn = document.createElement('button');
  allBtn.classList.add('btn', 'btn-primary', 'm-1');
  allBtn.textContent = 'All';
  allBtn.addEventListener('click', () => {
    renderPetItems(allItems);
    setActiveCategoryButton('All');
  });
  filterContainer.appendChild(allBtn);

  categories.forEach(category => {
    const btn = document.createElement('button');
    btn.classList.add('btn', 'btn-outline-primary', 'm-1');
    btn.textContent = category;

    btn.addEventListener('click', () => {
      filterByCategory(category);
      setActiveCategoryButton(category);
    });

    filterContainer.appendChild(btn);
  });

  setActiveCategoryButton('All');
}

function filterByCategory(category) {
  if (category === 'All') {
    renderPetItems(allItems);
  } else {
    const filtered = allItems.filter(item => item.petItemCategory.toLowerCase() === category.toLowerCase());
    renderPetItems(filtered);
  }
}

function setActiveCategoryButton(activeCategory) {
  const buttons = document.querySelectorAll('#category-filters button');
  buttons.forEach(btn => {
    if (btn.textContent === activeCategory) {
      btn.classList.add('btn-primary');
      btn.classList.remove('btn-outline-primary');
    } else {
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-outline-primary');
    }
  });
}

function attachAddToCartListeners() {
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
}
