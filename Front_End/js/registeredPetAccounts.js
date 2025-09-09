async function initRegisteredPets() {
    const tableBody = document.getElementById("petsTableBody");
    const modal = document.getElementById("petModal");
    const closeModal = modal?.querySelector(".close");
    const searchInput = document.getElementById("searchInput");

    if (!tableBody || !modal || !closeModal || !searchInput) {
        console.error("Essential DOM elements are missing. Check your HTML.");
        return;
    }

    let petsData = [];

    // Fetch All Pets
    async function fetchAllPets() {
        try {
            const token = localStorage.getItem("jwtToken");
            const response = await fetch("http://localhost:8080/pets/all", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Failed to fetch pets");
            const result = await response.json();
            petsData = result.data || [];
            populateTable(petsData);
        } catch (error) {
            console.error("Error fetching pets:", error);
        }
    }

    // Fetch Pet Health Info
    async function fetchHealthInfo(petId) {
        try {
            const token = localStorage.getItem("jwtToken");
            const response = await fetch(`http://localhost:8080/pet-health/${petId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) return (await response.json()).data;
        } catch (error) {
            console.error("Error fetching health info:", error);
        }
        return null;
    }

    // Fetch Pet Care Info
    async function fetchCareInfo(petId) {
        try {
            const token = localStorage.getItem("jwtToken");
            const response = await fetch(`http://localhost:8080/petcare/${petId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) return (await response.json()).data;
        } catch (error) {
            console.error("Error fetching care info:", error);
        }
        return null;
    }

    // Fetch Pet Vaccinations
    async function fetchVaccinations(petId) {
        try {
            const token = localStorage.getItem("jwtToken");
            const response = await fetch(`http://localhost:8080/vaccination/${petId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) return (await response.json()).data || [];
        } catch (error) {
            console.error("Error fetching vaccinations:", error);
        }
        return [];
    }

    // Populate Table
    function populateTable(data) {
        tableBody.innerHTML = "";
        data.forEach(pet => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><img src="${pet.petProfileImage || "https://via.placeholder.com/80"}" class="pet-image" /></td>
                <td>${pet.name}</td>
                <td><span class="pet-type ${pet.type?.toLowerCase()}">${pet.type}</span></td>
                <td>${pet.breed}</td>
                <td>${pet.age}</td>
                <td>
                    <div class="owner-info">
                        <div class="owner-avatar">${pet.ownerName?.charAt(0).toUpperCase() || "?"}</div>
                        <div>
                            <div style="font-weight:500;">${pet.ownerName || "N/A"}</div>
                            <div style="font-size:12px;color:#64748b;">${pet.ownerEmail || "N/A"}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <i class="fas fa-eye view-details" style="cursor:pointer;color:#4f46e5;"></i>
                </td>
            `;

            row.querySelector(".view-details")?.addEventListener("click", e => {
                e.stopPropagation();
                showPetDetails(pet);
            });

            tableBody.appendChild(row);
        });
    }

    // Show Pet Modal Details
    async function showPetDetails(pet) {
        if (!modal) return;

        document.getElementById("modalPetName").textContent = pet.name || "N/A";
        const typeEl = document.getElementById("modalPetType");
        typeEl.textContent = pet.type || "N/A";
        typeEl.className = `pet-type ${pet.type?.toLowerCase() || ""}`;
        document.getElementById("modalPetId").textContent = pet.petId || "N/A";
        document.getElementById("modalBreed").textContent = pet.breed || "N/A";
        document.getElementById("modalAge").textContent = pet.age || "N/A";
        document.getElementById("modalPetImage").src = pet.petProfileImage || "https://via.placeholder.com/120";

        document.getElementById("modalOwnerName").textContent = pet.ownerName || "N/A";
        document.getElementById("modalOwnerEmail").textContent = pet.ownerEmail || "N/A";
        document.getElementById("modalOwnerAvatar").textContent = pet.ownerName?.charAt(0).toUpperCase() || "?";

        const [healthInfo, careInfo, vaccinations] = await Promise.all([
            fetchHealthInfo(pet.petId),
            fetchCareInfo(pet.petId),
            fetchVaccinations(pet.petId)
        ]);

        // Health Info
        document.getElementById("modalVeterinarian").textContent = healthInfo?.veterinarian || "N/A";
        document.getElementById("modalMedicalNotes").textContent = healthInfo?.medicalNotes || "N/A";

        // Care Info
        document.getElementById("modalFood").textContent = careInfo?.food || "N/A";
        document.getElementById("modalRoutine").textContent = careInfo?.routine || "N/A";

        // Vaccinations
        const vaccinationsList = document.getElementById("modalVaccinations");
        vaccinationsList.innerHTML = "";
        if (vaccinations?.length > 0) {
            vaccinations.forEach(vac => {
                const li = document.createElement("li");
                li.innerHTML = `
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div>
                            <div style="font-weight:600;color:#1e293b;">${vac.vaccineName}</div>
                            <div style="font-size:12px;color:#64748b;">Given: ${new Date(vac.dateGiven).toLocaleDateString()}</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:12px;color:#64748b;">Next Due:</div>
                            <div style="font-weight:500;color:#1e293b;">${new Date(vac.dueDate).toLocaleDateString()}</div>
                        </div>
                    </div>
                `;
                vaccinationsList.appendChild(li);
            });
        } else {
            vaccinationsList.innerHTML = "<li>No vaccination records available.</li>";
        }

        modal.style.display = "block";
    }

    // Modal Close
    closeModal.addEventListener("click", () => modal.style.display = "none");
    window.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && modal.style.display === "block") modal.style.display = "none"; });

    // Search Filter
    searchInput.addEventListener("input", e => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = petsData.filter(pet =>
            pet.name?.toLowerCase().includes(searchTerm) ||
            pet.type?.toLowerCase().includes(searchTerm) ||
            pet.breed?.toLowerCase().includes(searchTerm) ||
            pet.ownerName?.toLowerCase().includes(searchTerm) ||
            pet.ownerEmail?.toLowerCase().includes(searchTerm)
        );
        populateTable(filtered);
    });

    // Initialize
    await fetchAllPets();
}
