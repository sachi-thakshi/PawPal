// ------------------------- CONFIG -------------------------
const API_BASE = 'http://localhost:8080';
const token = localStorage.getItem('jwtToken');

// ------------------------- DOM ELEMENTS -------------------------
const petsContainer = document.getElementById('petsContainer');
let petModal = document.getElementById('petModal');
const vaccinationModal = document.getElementById('vaccinationModal');

let currentPet = null;
let vaccinationRecords = [];

// ------------------------- Utility Function -------------------------
function getPetImageUrl(imagePath) {
  if (!imagePath) return "";

  if (imagePath.startsWith("http")) {
    return imagePath
        .replace("/upload/", "/upload/f_auto,q_auto/")
        .replace(/\.heic$/i, ".jpg");
  }

  const formattedPath = imagePath.replace(/\.heic$/i, ".jpg");
  return `https://res.cloudinary.com/dulfxe0gb/image/upload/f_auto,q_auto/${formattedPath}`;
}

// ------------------------- Pet Image Upload -------------------------
const uploadTrigger = document.getElementById("uploadTrigger");
const imageUpload = document.getElementById("imageUpload");
const modalPetImage = document.getElementById("modalPetImage");

uploadTrigger.addEventListener("click", () => {
  imageUpload.click();
});

imageUpload.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file || !currentPet) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    modalPetImage.src = event.target.result;
  };
  reader.readAsDataURL(file);

  // Prepare FormData to upload
  const formData = new FormData();
  formData.append("petProfileImage", file);
  formData.append("petId", currentPet.id);

  try {
    const res = await fetch(`${API_BASE}/pets/addPetProfileImage`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    });

    const data = await res.json();

    if (res.ok && data.status === 200) {
      Swal.fire("Success", "Pet profile image updated!", "success");

      console.log("Upload response data:", data);

      // Update pet image reference
      currentPet.petProfileImage = data.data.petProfileImage ;

      console.log("Updated currentPet.image:", currentPet.petProfileImage);

      // Set updated image with cache-busting timestamp
      const updatedImageUrl = getPetImageUrl(currentPet.petProfileImage) + '?t=' + new Date().getTime();
      modalPetImage.src = updatedImageUrl;

      console.log("Modal image src set to:", updatedImageUrl);

      // await loadPets();
      const petCardImg = document.querySelector(`.pet-card img[alt="${currentPet.name}"]`);
      if (petCardImg) {
        petCardImg.src = updatedImageUrl;
        console.log("Pet card image updated without reload.");
      }

    } else {
      Swal.fire("Error", data.message || "Failed to upload pet image", "error");
    }

  } catch (err) {
    console.error(err);
    Swal.fire("Error", "Something went wrong while uploading.", "error");
  }
});

// ------------------------- Set Pet Image on Modal Open -------------------------
function setPetImage() {
  const modalPetImage = document.getElementById('modalPetImage');
  console.log('setPetImage() called');
  console.log('currentPet:', currentPet);
  console.log('currentPet.petProfileImage:', currentPet.petProfileImage);

  if (currentPet && currentPet.petProfileImage) {
    modalPetImage.src = currentPet.petProfileImage;
  } else {
    console.log('No image found, setting default');
    modalPetImage.src = '../assets/images/default-image.jpg';  // Update with your default image path
  }
}

// ------------------------- UTILITY -------------------------
function showModal(modal) {
  modal.style.display = 'flex';
}

function closeModal(modal) {
  modal.style.display = 'none';

  // Restore edit/delete buttons on pet cards
  document.querySelectorAll('.pet-card .edit-btn, .pet-card .delete-btn').forEach(btn => {
    btn.style.display = 'inline-block';
  });

  // Also restore the modal save button
  const saveBtn = document.getElementById('saveAllBtn');
  if (saveBtn) saveBtn.style.display = 'block';
}

function setTextValue(field, value) {
  const span = document.getElementById(field + 'Value');
  const input = document.getElementById(field + 'Input');
  if (span) span.textContent = value || '';
  if (input) input.value = value || '';
}

function hideAllInputs() {
  document.querySelectorAll('.input-field').forEach(input => input.style.display = 'none');
  document.querySelectorAll('.info-value').forEach(span => span.style.display = 'inline');
}

function showAllInputs() {
  document.querySelectorAll('.input-field').forEach(input => input.style.display = 'inline-block');
  document.querySelectorAll('.info-value').forEach(span => span.style.display = 'none');
}

// ------------------------- LOAD PETS -------------------------
async function loadPets() {
  try {
    const res = await fetch(`${API_BASE}/pets/userPets`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Failed to fetch pets');

    const result = await res.json();
    if (result.status !== 200) throw new Error(result.message || 'Failed to load pets');

    const pets = result.data;
    petsContainer.innerHTML = '';

    pets.forEach(pet => {
      const imageUrl = getPetImageUrl(pet.petProfileImage);

      const card = document.createElement('div');
      card.className = 'pet-card';
      card.innerHTML = `
         <img src="${imageUrl}" alt="${pet.name}" class="profile-pic" />
        <h4>${pet.name}</h4>
        <p>${pet.type} • ${pet.age}</p>
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      `;

      // Edit button action
      card.querySelector('.edit-btn').addEventListener('click', () => openPetModal(pet));
      card.addEventListener('click', (e) => {
        // Prevent triggering read-only modal when clicking edit/delete buttons
        if (e.target.classList.contains('edit-btn') || e.target.classList.contains('delete-btn')) return;
        openPetModal(pet, true); // readOnly = true
      });


      // Delete button action
      card.querySelector('.delete-btn').addEventListener('click', async () => {
        const confirmDelete = await Swal.fire({
          title: 'Are you sure?',
          text: `Delete ${pet.name}? This cannot be undone.`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, delete it!',
          cancelButtonText: 'Cancel'
        });

        if (confirmDelete.isConfirmed) {
          try {
            const res = await fetch(`${API_BASE}/pets/${pet.id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
              Swal.fire('Deleted!', `${pet.name} has been removed.`, 'success');
              loadPets(); // reload pets after deletion
            } else {
              Swal.fire('Error', 'Failed to delete pet.', 'error');
            }
          } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Something went wrong while deleting pet.', 'error');
          }
        }
      });

      petsContainer.appendChild(card);
    });

  } catch (error) {
    console.error('Error loading pets:', error);
    petsContainer.innerHTML = '<p class="error">Failed to load pets. Please try again later.</p>';
  }
}

// ------------------------- OPEN MODALS -------------------------
async function openPetModal(pet, readOnly = false) {
  currentPet = pet;
  vaccinationRecords = [];

  setPetImage();

  // Set modal header
  document.getElementById('modalPetName').textContent = pet.name || '';
  document.getElementById('modalPetType').textContent = `${pet.type || ''} • ${pet.age || ''} years`;

  // Fill all fields
  setTextValue('petName', pet.name);
  setTextValue('petType', pet.type);
  setTextValue('petBreed', pet.breed);
  setTextValue('petAge', pet.age);
  setTextValue('petVet', '');
  setTextValue('petMedical', '');
  setTextValue('petFood', '');
  setTextValue('petRoutine', '');

  hideAllInputs(); // hide input fields initially
  if (readOnly) {
    document.getElementById('saveAllBtn').style.display = 'none'; // hide save button
    document.querySelectorAll('.edit-btn').forEach(btn => btn.style.display = 'none'); // hide edit buttons
    document.querySelectorAll('.delete-btn').forEach(btn => btn.style.display = 'none'); // hide delete buttons
  } else {
    document.getElementById('saveAllBtn').style.display = 'block'; // show save button
    document.querySelectorAll('.edit-btn').forEach(btn => btn.style.display = 'inline-block');
  }

  // Fetch other info
  if (pet.petId) {
    await fetchCareInfo(pet.petId);
    await fetchHealthInfo(pet.petId);
    await fetchVaccinations(pet.petId);
  }

  showModal(petModal);
}

function openAddPetModal() {
  currentPet = null;
  vaccinationRecords = [];

  document.getElementById('modalPetImage').src = '../assets/images/default-image.jpg';
  ['petName','petType','petBreed','petAge','petVet','petMedical','petFood','petRoutine'].forEach(f => setTextValue(f, ''));

  const tbody = document.getElementById('vaccinationTableBody');
  if (tbody) tbody.innerHTML = '';

  showAllInputs();
  showModal(petModal);
}

// ------------------------- FETCH CARE INFO -------------------------
async function fetchCareInfo(petId) {
  try {
    const res = await fetch(`${API_BASE}/petcare/${petId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return;

    const data = await res.json();
    console.log('Care info response:', data);

    if (data.status === 200 && data.data) {
      setTextValue('petFood', data.data.food);
      setTextValue('petRoutine', data.data.routine);
    }
  } catch (error) {
    console.error('Error fetching care info:', error);
  }
}

// ------------------------- FETCH HEALTH INFO -------------------------
async function fetchHealthInfo(petId) {
  try {
    const res = await fetch(`${API_BASE}/pet-health/${petId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return;

    const data = await res.json();
    console.log('Health info response:', data);

    if (data.status === 200 && data.data) {
      setTextValue('petVet', data.data.veterinarian);
      setTextValue('petMedical', data.data.medicalNotes);
    }
  } catch (error) {
    console.error('Error fetching health info:', error);
  }
}

// ------------------------- FETCH VACCINATIONS -------------------------
async function fetchVaccinations(petId) {
  try {
    const res = await fetch(`${API_BASE}/vaccination/${petId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return;

    const data = await res.json();
    console.log('Vaccination response:', data);

    if (data.status === 200 && Array.isArray(data.data)) {
      vaccinationRecords = data.data;
      populateVaccinationsTable(vaccinationRecords);
    }
  } catch (error) {
    console.error('Error fetching vaccinations:', error);
  }
}

// ------------------------- POPULATE VACCINATION TABLE -------------------------
function populateVaccinationsTable(vaccinations) {
  const tbody = document.getElementById('vaccinationTableBody');
  tbody.innerHTML = '';
  vaccinations.forEach((vax, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${vax.vaccineName || vax.vaccine || ''}</td>
      <td>${vax.givenDate || vax.dateGiven || ''}</td>
      <td>${vax.dueDate || ''}</td>
      <td><button class="btn btn-sm btn-danger" data-idx="${idx}">Delete</button></td>
    `;

    tr.querySelector('button').addEventListener('click', async () => {
      const vaccinationId = vax.petVaccinationId; // existing DB ID
      if (vaccinationId) {
        try {
          const res = await fetch(`${API_BASE}/vaccination/${vaccinationId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Vaccination record deleted', timer: 1500, showConfirmButton: false });
          } else {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to delete vaccination' });
            return; // stop removing from front-end if backend fails
          }
        } catch (err) {
          console.error(err);
          Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to delete vaccination' });
          return;
        }
      }
      // Remove from local array and refresh table
      vaccinationRecords.splice(idx, 1);
      populateVaccinationsTable(vaccinationRecords);
    });

    tbody.appendChild(tr);
  });
}

// ------------------------- ADD VACCINATION -------------------------
const addVaccinationBtn = document.getElementById('addVaccinationBtn');
addVaccinationBtn.addEventListener('click', () => {
  document.getElementById('vaccineNameInput').value = '';
  document.getElementById('vaccineDateInput').value = '';
  document.getElementById('vaccineDueDateInput').value = '';

  // Ensure inputs are editable
  ['vaccineNameInput','vaccineDateInput','vaccineDueDateInput'].forEach(id => {
    const inp = document.getElementById(id);
    inp.style.display = 'inline-block';
    inp.disabled = false;
    inp.readOnly = false;
  });

  showModal(vaccinationModal);
});

// ------------------------- Save vaccination -------------------------
document.getElementById('saveVaccinationBtn').addEventListener('click', () => {
  const vaccineName = document.getElementById('vaccineNameInput').value.trim();
  const dateGiven = document.getElementById('vaccineDateInput').value;
  const dueDate = document.getElementById('vaccineDueDateInput').value;

  if (!vaccineName || !dateGiven) return Swal.fire({ icon: 'error', title:'Error', text:'Please enter vaccine name and date given' });

  vaccinationRecords.push({ vaccineName, dateGiven, dueDate });
  populateVaccinationsTable(vaccinationRecords);
  closeModal(vaccinationModal);
});

// ------------------------- Close modals -------------------------
document.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', e => closeModal(e.target.closest('.modal'))));

// ------------------------- EDIT FIELDS -------------------------
document.querySelectorAll('.edit-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const field = btn.getAttribute('data-field');   // Example: "petName"
    const span = document.getElementById(field + 'Value');
    const input = document.getElementById(field + 'Input');

    if (!span || !input) return;

    // Hide value, show input/textarea/select
    span.style.display = 'none';
    input.style.display = 'inline-block';
    input.value = span.textContent.trim();
    input.focus();

    // Special case: textarea should show as block
    if (input.tagName.toLowerCase() === 'textarea') {
      input.style.display = 'block';
    }

    // Save when user leaves input or presses Enter
    const saveHandler = () => {
      span.textContent = input.value.trim();
      input.style.display = 'none';
      span.style.display = 'inline';
      input.removeEventListener('blur', saveHandler);
      input.removeEventListener('keypress', keyHandler);
    };

    const keyHandler = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault(); // Prevent new line in textarea
        saveHandler();
      }
    };

    input.addEventListener('blur', saveHandler);
    input.addEventListener('keypress', keyHandler);
  });
});

// ------------------------- SAVE FUNCTIONS -------------------------
async function saveBasicInfo() {
  if (!currentPet) {
    return Swal.fire({ icon: 'error', title: 'Error', text: 'No pet selected' });
  }

  const basicDTO = {
    name: document.getElementById('petNameInput').value.trim(),
    type: document.getElementById('petTypeInput').value.trim(),
    breed: document.getElementById('petBreedInput').value.trim(),
    age: document.getElementById('petAgeInput').value.trim(),
  };

  try {
    const res = await fetch(`${API_BASE}/pets/${currentPet.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(basicDTO)
    });

    const data = await res.json();

    if (res.ok && data.status === 200) {
      // update spans after saving
      setTextValue('petName', basicDTO.name);
      setTextValue('petType', basicDTO.type);
      setTextValue('petBreed', basicDTO.breed);
      setTextValue('petAge', basicDTO.age);

      Swal.fire({ icon: 'success', title: 'Saved!', text: 'Pet info updated', timer: 2000, showConfirmButton: false });
      loadPets();
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: data.message || 'Failed to update pet info' });
    }
  } catch (err) {
    console.error(err);
    Swal.fire({ icon: 'error', title: 'Error', text: 'Error updating pet info' });
  }
}

async function saveCareInfo() {
  if (!currentPet) return Swal.fire({ icon: 'error', title: 'Error', text: 'No pet selected' });

  const careDTO = {
    food: document.getElementById('petFoodInput').value.trim(),
    routine: document.getElementById('petRoutineInput').value.trim()
  };

  try {
    const res = await fetch(`${API_BASE}/petcare/${currentPet.id}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(careDTO)
    });
    const data = await res.json();

    if (res.ok && data.status === 200) {
      // update spans
      setTextValue('petFood', careDTO.food);
      setTextValue('petRoutine', careDTO.routine);

      Swal.fire({ icon: 'success', title: 'Saved!', text: 'Care info saved', timer: 2000, showConfirmButton: false });
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: data.message || 'Failed to save care info' });
    }
  } catch (err) {
    console.error(err);
    Swal.fire({ icon: 'error', title: 'Error', text: 'Error saving care info' });
  }
}

async function saveHealthInfo() {
  if (!currentPet) return Swal.fire({ icon: 'error', title: 'Error', text: 'No pet selected' });

  const healthDTO = {
    veterinarian: document.getElementById('petVetInput').value.trim(),
    medicalNotes: document.getElementById('petMedicalInput').value.trim()
  };

  try {
    const res = await fetch(`${API_BASE}/pet-health/${currentPet.id}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(healthDTO)
    });
    const data = await res.json();

    if (res.ok && data.status === 200) {
      // ✅ update spans
      setTextValue('petVet', healthDTO.veterinarian);
      setTextValue('petMedical', healthDTO.medicalNotes);

      Swal.fire({ icon: 'success', title: 'Saved!', text: 'Health info saved', timer: 2000, showConfirmButton: false });
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: data.message || 'Failed to save health info' });
    }
  } catch (err) {
    console.error(err);
    Swal.fire({ icon: 'error', title: 'Error', text: 'Error saving health info' });
  }
}

async function saveVaccinations() {
  if (!currentPet) {
    return Swal.fire({ icon:'error', title:'Error', text:'No pet selected' });
  }

  if (!vaccinationRecords.length) {
    return Swal.fire({ icon:'info', title:'Info', text:'No vaccinations to save' });
  }

  try {
    for (const vax of vaccinationRecords) {
      const payload = {
        petVaccinationId: vax.petVaccinationId || null,
        vaccineName: vax.vaccineName || '',
        dateGiven: vax.dateGiven ? new Date(vax.dateGiven).toISOString().split('T')[0] : null,
        dueDate: vax.dueDate ? new Date(vax.dueDate).toISOString().split('T')[0] : null
      };

      const res = await fetch(`${API_BASE}/vaccination/${currentPet.id}`, {
        method: 'PUT',  // or POST if adding new
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)  // single object now
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error response:', res.status, errorText);
        return Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Failed to save vaccination: ${res.status} ${errorText || ''}`
        });
      }
    }

    Swal.fire({
      icon: 'success',
      title: 'Saved!',
      text: 'All vaccinations saved',
      timer: 2000,
      showConfirmButton: false
    });

  } catch (err) {
    console.error(err);
    Swal.fire({ icon: 'error', title: 'Error', text: 'Error saving vaccinations' });
  }
}

// ------------------------- Add the new savePet function here -------------------------
async function savePet() {
  const petDTO = {
    name: document.getElementById('petNameInput').value.trim(),
    type: document.getElementById('petTypeInput').value.trim(),
    breed: document.getElementById('petBreedInput').value.trim(),
    age: document.getElementById('petAgeInput').value.trim()
  };

  try {
    let res;
    if (currentPet) {
      res = await fetch(`${API_BASE}/pets/${currentPet.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(petDTO)
      });
    } else {
      res = await fetch(`${API_BASE}/pets/addPet`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(petDTO)
      });
    }

    let data={};
    try {
      data = await res.json();
    } catch (err) {
      console.warn("Response not JSON:", err);
    }

    if (res.ok && data.status === 200) {
      currentPet = data.data;

      Swal.fire({ icon:'success', title:'Saved!', text:'Pet saved successfully', timer:2000, showConfirmButton:false });
      loadPets();
      return true;
    } else {
      Swal.fire({ icon:'error', title:'Error', text:data.message || 'Failed to save pet' });
      return false;
    }
  } catch (err) {
    console.error(err);
    Swal.fire({ icon:'error', title:'Error', text:'Error saving pet' });
    return false;
  }
}

document.getElementById('saveAllBtn').addEventListener('click', async () => {
  const petSaved = await savePet();

  if (petSaved && currentPet) {
    await saveCareInfo();
    await saveHealthInfo();
    await saveVaccinations();

    const updatedName = document.getElementById('petNameInput').value.trim();
    const updatedType = document.getElementById('petTypeInput').value.trim();
    const updatedAge = document.getElementById('petAgeInput').value.trim();

    document.getElementById('modalPetName').textContent = updatedName;
    document.getElementById('modalPetType').textContent = `${updatedType} • ${updatedAge} years`;

    if (currentPet.image) {
      const updatedImageUrl = getPetImageUrl(currentPet.image) + '?t=' + new Date().getTime();
      document.getElementById('modalPetImage').src = updatedImageUrl;
    }

    console.log('Modal header updated without refresh');
  }
});

// ------------------------- INIT -------------------------
window.addEventListener('DOMContentLoaded', () => {
  petModal = document.getElementById('petModal');
  loadPets();

  // ------------------------- ADD PET BUTTON -------------------------
  const addPetBtn = document.getElementById('addPetBtn');
  if (addPetBtn) {
    addPetBtn.addEventListener('click', openAddPetModal);
  }
});
