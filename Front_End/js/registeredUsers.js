const initRegisteredUsers = (function () {
    let usersData = [];
    let currentFilter = 'all';

    async function fetchAllUsers() {
        try {
            const token = localStorage.getItem("jwtToken");
            const res = await fetch("http://localhost:8080/users/all", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to fetch users");
            const apiResponse = await res.json();
            usersData = apiResponse.data || [];
        } catch (err) {
            console.error("Error fetching users:", err);
            Swal.fire("Error", "Failed to fetch users", "error");
        }
    }

    function initRegisteredUsers() {
        const tableBody = document.getElementById('usersTableBody');
        const modal = document.getElementById('userModal');
        const closeModal = modal.querySelector('.close');
        const searchInput = document.getElementById('searchInput');
        const filterButtons = document.querySelectorAll('.filter-btn');
        const userCount = document.getElementById('userCount');

        if (!tableBody || !modal || !searchInput || !userCount || filterButtons.length === 0) {
            console.error("One or more required DOM elements not found!");
            return;
        }

        function populateTable(data) {
            tableBody.innerHTML = '';
            if (!data.length) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="empty-state">
                            <i class="fas fa-users" style="font-size: 3rem; opacity: 0.3;"></i>
                            <div>No users found</div>
                        </td>
                    </tr>
                `;
                return;
            }

            data.forEach(user => {
                const avatarHtml = user.profileImageUrl ?
                    `<img src="${user.profileImageUrl}" alt="${user.username}" class="user-avatar">` :
                    `<div class="default-avatar">${user.username.charAt(0).toUpperCase()}</div>`;

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${avatarHtml}</td>
                    <td>
                        <div class="user-info">
                            <div class="user-name">${user.username}</div>
                            <div class="user-email">${user.email}</div>
                        </div>
                    </td>
                    <td><span class="role-badge role-${user.role.toLowerCase()}">${user.role}</span></td>
                    <td>${user.contactNumber}</td>
                    <td style="max-width:200px; word-wrap: break-word;">${user.address || '-'}</td>
                `;

                row.addEventListener('click', () => showUserDetails(user));
                tableBody.appendChild(row);
            });
        }

        function showUserDetails(user) {
            document.getElementById('modalName').textContent = user.username;
            const modalUserRole = document.getElementById('modalUserRole');
            modalUserRole.textContent = user.role;
            modalUserRole.className = `role-badge role-${user.role.toLowerCase()}`;
            document.getElementById('modalUserEmail').textContent = user.email;
            document.getElementById('modalUserId').textContent = user.userId;
            document.getElementById('modalUsername').textContent = user.username;
            document.getElementById('modalEmail').textContent = user.email;
            document.getElementById('modalContact').textContent = user.contactNumber;
            document.getElementById('modalAddress').textContent = user.address || '-';

            const modalUserImage = document.getElementById('modalUserImage');
            const modalUserDefault = document.getElementById('modalUserDefault');
            if (user.profileImageUrl) {
                modalUserImage.src = user.profileImageUrl;
                modalUserImage.style.display = 'block';
                modalUserDefault.style.display = 'none';
            } else {
                modalUserDefault.textContent = user.username.charAt(0).toUpperCase();
                modalUserDefault.style.display = 'flex';
                modalUserImage.style.display = 'none';
            }

            modal.style.display = 'block';
        }

        // Close modal
        closeModal.addEventListener('click', () => modal.style.display = 'none');
        window.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
        document.addEventListener('keydown', e => { if (e.key === 'Escape') modal.style.display = 'none'; });

        // Filter buttons
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                applyFilters();
            });
        });

        // Search input
        searchInput.addEventListener('input', applyFilters);

        function applyFilters() {
            let filtered = usersData;
            if (currentFilter !== 'all') {
                filtered = filtered.filter(u => u.role.toLowerCase() === currentFilter.toLowerCase());
            }

            const searchTerm = searchInput.value.toLowerCase();
            if (searchTerm) {
                filtered = filtered.filter(u =>
                    u.username.toLowerCase().includes(searchTerm) ||
                    u.email.toLowerCase().includes(searchTerm) ||
                    u.contactNumber.toLowerCase().includes(searchTerm)
                );
            }

            populateTable(filtered);
            updateUserCount(filtered);
        }

        function updateUserCount(data) {
            userCount.textContent = `${data.length} ${data.length === 1 ? 'User' : 'Users'}`;
        }

        // Initialize
        fetchAllUsers().then(() => applyFilters());
    }

    return initRegisteredUsers;
})();
