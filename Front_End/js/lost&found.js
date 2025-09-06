// ===================== GLOBAL VARIABLES =====================
let reportsData = [];
let filteredReports = [];
let map;
let markers = [];
let geocoder;

const container = document.getElementById('reportedPetsContainer');
const modalTitle = document.getElementById('modalPetTitle');
const modalBody = document.getElementById('modalPetDetails');
const petModal = new bootstrap.Modal(document.getElementById('petDetailModal'));

// ===================== INITIALIZATION =====================
document.addEventListener('DOMContentLoaded', async () => {
  await loadReports();
});

// Google Maps callback
window.initMap = async function () {
  map = new google.maps.Map(document.getElementById('lostFoundMap'), {
    center: { lat: 7.8731, lng: 80.7718 },
    zoom: 7,
    styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }]
  });

  geocoder = new google.maps.Geocoder();

  if (filteredReports.length > 0) {
    await processReportCoordinates(filteredReports);
    addMarkers(filteredReports);
  }
};

// ===================== LOAD REPORTS =====================
async function loadReports() {
  try {
    const token = localStorage.getItem('jwtToken');
    const res = await fetch('http://localhost:8080/pet-report/all', {
      headers: { "Authorization": `Bearer ${token}` }
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to fetch reports');

    reportsData = result.data || [];
    filteredReports = [...reportsData];

    renderReports(filteredReports);

    if (typeof google !== 'undefined' && map) {
      await processReportCoordinates(filteredReports);
      addMarkers(filteredReports);
    }

  } catch (err) {
    console.error('Error loading reports:', err);
    Swal.fire('Error', 'Failed to load reports. Please try again later.', 'error');
  }
}

// ===================== PROCESS REPORT COORDINATES =====================
async function processReportCoordinates(reports) {
  for (const report of reports) {
    if (!report.coordinates || !report.coordinates.lat || !report.coordinates.lng) {
      try {
        report.coordinates = await geocodeLocation(report.location);
      } catch (error) {
        console.warn(`Could not geocode location: ${report.location}`, error);
        report.coordinates = { lat: 6.9271, lng: 79.8612 }; // Colombo fallback
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

// ===================== RENDER REPORT CARDS =====================
function renderReports(reportsArray) {
  container.innerHTML = '';

  if (reportsArray.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="fas fa-paw fa-3x mb-3 text-muted"></i>
        <h4 class="text-muted">No pet reports found</h4>
        <p>Be the first to report a lost or found pet!</p>
      </div>
    `;
    return;
  }

  reportsArray.forEach((report, index) => {
    const card = document.createElement('div');
    card.className = 'col-md-6 col-lg-4 mb-4 report-card-container';
    card.innerHTML = `
      <div class="card shadow-sm h-100 report-card position-relative overflow-hidden" 
           data-index="${index}" 
           style="transition: transform 0.3s, box-shadow 0.3s;">
        <img src="${report.imageUrl}" 
             class="card-img-top" 
             alt="${report.petName || 'No name'}" 
             style="height: 220px; object-fit: cover; border-bottom: 2px solid #ddd;">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title text-truncate">${report.petName || "(No name)"}</h5>
          <p class="mb-1">
            <span class="badge ${report.type === 'LOST' ? 'bg-danger' : 'bg-success'}">
              ${report.type}
            </span>
          </p>
          <p class="card-text text-truncate"><strong>Location:</strong> ${report.location}</p>
          <div class="mt-auto d-flex flex-wrap gap-2">
            <button class="btn btn-outline-secondary btn-sm flex-grow-1 view-details">View Details</button>
            <button class="btn btn-outline-primary btn-sm flex-grow-1 view-location">View Location</button>
            <button class="btn btn-outline-warning btn-sm flex-grow-1 edit-report">Edit</button>
            <button class="btn btn-outline-danger btn-sm flex-grow-1 delete-report">Delete</button>
          </div>
        </div>
      </div>
    `;

    // Add hover effect
    const innerCard = card.querySelector('.report-card');
    innerCard.addEventListener('mouseenter', () => {
      innerCard.style.transform = 'scale(1.03)';
      innerCard.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';
    });
    innerCard.addEventListener('mouseleave', () => {
      innerCard.style.transform = 'scale(1)';
      innerCard.style.boxShadow = '0 4px 10px rgba(0,0,0,0.15)';
    });

    container.appendChild(card);
  });

  attachCardEventListeners(reportsArray);
}

function attachCardEventListeners(reportsArray) {
  document.querySelectorAll('.view-details').forEach(btn =>
      btn.addEventListener('click', () => showReportDetails(reportsArray[btn.closest('.report-card').dataset.index].reportId))
  );
  document.querySelectorAll('.view-location').forEach(btn =>
      btn.addEventListener('click', () => showReportOnMap(reportsArray[btn.closest('.report-card').dataset.index].reportId))
  );
  document.querySelectorAll('.edit-report').forEach(btn =>
      btn.addEventListener('click', () => editReport(reportsArray[btn.closest('.report-card').dataset.index].reportId))
  );
  document.querySelectorAll('.delete-report').forEach(btn =>
      btn.addEventListener('click', () => deleteReport(reportsArray[btn.closest('.report-card').dataset.index].reportId))
  );
}

// ===================== MAP MARKERS =====================
function addMarkers(reportsArray) {
  markers.forEach(m => m.setMap(null));
  markers = [];

  reportsArray.forEach(report => {
    if (!report.coordinates) return;

    const marker = new google.maps.Marker({
      map,
      position: report.coordinates,
      title: report.petName || "(No name)",
      icon: {
        url: report.type === 'Lost'
            ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
            : 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
        scaledSize: new google.maps.Size(32, 32)
      }
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div class="map-info-window">
          <img src="${report.imageUrl}" alt="${report.petName || 'No name'}" style="width: 100%; max-height: 150px; object-fit: cover;">
          <h5>${report.petName || "(No name)"}</h5>
          <p><strong>Type:</strong> ${report.type}</p>
          <p><strong>Location:</strong> ${report.location}</p>
          <p><strong>Description:</strong> ${report.description?.substring(0, 100) || ''}${report.description?.length > 100 ? '...' : ''}</p>
        </div>
      `
    });

    marker.addListener('click', () => infoWindow.open(map, marker));
    marker.reportId = report.reportId;
    markers.push(marker);
  });
}

// ===================== SHOW DETAILS =====================
function showReportDetails(reportId) {
  const report = reportsData.find(r => r.reportId === reportId);
  if (!report) return;

  modalTitle.textContent = `${report.type} - ${report.petName || "(No name)"}`;
  modalBody.innerHTML = `
    <div class="row">
      <div class="col-md-6">
        <img src="${report.imageUrl}" class="img-fluid rounded" alt="${report.petName || "(No name)"}">
      </div>
      <div class="col-md-6">
        <p><strong>Description:</strong> ${report.description}</p>
        <p><strong>Location:</strong> ${report.location}</p>
        <p><strong>Reported on:</strong> ${new Date(report.reportedAt).toLocaleDateString()}</p>
      </div>
    </div>
  `;
  petModal.show();
}

// ===================== SHOW REPORT ON MAP =====================
function showReportOnMap(reportId) {
  const report = reportsData.find(r => r.reportId === reportId);
  if (!report || !report.coordinates) {
    Swal.fire("Location not available", "This report does not have location data.", "info");
    return;
  }

  map.setCenter(report.coordinates);
  map.setZoom(15);

  const marker = markers.find(m => m.reportId === reportId);
  if (marker) google.maps.event.trigger(marker, 'click');

  document.getElementById('map-section').scrollIntoView({ behavior: 'smooth' });
}

// ===================== DELETE =====================
async function deleteReport(reportId) {
  Swal.fire({
    title: 'Are you sure?',
    text: "Do you want to delete this report?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('jwtToken');
        const res = await fetch(`http://localhost:8080/pet-report/${reportId}`, {
          method: 'DELETE',
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to delete');

        Swal.fire('Deleted!', 'The report has been removed.', 'success');
        await loadReports();
      } catch (err) {
        console.error(err);
        Swal.fire('Error!', 'Something went wrong while deleting.', 'error');
      }
    }
  });
}

// ===================== EDIT PLACEHOLDER =====================
let editReportModal = new bootstrap.Modal(document.getElementById('editReportModal'));

function editReport(reportId) {
  const report = reportsData.find(r => r.reportId === reportId);
  if (!report) return;

  // Fill modal with report data
  document.getElementById('editReportId').value = report.reportId;
  document.getElementById('editPetName').value = report.petName || '';
  document.getElementById('editDescription').value = report.description || '';
  document.getElementById('editLocation').value = report.location || '';
  document.getElementById('editType').value = report.type || 'LOST';

  // Open modal
  editReportModal.show();
}

// Handle form submit
document.getElementById('editReportForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const reportId = document.getElementById('editReportId').value;
  const petName = document.getElementById('editPetName').value;
  const description = document.getElementById('editDescription').value;
  const location = document.getElementById('editLocation').value;
  const type = document.getElementById('editType').value;
  const imageFile = document.getElementById('editImage').files[0];

  const formData = new FormData();
  formData.append('data', new Blob([JSON.stringify({ petName, description, location, type })], { type: 'application/json' }));
  if (imageFile) formData.append('image', imageFile);

  try {
    const token = localStorage.getItem('jwtToken');
    const res = await fetch(`http://localhost:8080/pet-report/${reportId}`, {
      method: 'PUT',
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Update failed");

    Swal.fire("Updated!", "Pet report updated successfully.", "success");
    editReportModal.hide();

    // Refresh reports
    await loadReports();

  } catch (err) {
    console.error(err);
    Swal.fire("Error", "Failed to update pet report.", "error");
  }
});

// ===================== FORM SUBMISSION =====================
document.getElementById('lostForm').addEventListener('submit', handleFormSubmit);
document.getElementById('foundForm').addEventListener('submit', handleFormSubmit);

async function handleFormSubmit(e) {
  e.preventDefault();

  const formId = e.target.id;
  const isLostForm = formId === 'lostForm';
  const formData = new FormData();

  const petName = document.getElementById(isLostForm ? 'lostPetName' : 'foundPetName').value;
  const description = document.getElementById(isLostForm ? 'lostPetDescription' : 'foundPetDescription').value;
  const location = document.getElementById(isLostForm ? 'lostPetLocation' : 'foundPetLocation').value;
  const photoFile = document.getElementById(isLostForm ? 'lostPetPhotos' : 'foundPetPhotos').files[0];
  const type = isLostForm ? 'LOST' : 'FOUND';

  if (!description || !location || !photoFile) {
    Swal.fire('Error', 'Please fill all required fields', 'error');
    return;
  }

  // Wrap non-file fields in DTO JSON
  const dto = { petName, description, location, type };
  formData.append('data', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
  formData.append('image', photoFile);

  try {
    const token = localStorage.getItem('jwtToken');
    const userId = localStorage.getItem('userId'); // Make sure you save this at login
    const res = await fetch(`http://localhost:8080/pet-report/${userId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to submit report');

    Swal.fire('Success!', 'Your report has been submitted.', 'success');
    e.target.reset();
    await loadReports();

  } catch (err) {
    console.error('Error submitting form:', err);
    Swal.fire('Error', 'Failed to submit report. Please try again.', 'error');
  }
}

// ===================== FILTER =====================
function filterReports() {
  const type = document.getElementById('typeFilter')?.value;
  const location = document.getElementById('locationFilter')?.value.toLowerCase();
  const myReportsOnly = document.getElementById('myReportsOnly')?.checked;
  const loggedUserId = localStorage.getItem('userId');

  filteredReports = reportsData.filter(r => {
    let matchesType = !type || r.type === type;
    let matchesLocation = !location || r.location.toLowerCase().includes(location);
    let matchesUser = !myReportsOnly || r.userId == loggedUserId; // assuming r.userId exists

    return matchesType && matchesLocation && matchesUser;
  });

  renderReports(filteredReports);
  addMarkers(filteredReports);
}

document.getElementById('applyFilter').addEventListener('click', filterReports);

document.getElementById('resetFilter').addEventListener('click', () => {
  document.getElementById('typeFilter').value = '';
  document.getElementById('locationFilter').value = '';
  document.getElementById('myReportsOnly').checked = false;
  filteredReports = [...reportsData];
  renderReports(filteredReports);
  addMarkers(filteredReports);
});
