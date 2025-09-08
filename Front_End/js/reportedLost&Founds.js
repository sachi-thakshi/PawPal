const initPetReports = (function () {
    let reportsData = []; // Will be fetched from backend
    let currentFilter = "all";
    let currentData = [];

    async function fetchAllReports() {
        try {
            const token = localStorage.getItem("jwtToken");
            const response = await fetch("http://localhost:8080/pet-report/all", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Failed to fetch reports");

            const result = await response.json();
            reportsData = result.data || [];
            currentData = reportsData;
        } catch (error) {
            console.error("Error fetching reports:", error);
            reportsData = [];
            currentData = [];
        }
    }

    async function initPetReports() {
        await fetchAllReports();

        const tableBody = document.getElementById("reportsTableBody");
        const modal = document.getElementById("reportModal");
        const closeModal = modal.querySelector(".close");
        const searchInput = document.getElementById("searchInput");
        const filterButtons = document.querySelectorAll(".filter-btn");
        const reportCount = document.getElementById("reportCount");

        // ------------------------------
        // Populate table
        // ------------------------------
        function populateTable(data) {
            tableBody.innerHTML = "";
            if (data.length === 0) {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td colspan="6" class="empty-state">
                        <i class="fas fa-flag" style="font-size: 3rem; margin-bottom: 10px; opacity: 0.3;"></i>
                        <div>No reports found matching your criteria</div>
                    </td>
                `;
                tableBody.appendChild(row);
                reportCount.textContent = `0 Reports`;
                return;
            }

            data.forEach(report => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${report.petName}</td>
                    <td>${report.description}</td>
                    <td>${report.location}</td>
                    <td>${report.type}</td>
                    <td>${new Date(report.reportedAt).toLocaleString()}</td>
                    <td>${report.owner?.username || "N/A"}</td>
                `;
                row.addEventListener("click", () => showReportDetails(report));
                tableBody.appendChild(row);
            });

            reportCount.textContent = `${data.length} ${data.length === 1 ? "Report" : "Reports"}`;
        }

        // ------------------------------
        // Show report details in modal
        // ------------------------------
        function showReportDetails(report) {
            document.getElementById("modalPetName").textContent = report.petName;
            document.getElementById("modalDescription").textContent = report.description;
            document.getElementById("modalLocation").textContent = report.location;
            document.getElementById("modalType").textContent = report.type;
            document.getElementById("modalReportedAt").textContent = new Date(report.reportedAt).toLocaleString();
            document.getElementById("modalOwner").textContent = report.owner?.username || "N/A";

            const modalImage = document.getElementById("modalImage");
            if (report.imageUrl) {
                modalImage.src = report.imageUrl;
                modalImage.style.display = "block";
            } else {
                modalImage.style.display = "none";
            }

            modal.style.display = "block";
        }

        // ------------------------------
        // Close modal
        // ------------------------------
        closeModal.addEventListener("click", () => (modal.style.display = "none"));
        window.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });
        document.addEventListener("keydown", (e) => { if (e.key === "Escape") modal.style.display = "none"; });

        // ------------------------------
        // Filters & Search
        // ------------------------------
        filterButtons.forEach(button => {
            button.addEventListener("click", () => {
                filterButtons.forEach(btn => btn.classList.remove("active"));
                button.classList.add("active");
                currentFilter = button.dataset.filter.toUpperCase();
                applyFilters();
            });
        });

        searchInput.addEventListener("input", applyFilters);

        function applyFilters() {
            let filteredData = reportsData;

            if (currentFilter !== "ALL") {
                filteredData = filteredData.filter(r => r.type === currentFilter);
            }

            const searchTerm = searchInput.value.toLowerCase();
            if (searchTerm) {
                filteredData = filteredData.filter(r =>
                    r.petName.toLowerCase().includes(searchTerm) ||
                    r.description.toLowerCase().includes(searchTerm) ||
                    r.location.toLowerCase().includes(searchTerm)
                );
            }

            currentData = filteredData;
            populateTable(filteredData);
        }

        // ------------------------------
        // Initialize table
        // ------------------------------
        populateTable(reportsData);
    }

    return initPetReports;
})();
