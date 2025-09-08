const initAppointments = () => {
    const container = document.getElementById("mainContent");
    if (!container) {
        console.error("Main content container not found!");
        return;
    }

    // Required elements
    const tableBody = container.querySelector("#appointmentsTableBody");
    const searchInput = container.querySelector("#searchInput");
    const appointmentsCount = container.querySelector("#appointmentsCount");
    const modal = container.querySelector("#userModal");

    if (!tableBody || !searchInput || !appointmentsCount || !modal) {
        console.error("One or more required DOM elements not found!");
        return;
    }

    const API_BASE = "http://localhost:8080/vet-appointment";
    let appointmentsData = [];

    // Fetch all appointments
    async function fetchAllAppointments() {
        try {
            const token = localStorage.getItem("jwtToken");
            const res = await fetch(`${API_BASE}/all`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const apiResponse = await res.json();
            appointmentsData = apiResponse.data || [];
            populateTable(appointmentsData);
            updateAppointmentCount(appointmentsData);
        } catch (err) {
            console.error("Error fetching appointments:", err);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <i class="fas fa-calendar-plus" style="font-size: 3rem; margin-bottom: 10px; opacity: 0.3;"></i>
                        <div>Failed to fetch appointments from server</div>
                    </td>
                </tr>`;
        }
    }

    // Populate table
    function populateTable(data) {
        tableBody.innerHTML = '';
        if (data.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <i class="fas fa-calendar-plus" style="font-size: 3rem; margin-bottom: 10px; opacity: 0.3;"></i>
                        <div>No appointments found</div>
                    </td>
                </tr>`;
            return;
        }

        data.forEach((appointment) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${appointment.ownerName}</td>
                <td>${appointment.ownerContactNumber}</td>
                <td>${appointment.petName}</td>
                <td>${appointment.serviceType}</td>
                <td>${appointment.appointmentDateTime}</td>
                <td>${appointment.notes || "-"}</td>
            `;
            row.addEventListener("click", () => showAppointmentDetails(appointment));
            tableBody.appendChild(row);
        });
    }

    // Update appointment count
    function updateAppointmentCount(data) {
        const count = data.length;
        appointmentsCount.textContent = `${count} ${count === 1 ? 'Appointment' : 'Appointments'}`;
    }

    // Show modal
    function showAppointmentDetails(appointment) {
        container.querySelector("#modalPetOwnerName").textContent = appointment.ownerName;
        container.querySelector("#modalPetOwnerContactNo").textContent = appointment.ownerContactNumber;
        container.querySelector("#modalPetName").textContent = appointment.petName;
        container.querySelector("#modalServiceType").textContent = appointment.serviceType;
        container.querySelector("#modalADateTime").textContent = appointment.appointmentDateTime;
        container.querySelector("#modalNotes").textContent = appointment.notes || "-";

        modal.style.display = "block";
    }

    // Close modal
    const closeModal = modal.querySelector(".close");
    closeModal?.addEventListener("click", () => (modal.style.display = "none"));
    window.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") modal.style.display = "none"; });

    // Search functionality
    searchInput.addEventListener("input", () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filtered = appointmentsData.filter(app =>
            (app.ownerName && app.ownerName.toLowerCase().includes(searchTerm)) ||
            (app.ownerContactNumber && app.ownerContactNumber.toLowerCase().includes(searchTerm)) ||
            (app.petName && app.petName.toLowerCase().includes(searchTerm)) ||
            (app.serviceType && app.serviceType.toLowerCase().includes(searchTerm)) ||
            (app.appointmentDateTime && app.appointmentDateTime.toLowerCase().includes(searchTerm)) ||
            (app.notes && app.notes.toLowerCase().includes(searchTerm))
        );
        populateTable(filtered);
        updateAppointmentCount(filtered);
    });

    // Initialize
    fetchAllAppointments();
};
