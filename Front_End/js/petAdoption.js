// ===== GLOBAL VARIABLES =====
let pets = [];
let filteredPets = [];
let map;
let markers = [];
let geocoder;

const petContainer = document.getElementById('petContainer');
const modalTitle = document.getElementById('modalPetName');
const modalBody = document.getElementById('modalBody');
const petModal = new bootstrap.Modal(document.getElementById('petModal'));

const addPetForm = document.getElementById('addPetForm');
const addPetModal = new bootstrap.Modal(document.getElementById('addPetModal'));

const updatePetForm = document.getElementById('updatePetForm');
const updatePetModal = new bootstrap.Modal(document.getElementById('updatePetModal'));

const adoptBtn = document.getElementById('adoptBtn');

// ===== GOOGLE MAPS CALLBACK =====
window.initMap = async function () {
    const mapEl = document.getElementById('map');
    if (!mapEl) return;

    map = new google.maps.Map(mapEl, {
        center: { lat: 7.8731, lng: 80.7718 },
        zoom: 8
    });

    geocoder = new google.maps.Geocoder();
    await loadPets();
};

// ===== LOAD PETS =====
async function loadPets() {
    try {
        const token = localStorage.getItem('jwtToken');
        if (!token) throw new Error('No JWT token found');

        const res = await fetch('http://localhost:8080/pet-adoption/all');
        const result = await res.json();

        pets = Array.isArray(result.data) ? result.data : [];
        filteredPets = [...pets];

        await processPetCoordinates(filteredPets);
        renderPets(filteredPets);
        addMarkers(filteredPets);

    } catch (err) {
        console.error('Error loading pets:', err);
        Swal.fire('Error', 'Failed to load pets. Please try again later.', 'error');
    }
}

// ===== PROCESS PET COORDINATES =====
async function processPetCoordinates(petsArray) {
    for (const pet of petsArray) {
        if (!pet.coordinates || !pet.coordinates.lat || !pet.coordinates.lng) {
            try {
                pet.coordinates = await geocodeLocation(pet.location);
            } catch {
                pet.coordinates = { lat: 6.9271, lng: 79.8612 }; // fallback to Colombo
            }
        }
    }
}

async function geocodeLocation(address) {
    return new Promise((resolve, reject) => {
        if (!geocoder) return reject(new Error("Geocoder not initialized"));
        geocoder.geocode({ address }, (results, status) => {
            if (status === "OK" && results[0]) {
                const loc = results[0].geometry.location;
                resolve({ lat: loc.lat(), lng: loc.lng() });
            } else {
                reject(new Error(`Geocoding failed: ${status}`));
            }
        });
    });
}

// ===== RENDER PET CARDS =====
function renderPets(petsArray) {
    if (!petContainer) return;
    petContainer.innerHTML = '';

    if (petsArray.length === 0) {
        petContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-paw fa-3x mb-3 text-muted"></i>
                <h4 class="text-muted">No pets found</h4>
                <p>Try adding new pets to adoption!</p>
            </div>
        `;
        return;
    }

    petsArray.forEach((pet, index) => {
        const card = document.createElement('div');
        card.className = 'col-lg-4 col-md-6 mb-4 pet-card-container';
        card.dataset.index = index;
        card.dataset.petId = pet.petAdoptionId;

        card.innerHTML = `
            <div class="card shadow-sm h-100">
                <img src="${pet.petImage || ''}" class="card-img-top" alt="${pet.petName || 'No name'}" style="height:220px; object-fit:cover;">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${pet.petName || "(No name)"}</h5>
                    <p class="card-text"><strong>Type:</strong> ${pet.type || 'Unknown'}</p>
                    <p class="card-text"><strong>Location:</strong> ${pet.location}</p>
                    <div class="mt-auto d-flex gap-2 flex-wrap">
                        <button class="btn btn-outline-secondary btn-sm view-details">View Details</button>
                        <button class="btn btn-outline-primary btn-sm view-location">View Location</button>
                        <button class="btn btn-outline-warning btn-sm update-pet">Update</button>
                        <button class="btn btn-outline-danger btn-sm delete-pet">Delete</button>
                    </div>
                </div>
            </div>
        `;
        petContainer.appendChild(card);
    });

    attachCardEventListeners(petsArray);
}

// ===== ATTACH CARD EVENT LISTENERS =====
function attachCardEventListeners(petsArray) {
    document.querySelectorAll('.view-details').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = btn.closest('.pet-card-container').dataset.index;
            showPetDetails(petsArray[idx].petAdoptionId);
        });
    });

    document.querySelectorAll('.view-location').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = btn.closest('.pet-card-container').dataset.index;
            showPetOnMap(petsArray[idx].petAdoptionId);
        });
    });

    document.querySelectorAll('.update-pet').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = btn.closest('.pet-card-container').dataset.index;
            openUpdateModal(petsArray[idx]);
        });
    });

    document.querySelectorAll('.delete-pet').forEach(btn => {
        btn.addEventListener('click', async () => {
            const idx = btn.closest('.pet-card-container').dataset.index;
            await deletePet(petsArray[idx].petAdoptionId);
        });
    });
}

// ===== MAP MARKERS =====
function addMarkers(petsArray) {
    if (!map) return;

    markers.forEach(m => m.setMap(null));
    markers = [];

    petsArray.forEach(pet => {
        if (!pet.coordinates) return;

        const marker = new google.maps.Marker({
            map,
            position: pet.coordinates,
            title: pet.petName || "(No name)"
        });

        const infoWindow = new google.maps.InfoWindow({
            content: `<div style="max-width:200px;">
                        <img src="${pet.petImage || ''}" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:10px;">
                        <h6>${pet.petName || "(No name)"}</h6>
                        <p><strong>Location:</strong> ${pet.location}</p>
                        <button onclick="showPetDetails(${pet.petAdoptionId})" class="btn btn-sm btn-danger">Learn More</button>
                      </div>`
        });

        marker.addListener('click', () => {
            infoWindow.open(map, marker);
            highlightCard(pet.petAdoptionId);
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(() => marker.setAnimation(null), 2000);
        });

        marker.petId = pet.petAdoptionId;
        markers.push(marker);
    });
}

// ===== HIGHLIGHT CARD =====
function highlightCard(petId) {
    const card = document.querySelector(`.pet-card-container[data-pet-id="${petId}"]`);
    if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.classList.add('highlight-card');
        setTimeout(() => card.classList.remove('highlight-card'), 2000);
    }
}

// ===== SHOW DETAILS & ADOPT =====
function showPetDetails(petId) {
    const pet = pets.find(p => p.petAdoptionId === petId);
    if (!pet) return;

    modalTitle.textContent = pet.petName;
    modalTitle.dataset.petId = petId;

    modalBody.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <img src="${pet.petImage || ''}" class="img-fluid rounded" alt="${pet.petName}">
            </div>
            <div class="col-md-6">
                <p><strong>Breed:</strong> ${pet.breed}</p>
                <p><strong>Age:</strong> ${capitalizeFirst(pet.age)}</p>
                <p><strong>Location:</strong> ${pet.location}</p>
                <p><strong>Description:</strong> ${pet.description}</p>
            </div>
        </div>
    `;

    petModal.show();
}

// ===== ADOPT PET =====
if (adoptBtn) {
    adoptBtn.addEventListener('click', async () => {
        const petId = modalTitle.dataset.petId;
        if (!petId) return;

        try {
            const token = localStorage.getItem('jwtToken');
            if (!token) throw new Error('Please log in to adopt a pet.');

            const response = await fetch(`http://localhost:8080/pet-adoption/request/${petId}`, {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json().catch(() => ({ message: 'Unknown error' }));

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send adoption request.');
            }

            Swal.fire('Success', data.message, 'success');
            petModal.hide();

        } catch (err) {
            console.error('Error creating adoption request:', err);
            Swal.fire('Error', err.message || 'Failed to send adoption request.', 'error');
        }
    });
}

// ===== SHOW PET ON MAP =====
function showPetOnMap(petId) {
    const pet = pets.find(p => p.petAdoptionId === petId);
    if (!pet || !pet.coordinates) return;

    map.setCenter(pet.coordinates);
    map.setZoom(15);

    const marker = markers.find(m => m.petId === petId);
    if (marker) google.maps.event.trigger(marker, 'click');

    document.getElementById('map-section').scrollIntoView({ behavior: 'smooth' });
}

// ===== UTILITIES =====
function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ===== FILTER =====
document.getElementById('applyFilter').addEventListener('click', filterPets);
document.getElementById('resetFilter').addEventListener('click', async () => {
    document.getElementById('typeFilter').value = '';
    document.getElementById('ageFilter').value = '';
    document.getElementById('locationFilter').value = '';
    filteredPets = [...pets];
    await processPetCoordinates(filteredPets);
    renderPets(filteredPets);
    addMarkers(filteredPets);
});

async function filterPets() {
    const type = document.getElementById('typeFilter').value;
    const age = document.getElementById('ageFilter').value;
    const loc = document.getElementById('locationFilter').value.toLowerCase();

    filteredPets = pets.filter(p =>
        (!type || p.type === type) &&
        (!age || p.age === age) &&
        (!loc || (p.location && p.location.toLowerCase().includes(loc)))
    );

    await processPetCoordinates(filteredPets);
    renderPets(filteredPets);
    addMarkers(filteredPets);
}

// ===== ADD PET =====
addPetForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('jwtToken');
    if (!token) {
        Swal.fire('Unauthorized', 'Please log in to add a pet.', 'warning');
        return;
    }

    const formData = new FormData(addPetForm);

    try {
        const res = await fetch('http://localhost:8080/pet-adoption/add', {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        let data;
        if (res.ok) {
            data = await res.json();
        } else {
            try {
                data = await res.json();
            } catch {
                data = { message: res.statusText || 'Unknown error' };
            }
            throw new Error(data.message || 'Failed to add pet');
        }

        pets.push(data.data);
        filteredPets = [...pets];
        await processPetCoordinates(filteredPets);
        renderPets(filteredPets);
        addMarkers(filteredPets);

        Swal.fire('Success', 'Pet added successfully', 'success');
        addPetForm.reset();
        addPetModal.hide();

    } catch (err) {
        console.error('Add pet error:', err);
        Swal.fire('Error', err.message, 'error');
    }
});

// ===== UPDATE PET =====
function openUpdateModal(pet) {
    updatePetForm.petAdoptionId.value = pet.petAdoptionId;
    updatePetForm.petName.value = pet.petName || '';
    updatePetForm.type.value = pet.type || '';
    updatePetForm.breed.value = pet.breed || '';
    updatePetForm.age.value = pet.age || '';
    updatePetForm.gender.value = pet.gender || '';
    updatePetForm.location.value = pet.location || '';
    updatePetForm.description.value = pet.description || '';
    updatePetModal.show();
}

updatePetForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('jwtToken');
    if (!token) {
        Swal.fire('Unauthorized', 'Please log in to update a pet.', 'warning');
        return;
    }

    const formData = new FormData(updatePetForm);

    try {
        const res = await fetch('http://localhost:8080/pet-adoption/update', {
            method: 'PUT',
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Failed to update pet');

        // Update the pet in pets array
        const idx = pets.findIndex(p => p.petAdoptionId === data.data.petAdoptionId);
        if (idx !== -1) {
            pets[idx] = data.data;
        }

        filteredPets = [...pets];
        await processPetCoordinates(filteredPets);
        renderPets(filteredPets);
        addMarkers(filteredPets);

        Swal.fire('Success', 'Pet updated successfully', 'success');
        updatePetForm.reset();
        updatePetModal.hide();

    } catch (err) {
        console.error('Update pet error:', err);
        Swal.fire('Error', 'Failed to update pet.', 'error');
    }
});

// ===== DELETE PET =====
async function deletePet(petId) {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        Swal.fire('Unauthorized', 'Please log in to delete a pet.', 'warning');
        return;
    }

    const confirmed = await Swal.fire({
        title: 'Are you sure?',
        text: 'This will delete the pet permanently.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!'
    });

    if (!confirmed.isConfirmed) return;

    try {
        const res = await fetch(`http://localhost:8080/pet-adoption/${petId}`, {
            method: 'DELETE',
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error('Failed to delete pet');

        // Remove pet from local arrays
        pets = pets.filter(p => p.petAdoptionId !== petId);
        filteredPets = filteredPets.filter(p => p.petAdoptionId !== petId);

        renderPets(filteredPets);
        addMarkers(filteredPets);

        Swal.fire('Deleted!', 'Pet has been deleted.', 'success');

    } catch (err) {
        console.error('Delete pet error:', err);
        Swal.fire('Error', 'Failed to delete pet.', 'error');
    }
}
