function initSubmittedGallery() {
    const API_URL = "http://localhost:8080/pet-gallery/all";
    const token = localStorage.getItem("jwtToken");

    if (!token) {
        console.error("JWT token not found, redirecting to login...");
        window.location.href = "../pages/authentication.html";
        return;
    }

    const galleryTableBody = document.getElementById("galleryTableBody");
    const galleryModal = document.getElementById("galleryModal");

    const modalGalleryImage = document.getElementById("modalGalleryImage");
    const modalGalleryDescription = document.getElementById("modalGalleryDescription");
    const modalSubmittedByEmail = document.getElementById("modalSubmittedByEmail");
    const modalGalleryId = document.getElementById("modalGalleryId");
    const modalCreatedAt = document.getElementById("modalCreatedAt");
    const modalClose = galleryModal.querySelector(".close");

    const searchInput = document.getElementById("gallerySearchInput");

    // Clear table
    galleryTableBody.innerHTML = "";

    // Fetch data
    fetch(API_URL, {
        headers: { Authorization: "Bearer " + token }
    })
        .then(res => {
            if (!res.ok) throw new Error("Failed to fetch gallery data");
            return res.json();
        })
        .then(galleries => {
            if (!Array.isArray(galleries)) {
                throw new Error("Invalid gallery data format");
            }

            galleries.forEach((gallery) => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td><img src="${gallery.imageUrl || "default.jpg"}" alt="Gallery Image" class="gallery-image" style="width:60px; height:60px; object-fit:cover; border-radius:8px;"></td>
                    <td>${gallery.description || "No description"}</td>
                    <td>${gallery.submittedByEmail || "Unknown"}</td>
                `;

                row.addEventListener("click", () => {
                    modalGalleryImage.src = gallery.imageUrl || "default.jpg";
                    modalGalleryDescription.textContent = gallery.description || "No description";
                    modalSubmittedByEmail.textContent = gallery.submittedByEmail || "Unknown";
                    modalGalleryId.textContent = gallery.petGalleryId || "-";
                    modalCreatedAt.textContent = gallery.createdAt ? new Date(gallery.createdAt).toLocaleString() : "-";

                    galleryModal.style.display = "block";
                });

                galleryTableBody.appendChild(row);
            });
        })
        .catch(err => {
            console.error("Gallery fetch error:", err);
            if (typeof Swal !== "undefined") {
                Swal.fire("Error", "Could not load gallery entries", "error");
            } else {
                alert("Could not load gallery entries");
            }
        });

    // Close modal
    modalClose.onclick = () => (galleryModal.style.display = "none");

    window.onclick = (event) => {
        if (event.target === galleryModal) {
            galleryModal.style.display = "none";
        }
    };

    // Search / filter
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const term = e.target.value.toLowerCase();
            Array.from(galleryTableBody.children).forEach(row => {
                const desc = row.cells[1].textContent.toLowerCase();
                const email = row.cells[2].textContent.toLowerCase();
                row.style.display = desc.includes(term) || email.includes(term) ? "" : "none";
            });
        });
    }
}
