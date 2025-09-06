// API base URL
const API_BASE = "http://localhost:8080/pet-owner";

// =====================
// Utility: Get token
// =====================
function getAuthToken() {
    return localStorage.getItem("jwtToken");
}

// =====================
// Load Logged Customer
// =====================
function loadCustomerData() {
    const accessToken = getAuthToken();
    if (!accessToken) {
        console.error("No token found, redirecting to login...");
        window.location.href = "../pages/authentication.html";
        return;
    }

    fetch(`${API_BASE}/loggedPetOwner`, {
        headers: { "Authorization": `Bearer ${accessToken}` }
    })
        .then(res => {
            if (!res.ok) throw new Error("Failed to fetch customer data");
            return res.json();
        })
        .then(apiResponse => {
            const petOwner = apiResponse.data;

            // Populate fields
            document.getElementById("nameValue").textContent = petOwner.username || "Not provided";
            document.getElementById("nameInput").value = petOwner.username || "";

            document.getElementById("emailValue").textContent = petOwner.email || "Not provided";
            document.getElementById("emailInput").value = petOwner.email || "";

            document.getElementById("phoneValue").textContent = petOwner.contactNumber || "Not provided";
            document.getElementById("phoneInput").value = petOwner.contactNumber || "";

            document.getElementById("addressValue").textContent = petOwner.address || "Not provided";
            document.getElementById("addressInput").value = petOwner.address || "";

            // Set profile image and save in localStorage
            if (petOwner.profileImageUrl) {
                document.getElementById("profileImage").src = petOwner.profileImageUrl;
                localStorage.setItem("profileImageUrl", petOwner.profileImageUrl);
            } else {
                localStorage.removeItem("profileImageUrl");
            }

            // Save username for initial fallback
            localStorage.setItem("username", petOwner.username || "");

            renderUserAvatar(petOwner);
        })
        .catch(error => {
            console.error("Error loading customer:", error);
        });
}



// =====================
// Image Upload
// =====================
const uploadTrigger = document.getElementById("uploadTrigger");
const imageUpload = document.getElementById("imageUpload");
const profileImage = document.getElementById("profileImage");

uploadTrigger.addEventListener("click", () => imageUpload.click());

imageUpload.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => { profileImage.src = event.target.result; };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
        const res = await fetch(`${API_BASE}/uploadProfileImage`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${getAuthToken()}` },
            body: formData
        });
        if (!res.ok) throw new Error("Image upload failed");
        Swal.fire("Success", "Profile image updated successfully!", "success");
    } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to upload profile image.", "error");
    }
});

// =====================
// Edit & Save Fields with Confirmation
// =====================
document.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', function () {
        const field = this.getAttribute('data-field');
        if (field === 'password') return; // password view-only

        Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to edit your ${field}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, edit it!',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                const valueElement = document.getElementById(`${field}Value`);
                const inputElement = document.getElementById(`${field}Input`);
                const saveButton = document.querySelector(`.save-btn[data-field="${field}"]`);

                valueElement.style.display = 'none';
                inputElement.style.display = 'block';
                saveButton.style.display = 'inline-block';
                inputElement.focus();
            }
        });
    });
});

document.querySelectorAll(".save-btn").forEach(button => {
    button.addEventListener("click", async function () {
        const field = this.getAttribute("data-field");
        if (field === 'password') return; // password view-only

        const valueElement = document.getElementById(`${field}Value`);
        const inputElement = document.getElementById(`${field}Input`);
        const newValue = inputElement.value;

        Swal.fire({
            title: 'Confirm Update',
            text: `Are you sure you want to update your ${field}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, update it!',
            cancelButtonText: 'No'
        }).then(async (result) => {
            if (result.isConfirmed) {
                // Update UI
                valueElement.textContent = newValue || "Not provided";
                inputElement.style.display = "none";
                this.style.display = "none";
                valueElement.style.display = "block";

                // Send to server
                try {
                    const res = await fetch(`${API_BASE}/updatePetOwner`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${getAuthToken()}`
                        },
                        body: JSON.stringify({ [field]: newValue })
                    });
                    if (!res.ok) throw new Error(`Failed to update ${field}`);
                    Swal.fire("Success", `${field} updated successfully!`, "success");
                } catch (err) {
                    console.error(err);
                    Swal.fire("Error", `Failed to update ${field}`, "error");
                }
            }
        });
    });
});

// =====================
// Save on Enter (excluding password)
// =====================
document.querySelectorAll(".field-input").forEach(input => {
    input.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            const field = this.id.replace("Input", "");
            if (field !== "password") {
                document.querySelector(`.save-btn[data-field="${field}"]`).click();
            }
        }
    });
});

document.addEventListener("DOMContentLoaded", loadCustomerData);
