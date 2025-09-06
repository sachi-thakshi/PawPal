const gallery = document.getElementById("gallery");
const uploadForm = document.getElementById("uploadForm");

// Load JWT from localStorage or your auth storage
const token = localStorage.getItem("jwtToken");

// Load gallery from backend
async function loadGallery() {
  gallery.innerHTML = "";

  try {
    const res = await fetch("http://localhost:8080/pet-gallery/all", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Failed to fetch gallery.");

    const photos = await res.json();

    if (photos.length === 0) {
      gallery.innerHTML = "<p class='text-center text-muted'>No photos uploaded yet.</p>";
      return;
    }

    photos.forEach((photo, i) => {
      const item = document.createElement("div");
      item.className = "gallery-item";
      item.innerHTML = `
                <img src="${photo.imageUrl}" alt="Photo ${i + 1}" />
                <div class="caption">${photo.description || ""}</div>
                <button class="btn btn-danger btn-sm delete-btn" data-id="${photo.petGalleryId}">Delete</button>
            `;
      gallery.appendChild(item);
    });

    // Add delete button listeners
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");

        const confirmDelete = await Swal.fire({
          title: 'Are you sure?',
          text: "This will permanently delete the photo.",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, delete it!',
          cancelButtonText: 'Cancel'
        });

        if (confirmDelete.isConfirmed) {
          try {
            const deleteRes = await fetch(`http://localhost:8080/pet-gallery/${id}`, {
              method: "DELETE",
              headers: { "Authorization": `Bearer ${token}` }
            });

            if (!deleteRes.ok) throw new Error("Delete failed.");

            Swal.fire("Deleted!", "The photo has been removed.", "success");
            loadGallery();
          } catch (err) {
            console.error(err);
            Swal.fire("Error!", "Failed to delete photo.", "error");
          }
        }
      });
    });

  } catch (err) {
    console.error(err);
    gallery.innerHTML = "<p class='text-center text-danger'>Failed to load gallery.</p>";
  }
}

// Handle form submission for uploading
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById("photo");
  const captionInput = document.getElementById("caption");
  const file = fileInput.files[0];

  if (!file) {
    Swal.fire("No file!", "Please select a photo to upload.", "warning");
    return;
  }

  if (!file.type.startsWith("image/")) {
    Swal.fire("Invalid file!", "Only image files are allowed.", "error");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("description", captionInput.value.trim());

  try {
    const res = await fetch("http://localhost:8080/pet-gallery/upload", {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    });

    if (!res.ok) throw new Error("Upload failed.");

    const savedPhoto = await res.json();

    Swal.fire("Uploaded!", "Your photo has been added to the gallery.", "success");

    // Refresh gallery
    loadGallery();

    // Reset form
    fileInput.value = "";
    captionInput.value = "";

  } catch (err) {
    console.error(err);
    Swal.fire("Error!", "Failed to upload photo.", "error");
  }
});

// Load gallery on page load
window.onload = loadGallery;
