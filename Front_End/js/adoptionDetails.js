const initAdoptivePets = (function () {
    let adoptivePetsData = [];
    let currentFilter = 'all'; // all, pending, approved, declined, no-request

    async function fetchAdoptionRequests() {
        try {
            const token = localStorage.getItem("jwtToken");
            const res = await fetch("http://localhost:8080/adoption-requests/all", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to fetch adoption requests");
            const result = await res.json();
            return result.data || [];
        } catch (err) {
            console.error("Error fetching adoption requests:", err);
            return [];
        }
    }

    async function fetchAvailablePets() {
        try {
            const token = localStorage.getItem("jwtToken");
            const res = await fetch("http://localhost:8080/pet-adoption/available", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to fetch available pets");
            const result = await res.json();
            return result.data || [];
        } catch (err) {
            console.error("Error fetching available pets:", err);
            return [];
        }
    }

    function init() {
        const tableBody = document.getElementById('adoptivePetsTableBody');
        const modal = document.getElementById('adoptivePetModal');
        const closeModal = modal.querySelector('.close');
        const searchInput = document.getElementById('searchInput');
        const filterButtons = document.querySelectorAll('.filter-btn');
        const petCount = document.getElementById('adoptivePetCount');

        if (!tableBody || !modal || !searchInput || !petCount || filterButtons.length === 0) {
            console.error("Required DOM elements not found!");
            return;
        }

        async function loadData() {
            const requests = await fetchAdoptionRequests();
            const availablePets = await fetchAvailablePets();

            // Merge available pets with non-requested pets
            const nonRequestedPets = availablePets.filter(p => !p.hasApprovedRequest);
            adoptivePetsData = [
                ...requests,
                ...nonRequestedPets.map(pet => ({
                    petType: pet.petType,
                    petImage: pet.petImage,
                    petName: pet.petName,
                    petLocation: pet.location,
                    ownerEmail: pet.ownerEmail,
                    requestDate: null,
                    requesterEmail: null,
                    approved: null,        // mark as no request
                    noRequest: true
                }))
            ];

            applyFilters();
        }

        function populateTable(data) {
            tableBody.innerHTML = '';
            if (!data.length) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="8" class="empty-state">
                            <i class="fas fa-paw" style="font-size:3rem;opacity:0.3;"></i>
                            <div>No adoptive pets found</div>
                        </td>
                    </tr>
                `;
                return;
            }

            data.forEach(p => {
                const statusHtml = p.noRequest
                    ? '<span class="status-no-request">No Request Yet</span>'
                    : (p.approved === null
                        ? '<span class="status-pending">Pending</span>'
                        : p.approved
                            ? '<span class="status-approved">Approved</span>'
                            : '<span class="status-declined">Declined</span>');

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${p.petType || 'Unknown'}</td>
                    <td><img src="${p.petImage || ''}" class="pet-image"></td>
                    <td>${p.petName || 'Unknown'}</td>
                    <td>${p.petLocation || '-'}</td>
                    <td>${p.ownerEmail || '-'}</td>
                    <td>${p.requestDate ? new Date(p.requestDate).toLocaleDateString() : '-'}</td>
                    <td>${p.requesterEmail || '-'}</td>
                    <td>${statusHtml}</td>
                `;

                row.addEventListener('click', () => showPetModal(p));
                tableBody.appendChild(row);
            });
        }

        function showPetModal(p) {
            const modalPetImage = document.getElementById('modalPetImage');

            if (p.petImage) {
                modalPetImage.src = p.petImage;
                modalPetImage.style.display = 'block';
            } else {
                modalPetImage.style.display = 'none';
            }

            document.getElementById('modalPetName').textContent = p.petName || 'Unknown';
            const petTypeBadge = document.getElementById('modalPetType');
            petTypeBadge.textContent = p.petType || 'Unknown';
            petTypeBadge.className = 'role-badge pet-type-badge';

            document.getElementById('modalLocation').textContent = p.petLocation || '-';
            document.getElementById('modalOwnerEmail').textContent = p.ownerEmail || '-';
            document.getElementById('modalRequestDate').textContent = p.requestDate
                ? new Date(p.requestDate).toLocaleDateString()
                : '-';
            document.getElementById('modalRequesterEmail').textContent = p.requesterEmail || '-';
            document.getElementById('modalStatus').textContent = p.noRequest
                ? 'No Request Yet'
                : (p.approved === null ? 'Pending' : p.approved ? 'Approved' : 'Declined');

            modal.style.display = 'block';
        }

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

        // Search
        searchInput.addEventListener('input', applyFilters);

        function applyFilters() {
            let filtered = adoptivePetsData;
            if (currentFilter === 'pending') filtered = filtered.filter(p => p.approved === null && !p.noRequest);
            else if (currentFilter === 'approved') filtered = filtered.filter(p => p.approved === true);
            else if (currentFilter === 'declined') filtered = filtered.filter(p => p.approved === false);
            else if (currentFilter === 'no-request') filtered = filtered.filter(p => p.noRequest);

            const term = searchInput.value.toLowerCase();
            if (term) {
                filtered = filtered.filter(p =>
                    (p.petName && p.petName.toLowerCase().includes(term)) ||
                    (p.requesterEmail && p.requesterEmail.toLowerCase().includes(term)) ||
                    (p.ownerEmail && p.ownerEmail.toLowerCase().includes(term))
                );
            }

            populateTable(filtered);
            document.getElementById('adoptivePetCount').textContent = `${filtered.length} ${filtered.length === 1 ? 'Pet' : 'Pets'}`;
        }

        // Load everything
        loadData();
    }

    return init;
})();
