const form = document.getElementById('vetAppointmentForm');
const container = document.getElementById('appointmentsContainer');
const modal = new bootstrap.Modal(document.getElementById('appointmentDetailModal'));
const titleEl = document.getElementById('modalAppointmentTitle');
const bodyEl = document.getElementById('modalAppointmentDetails');

let appointments = [];

// Get JWT and userId from localStorage
const token = localStorage.getItem('jwtToken');
const userId = localStorage.getItem('userId');

if (!token || !userId) {
  Swal.fire({
    icon: 'error',
    title: 'Unauthorized',
    text: 'You must be logged in!'
  }).then(() => {
    throw new Error('No JWT token or userId found');
  });
}

// -------- Fetch all appointments --------
function loadAppointments() {
  fetch(`http://localhost:8080/vet-appointment/user`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
      .then(res => res.json())
      .then(data => {
        if (data.status === 200) {
          appointments = data.data.map(a => ({
            ...a,
            _id: a.vetAppointmentId || a.appointmentId || a.id // normalize ID
          }));
          console.log("Appointments loaded:", appointments);
          renderAppointments();
        } else {
          Swal.fire('Error', data.message || 'Failed to load appointments', 'error');
        }
      })
      .catch(err => Swal.fire('Error', 'Failed to load appointments', 'error'));
}

// -------- Render appointments in cards --------
function renderAppointments() {
  container.innerHTML = '';
  appointments.forEach((apt, index) => {
    const card = document.createElement('div');
    card.className = "col-md-6 col-lg-4";
    card.innerHTML = `
      <div class="card glass-form p-3 shadow-sm cursor-pointer" data-index="${index}">
        <h5>${apt.petName} (${apt.serviceType})</h5>
        <p><strong>Date:</strong> ${new Date(apt.appointmentDateTime).toLocaleString()}</p>
        <p><strong>Owner:</strong> ${apt.ownerName}</p>
        <div class="mt-2 d-flex justify-content-between">
            <button class="btn btn-sm btn-outline-primary edit-btn">Edit</button>
            <button class="btn btn-sm btn-outline-danger delete-btn">Delete</button>
        </div>
      </div>`;

    // reference the inner .card div
    const innerCard = card.querySelector('.card');

    // Attach card click
    innerCard.addEventListener('click', () => showDetails(index));

    // Attach edit click
    innerCard.querySelector('.edit-btn').addEventListener('click', (e) => {
      e.stopPropagation(); // stop bubbling
      editAppointment(apt.vetAppointmentId);
    });

    // Attach delete click
    innerCard.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.stopPropagation(); // stop bubbling
      deleteAppointment(apt.vetAppointmentId);
    });

    container.appendChild(card);
  });
}

// -------- Show modal details --------
function showDetails(i) {
  const apt = appointments[i];
  titleEl.textContent = `Appointment for ${apt.petName}`;
  bodyEl.innerHTML = `
    <p><strong>Owner:</strong> ${apt.ownerName}</p>
    <p><strong>Contact:</strong> ${apt.ownerContactNumber}</p>
    <p><strong>Service:</strong> ${apt.serviceType}</p>
    <p><strong>Date & Time:</strong> ${new Date(apt.appointmentDateTime).toLocaleString()}</p>
    <p><strong>Notes:</strong> ${apt.notes || 'None'}</p>`;
  modal.show();
}

// -------- Submit new appointment --------
function submitNewAppointment(e) {
  e.preventDefault();
  const data = {
    ownerName: form.ownerName.value.trim(),
    ownerContactNumber: form.ownerContact.value.trim(),
    petName: form.petName.value.trim(),
    serviceType: form.petService.value,
    appointmentDateTime: form.appointmentDate.value,
    notes: form.notes.value.trim(),
    userId: userId
  };

  fetch(`http://localhost:8080/vet-appointment/${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  })
      .then(res => res.json())
      .then(resp => {
        if (resp.status === 200) {
          const newApt = {
            ...resp.data,
            _id: resp.data.vetAppointmentId || resp.data.appointmentId || resp.data.id
          };
          appointments.push(newApt);
          renderAppointments();
          form.reset();
          Swal.fire('Success', 'Appointment created', 'success');
        } else {
          Swal.fire('Error', resp.message || 'Failed to create appointment', 'error');
        }
      })
      .catch(err => Swal.fire('Error', 'Failed to create appointment', 'error'));
}

// Attach submit handler
form.onsubmit = submitNewAppointment;

// -------- Edit appointment --------
function editAppointment(appointmentId) {
  const apt = appointments.find(a => a._id === appointmentId);
  if (!apt) return;

  form.ownerName.value = apt.ownerName;
  form.ownerContact.value = apt.ownerContactNumber;
  form.petName.value = apt.petName;
  form.petService.value = apt.serviceType;
  form.appointmentDate.value = new Date(apt.appointmentDateTime).toISOString().slice(0,16);
  form.notes.value = apt.notes;

  form.onsubmit = e => {
    e.preventDefault();
    const updatedData = {
      ownerName: form.ownerName.value.trim(),
      ownerContactNumber: form.ownerContact.value.trim(),
      petName: form.petName.value.trim(),
      serviceType: form.petService.value,
      appointmentDateTime: form.appointmentDate.value,
      notes: form.notes.value.trim(),
      userId: userId
    };

    fetch(`http://localhost:8080/vet-appointment/${appointmentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updatedData)
    })
        .then(res => res.json())
        .then(resp => {
          if (resp.status === 200) {
            const updatedApt = {
              ...resp.data,
              _id: resp.data.vetAppointmentId || resp.data.appointmentId || resp.data.id
            };
            const index = appointments.findIndex(a => a._id === appointmentId);
            appointments[index] = updatedApt;
            renderAppointments();
            form.reset();
            Swal.fire('Success', 'Appointment updated', 'success');
            form.onsubmit = submitNewAppointment;
          } else {
            Swal.fire('Error', resp.message || 'Failed to update appointment', 'error');
          }
        })
        .catch(err => Swal.fire('Error', 'Failed to update appointment', 'error'));
  };
}

// -------- Delete appointment --------
function deleteAppointment(appointmentId) {
  Swal.fire({
    title: 'Are you sure?',
    text: 'This appointment will be deleted.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!'
  }).then(result => {
    if (result.isConfirmed) {
      fetch(`http://localhost:8080/vet-appointment/${appointmentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
          .then(res => res.json())
          .then(resp => {
            if (resp.status === 200) {
              appointments = appointments.filter(a => a._id !== appointmentId);
              renderAppointments();
              Swal.fire('Deleted!', 'Appointment has been deleted.', 'success');
            } else {
              Swal.fire('Error', resp.message || 'Failed to delete appointment', 'error');
            }
          })
          .catch(err => Swal.fire('Error', 'Failed to delete appointment', 'error'));
    }
  });
}

// -------- Initialize --------
loadAppointments();
