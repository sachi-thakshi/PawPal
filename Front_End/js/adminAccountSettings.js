function initAdminSettings() {
    const API_BASE_ADMIN = "http://localhost:8080/admin";
    const token = localStorage.getItem("jwtToken");

    if (!token) {
        console.error("No token found, redirecting to login...");
        window.location.href = "../pages/authentication.html";
        return;
    }

    // Wait until the settings-card exists in the DOM
    const interval = setInterval(() => {
        const profileImage = document.getElementById("profileImage");
        const uploadTrigger = document.getElementById("uploadTrigger");
        const imageUpload = document.getElementById("imageUpload");
        const saveAllBtn = document.getElementById("saveAllBtn");

        if (!profileImage || !uploadTrigger || !imageUpload || !saveAllBtn) return;

        clearInterval(interval); // stop checking

        const fields = ["name", "email", "phone", "address"];

        // Load admin data
        async function loadAdminData() {
            try {
                const res = await fetch(`${API_BASE_ADMIN}/loggedAdmin`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (!res.ok) throw new Error("Failed to fetch admin data");

                const apiResponse = await res.json();
                const admin = apiResponse.data;

                fields.forEach(field => {
                    const valueEl = document.getElementById(`${field}Value`);
                    const inputEl = document.getElementById(`${field}Input`);
                    switch (field) {
                        case "name":
                            valueEl.textContent = admin.username || "Not provided";
                            inputEl.value = admin.username || "";
                            break;
                        case "email":
                            valueEl.textContent = admin.email || "Not provided";
                            inputEl.value = admin.email || "";
                            inputEl.disabled = true;
                            break;
                        case "phone":
                            valueEl.textContent = admin.contactNumber || "Not provided";
                            inputEl.value = admin.contactNumber || "";
                            break;
                        case "address":
                            valueEl.textContent = admin.address || "Not provided";
                            inputEl.value = admin.address || "";
                            break;
                    }
                    inputEl.style.display = "none";
                });

                profileImage.src = admin.profileImageUrl || "";
            } catch (err) {
                console.error(err);
                Swal.fire("Error", "Failed to load admin data", "error");
            }
        }

        // Profile image upload
        uploadTrigger.addEventListener("click", () => imageUpload.click());

        imageUpload.addEventListener("change", async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append("profileImage", file);

            try {
                const res = await fetch(`${API_BASE_ADMIN}/uploadProfileImage`, {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${token}` },
                    body: formData
                });
                if (!res.ok) throw new Error("Image upload failed");

                const apiResponse = await res.json();
                profileImage.src = apiResponse.data.profileImageUrl || "";
                Swal.fire("Success", "Profile image updated successfully!", "success");
            } catch (err) {
                console.error(err);
                Swal.fire("Error", "Failed to upload profile image", "error");
            }
        });

        // Enable editing on click
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const container = btn.closest('.settings-field');
                const field = container.dataset.field;
                if (!field || field === "email") return;

                const valueEl = document.getElementById(`${field}Value`);
                const inputEl = document.getElementById(`${field}Input`);

                valueEl.style.display = "none";
                inputEl.style.display = "block";
                inputEl.focus();
            });
        });

        // Save all fields
        saveAllBtn.addEventListener("click", () => {
            Swal.fire({
                title: "Confirm Update",
                text: "Do you want to save all changes?",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Yes, save!",
                cancelButtonText: "Cancel"
            }).then(async (result) => {
                if (!result.isConfirmed) return;

                const payload = {};
                fields.forEach(field => {
                    if (field === "email") return; // skip read-only
                    const inputEl = document.getElementById(`${field}Input`);
                    const valueEl = document.getElementById(`${field}Value`);
                    const newValue = inputEl.value.trim();

                    switch (field) {
                        case "name": payload.username = newValue; break;
                        case "phone": payload.contactNumber = newValue; break;
                        case "address": payload.address = newValue; break;
                    }

                    valueEl.textContent = newValue || "Not provided";
                    inputEl.style.display = "none";
                });

                try {
                    const res = await fetch(`${API_BASE_ADMIN}/updateAdmin`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify(payload)
                    });
                    if (!res.ok) throw new Error("Failed to update admin profile");

                    Swal.fire("Success", "All changes saved successfully!", "success");
                } catch (err) {
                    console.error(err);
                    Swal.fire("Error", "Failed to save changes.", "error");
                }
            });
        });

        // Initialize
        loadAdminData();
    }, 100); // check every 100ms until elements exist
}
