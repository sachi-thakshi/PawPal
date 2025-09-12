const BASE_URL = "http://localhost:8080/adoption-requests";
const NOTIFICATIONS_URL = "http://localhost:8080/notifications";
const TOKEN = localStorage.getItem("jwtToken");

// Show welcome message
document.addEventListener("DOMContentLoaded", () => {
  const welcomeSpan = document.querySelector(".welcome-h1 span");
  const username = localStorage.getItem("username") || "User";
  if (welcomeSpan) welcomeSpan.textContent = username;

  loadAdoptionRequests();
  loadNotifications();
});

// Show notification
function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `alert alert-${type === 'success' ? 'success' : 'warning'} alert-dismissible fade show position-fixed`;
  notification.style.cssText = `
        top: 100px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
  notification.innerHTML = `
        <strong>${type === 'success' ? 'Success!' : 'Info'}</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
  document.body.appendChild(notification);
  setTimeout(() => {
    if (notification.parentNode) notification.remove();
  }, 5000);
}

// Fetch adoption requests from backend
async function fetchPendingRequests() {
  try {
    const response = await fetch(`${BASE_URL}/owner`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error(error);
    showNotification("Failed to fetch adoption requests.", "warning");
    return [];
  }
}

// Populate table with adoption requests
async function loadAdoptionRequests() {
  const requests = await fetchPendingRequests();
  const tableBody = document.getElementById("requestsTableBody");
  tableBody.innerHTML = "";

  requests.forEach(req => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${req.petType || "Unknown"}</td>
      <td><img src="${req.petImage || ''}" class="pet-image" /></td>
      <td>${req.petName || "Unknown"}</td>
      <td>${req.petLocation || "Unknown"}</td> 
      <td>${req.requestDate ? new Date(req.requestDate).toLocaleDateString() : "Unknown"}</td>
      <td>${req.requesterName || "Unknown"}</td>
      <td><a href="mailto:${req.requesterEmail || ""}">${req.requesterEmail || "Unknown"}</a></td>
      <td>
        ${req.approved === null
        ? '<span class="status-pending">Pending</span>'
        : (req.approved ? '<span class="status-approved">Approved</span>' : '<span class="status-declined">Declined</span>')}
      </td>
      <td class="action-cell">
        ${req.approved === null ? "" : "Action Complete"}
      </td>
    `;

    tableBody.appendChild(row);

    // Attach buttons via event listeners
    if (req.approved === null) {
      const actionCell = row.querySelector(".action-cell");

      const approveBtn = document.createElement("button");
      approveBtn.className = "btn btn-approve me-2";
      approveBtn.textContent = "Approve";
      approveBtn.addEventListener("click", () => approveRequest(req.requestId, req.petName));

      const declineBtn = document.createElement("button");
      declineBtn.className = "btn btn-decline";
      declineBtn.textContent = "Decline";
      declineBtn.addEventListener("click", () => declineRequest(req.requestId));

      actionCell.appendChild(approveBtn);
      actionCell.appendChild(declineBtn);
    }
  });

  updateNotificationBadge(requests);
}

// Approve request
async function approveRequest(requestId, petName) {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `Do you want to approve the adoption request for ${petName}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, approve it!',
    cancelButtonText: 'Cancel'
  });

  if (result.isConfirmed) {
    try {
      const response = await fetch(`${BASE_URL}/${requestId}/approve`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      if (data.status === 200) {
        Swal.fire('Approved!', `Request for ${petName} has been approved.Other requests for this pet have been declined. An email has been sent to the requester.`, 'success');
        loadAdoptionRequests(); // refresh table
      } else {
        Swal.fire('Error', data.message, 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Failed to approve request.', 'error');
    }
  }
}

// Decline request
async function declineRequest(requestId) {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "Do you want to decline this adoption request?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, decline it!',
    cancelButtonText: 'Cancel'
  });

  if (result.isConfirmed) {
    try {
      const response = await fetch(`${BASE_URL}/${requestId}/decline`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      if (data.status === 200) {
        Swal.fire('Declined!', `Request for ${data.data.petName} has been declined. An email has been sent to the requester.`, 'success');
        loadAdoptionRequests(); // refresh table
      } else {
        Swal.fire('Error', data.message || 'Failed to decline request.', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Failed to decline request.', 'error');
    }
  }
}

// Update pending badge
function updateNotificationBadge(requests) {
  const badge = document.getElementById("adoption-badge");
  const pendingCount = requests.filter(r => r.approved === null).length;
  badge.textContent = pendingCount;
  badge.style.display = pendingCount > 0 ? "flex" : "none";
}

// Fetch notifications from backend
async function fetchNotifications() {
  try {
    const response = await fetch(NOTIFICATIONS_URL, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || []; // assuming backend returns { status, data }
  } catch (err) {
    console.error("Error fetching notifications:", err);
    return [];
  }
}

// Populate notification cards
async function loadNotifications() {
  const notifications = await fetchNotifications();

  // Select the notification cards in HTML
  const adoptionCard = document.querySelector(".adoption-notification .notification-content");
  const adoptionBadge = document.getElementById("adoption-badge");

  const lostFoundCard = document.querySelector(".lost-found-notification .notification-content");
  const lostFoundBadge = document.querySelector(".lost-found-notification .notification-badge");

  const vaccinationCard = document.querySelector(".vaccination-notification .notification-content");
  const vaccinationBadge = document.querySelector(".vaccination-notification .notification-badge");

  // Clear previous content
  adoptionCard.innerHTML = "";
  lostFoundCard.innerHTML = "";
  vaccinationCard.innerHTML = "";

  let adoptionCount = 0;
  let lostFoundCount = 0;
  let vaccinationCount = 0;

  notifications.forEach(item => {
    if (item.type === "ADOPTION") {
      adoptionCard.innerHTML += `<p><strong>${item.title}</strong> ${item.message}</p>`;
      adoptionCount++;
    } else if (item.type === "LOST_FOUND") {
      lostFoundCard.innerHTML += `<p><strong>${item.title}</strong> ${item.message}</p>`;
      lostFoundCount++;
    } else if (item.type === "VACCINATION") {
      vaccinationCard.innerHTML += `<p><strong>${item.title}</strong> ${item.message}</p>`;
      vaccinationCount++;
    }
  });

  // Update badges
  adoptionBadge.textContent = adoptionCount;
  adoptionBadge.style.display = adoptionCount > 0 ? "flex" : "none";

  lostFoundBadge.textContent = lostFoundCount;
  lostFoundBadge.style.display = lostFoundCount > 0 ? "flex" : "none";

  vaccinationBadge.textContent = vaccinationCount;
  vaccinationBadge.style.display = vaccinationCount > 0 ? "flex" : "none";
}