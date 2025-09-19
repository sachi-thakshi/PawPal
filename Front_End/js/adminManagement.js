function initAdminManagement() {
    const API_BASE_ADMIN = "http://localhost:8080/admin";
    const token = localStorage.getItem("jwtToken");

    if (!token) {
        console.error("No token found, redirecting to login...");
        window.location.href = "../pages/authentication.html";
        return;
    }

    const adminForm = document.getElementById('adminForm');
    const adminsTableBody = document.getElementById('adminsTableBody');

    if (!adminForm || !adminsTableBody) {
        console.error("Required DOM elements not found.");
        return;
    }

    let admins = [];

    // ---------------- Fetch all admins ----------------
    async function fetchAdmins() {
        try {
            const res = await fetch(`${API_BASE_ADMIN}/all`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to fetch admins");

            const apiResponse = await res.json();
            admins = apiResponse.data || [];
            renderAdminsTable();
        } catch (err) {
            console.error("Error fetching admins:", err);
            Swal.fire("Error", "Could not load admins", "error");
        }
    }

    // ---------------- Render admins table ----------------
    function renderAdminsTable() {
        adminsTableBody.innerHTML = '';
        admins.forEach((admin, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
        <td>${index + 1}</td>
        <td>
          <img src="${admin.profileImageUrl || '../assets/images/default-image.jpg'}" 
               alt="Profile" class="profile-thumb" 
               style="width:40px; height:40px; object-fit:cover; border-radius:50%;">
        </td>
        <td>${admin.username}</td>
        <td>${admin.email}</td>
        <td>${admin.contactNumber || '-'}</td>
        <td>${admin.address || '-'}</td>
        <td>
          <button class="delete-btn" data-email="${admin.email}">Delete</button>
        </td>
      `;
            adminsTableBody.appendChild(row);
        });

        // Attach delete listeners
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteAdmin(btn.dataset.email));
        });
    }

    // ---------------- Add new admin ----------------
    adminForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('adminName').value.trim();
        const email = document.getElementById('adminEmail').value.trim();
        const phone = document.getElementById('adminPhone').value.trim();
        const address = document.getElementById('adminAddress').value.trim();
        const password = document.getElementById('adminPassword').value;
        const confirmPassword = document.getElementById('adminConfirmPassword').value;
        const imageFile = document.getElementById('adminImage').files[0];

        if (password !== confirmPassword) {
            Swal.fire("Error", "Passwords do not match", "error");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("username", name);
            formData.append("email", email);
            formData.append("password", password);
            if (phone) formData.append("contactNumber", phone);
            if (address) formData.append("address", address);
            if (imageFile) formData.append("profileImage", imageFile);

            const res = await fetch(`${API_BASE_ADMIN}/add`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                    // ❌ Do NOT set 'Content-Type' when sending FormData
                },
                body: formData
            });

            const data = await res.json();

            if (!res.ok || data.status !== 200) {
                throw new Error(data.message || "Failed to add admin");
            }

            Swal.fire("Success", "Admin added successfully!", "success");
            adminForm.reset();
            fetchAdmins();
        } catch (err) {
            console.error("Error adding admin:", err);
            Swal.fire("Error", err.message || "Could not add admin", "error");
        }
    });

    // ---------------- Delete admin ----------------
    async function deleteAdmin(email) {
        const confirmed = await Swal.fire({
            title: "Are you sure?",
            text: `Delete admin ${email}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete"
        });

        if (!confirmed.isConfirmed) return;

        try {
            const res = await fetch(`${API_BASE_ADMIN}/delete/${encodeURIComponent(email)}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            const data = await res.json();

            if (!res.ok || data.status !== 200) {
                throw new Error(data.message || "Failed to delete admin");
            }

            Swal.fire("Deleted!", "Admin removed successfully", "success");
            fetchAdmins();
        } catch (err) {
            console.error("Error deleting admin:", err);
            Swal.fire("Error", err.message || "Could not delete admin", "error");
        }
    }

    // ---------------- Initialize ----------------
    fetchAdmins();
}
