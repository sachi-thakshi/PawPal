function initPetItemsManagement() {
    const API_BASE_ITEMS = "http://localhost:8080/pet-items";
    const token = localStorage.getItem("jwtToken");

    if (!token) {
        console.error("No token found, redirecting to login...");
        window.location.href = "../pages/authentication.html";
        return;
    }

    const itemForm = document.getElementById('itemForm');
    const editItemForm = document.getElementById('editItemForm');
    const itemsTableBody = document.getElementById('itemsTableBody');
    const editModal = document.getElementById('editModal');
    const closeModal = document.querySelector('.close');

    // Detail Modal Elements
    const detailModal = document.getElementById('detailModal');
    const closeDetailBtn = document.querySelector('.close-detail');

    if (!itemForm || !itemsTableBody) {
        console.error("Required DOM elements not found.");
        return;
    }

    let items = [];

    // Fetch all pet items
    async function fetchItems() {
        try {
            const res = await fetch(`${API_BASE_ITEMS}/all`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to fetch items");

            const apiResponse = await res.json();
            items = apiResponse.data || [];
            renderItemsTable();
        } catch (err) {
            console.error("Error fetching items:", err);
            Swal.fire("Error", "Could not load pet items", "error");
        }
    }

    // Render items table
    function renderItemsTable() {
        itemsTableBody.innerHTML = '';
        items.forEach((item, index) => {
            const stockStatus = getStockStatus(item.quantity);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td><img src="${item.petItemImageUrl || 'https://via.placeholder.com/50'}" alt="Item" class="item-thumb"></td>
                <td><strong>${item.petItemName}</strong></td>
                <td><span class="category-tag">${item.petItemCategory}</span></td>
                <td><span class="price-tag">LKR ${parseFloat(item.petItemPrice).toFixed(2)}</span></td>
                <td>${item.quantity}</td>
                <td><span class="stock-badge ${stockStatus.class}">${stockStatus.text}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="edit-btn" data-id="${item.petItemId}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="delete-btn" data-id="${item.petItemId}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            `;
            itemsTableBody.appendChild(row);

            // Add row click listener for details modal
            row.addEventListener('click', (event) => {
                if (
                    event.target.closest('.edit-btn') ||
                    event.target.closest('.delete-btn')
                ) {
                    return;
                }
                openDetailModal(item);
            });
        });

        // Attach event listeners to buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => openEditModal(btn.dataset.id));
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteItem(btn.dataset.id));
        });
    }

    // Get stock status
    function getStockStatus(stock) {
        if (stock === 0) {
            return { class: 'stock-out', text: 'Out of Stock' };
        } else if (stock < 10) {
            return { class: 'stock-low', text: 'Low Stock' };
        } else {
            return { class: 'stock-in', text: 'In Stock' };
        }
    }

    // Add new item
    itemForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('itemName').value.trim();
        const category = document.getElementById('itemCategory').value;
        const price = document.getElementById('itemPrice').value;
        const quantity = document.getElementById('itemStock').value;
        const description = document.getElementById('itemDescription').value.trim();
        const imageFile = document.getElementById('itemImage').files[0];

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("category", category);
            formData.append("price", price);
            formData.append("quantity", quantity);
            formData.append("description", description);
            if (imageFile) formData.append("image", imageFile);

            const res = await fetch(`${API_BASE_ITEMS}/add`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to add item");
            }

            Swal.fire("Success", "Pet item added successfully!", "success");
            itemForm.reset();
            fetchItems();
        } catch (err) {
            console.error("Error adding item:", err);
            Swal.fire("Error", err.message || "Could not add item", "error");
        }
    });

    // Open edit modal
    function openEditModal(itemId) {
        const item = items.find(i => i.petItemId == itemId);
        if (!item) return;

        document.getElementById('editItemId').value = item.petItemId;
        document.getElementById('editItemName').value = item.petItemName;
        document.getElementById('editItemCategory').value = item.petItemCategory;
        document.getElementById('editItemPrice').value = item.petItemPrice;
        document.getElementById('editItemStock').value = item.quantity;
        document.getElementById('editItemDescription').value = item.petItemDescription || '';

        editModal.style.display = 'block';
    }

    // Close edit modal
    closeModal.onclick = function () {
        editModal.style.display = 'none';
    };

    window.onclick = function (event) {
        if (event.target === editModal) {
            editModal.style.display = 'none';
        } else if (event.target === detailModal) {
            detailModal.style.display = 'none';
        }
    };

    // Edit item
    editItemForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const itemId = document.getElementById('editItemId').value;
        const name = document.getElementById('editItemName').value.trim();
        const category = document.getElementById('editItemCategory').value;
        const price = document.getElementById('editItemPrice').value;
        const quantity = document.getElementById('editItemStock').value;
        const description = document.getElementById('editItemDescription').value.trim();
        const imageFile = document.getElementById('editItemImage').files[0];

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("category", category);
            formData.append("price", price);
            formData.append("quantity", quantity);
            formData.append("description", description);
            if (imageFile) formData.append("image", imageFile);

            const res = await fetch(`${API_BASE_ITEMS}/update/${itemId}`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to update item");
            }

            Swal.fire("Success", "Pet item updated successfully!", "success");
            editModal.style.display = 'none';
            fetchItems();
        } catch (err) {
            console.error("Error updating item:", err);
            Swal.fire("Error", err.message || "Could not update item", "error");
        }
    });

    // Delete item
    async function deleteItem(itemId) {
        const item = items.find(i => i.petItemId == itemId);
        if (!item) return;

        const confirmed = await Swal.fire({
            title: "Are you sure?",
            text: `Delete "${item.petItemName}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            confirmButtonColor: "#dc3545"
        });

        if (!confirmed.isConfirmed) return;

        try {
            const res = await fetch(`${API_BASE_ITEMS}/delete/${itemId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to delete item");
            }

            Swal.fire("Deleted!", "Pet item removed successfully", "success");
            fetchItems();
        } catch (err) {
            console.error("Error deleting item:", err);
            Swal.fire("Error", err.message || "Could not delete item", "error");
        }
    }

    // Open detail modal (NEW)
    function openDetailModal(item) {
        document.getElementById('detailImage').src = item.petItemImageUrl || 'https://via.placeholder.com/150';
        document.getElementById('detailName').textContent = item.petItemName;
        document.getElementById('detailCategory').textContent = item.petItemCategory;
        document.getElementById('detailPrice').textContent = parseFloat(item.petItemPrice).toFixed(2);
        document.getElementById('detailStock').textContent = item.quantity;
        document.getElementById('detailDescription').textContent = item.petItemDescription || "No description provided.";

        detailModal.style.display = 'block';
    }

    // Close detail modal on X button click
    closeDetailBtn.onclick = () => {
        detailModal.style.display = 'none';
    };

    // Initial fetch
    fetchItems();
}

// Run after DOM loaded
window.initPetItemsManagement = initPetItemsManagement;
