const BASE_URL = "http://localhost:8080/adoption-requests";
const NOTIFICATIONS_URL = "http://localhost:8080/notifications";

const TOKEN = localStorage.getItem("jwtToken");
const myEmail = localStorage.getItem("email");
const myName = localStorage.getItem("username") || "You";


let socket;
let targetEmail = null;
let targetName = null;

// ---------------------------
// Initialization
// ---------------------------
document.addEventListener("DOMContentLoaded", () => {
  const welcomeSpan = document.querySelector(".welcome-h1 span");
  const username = localStorage.getItem("username") || "User";
  if (welcomeSpan) welcomeSpan.textContent = username;

  loadAdoptionRequests();
  loadSentRequests();
  loadNotifications();
});

// ---------------------------
// Notification Utility
// ---------------------------
function showNotification(message, type = "info") {
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
  setTimeout(() => notification.remove(), 5000);
}

// ---------------------------
// Fetch Pending Adoption Requests
// ---------------------------
async function fetchPendingRequests() {
  try {
    const res = await fetch(`${BASE_URL}/owner`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.error(err);
    showNotification("Failed to fetch adoption requests.", "warning");
    return [];
  }
}

async function loadAdoptionRequests() {
  const requests = await fetchPendingRequests();
  const tableBody = document.getElementById("requestsTableBody");
  if (!tableBody) return;
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
                ${req.approved !== null
        ? `<button class="btn btn-outline-success btn-sm chat-btn" 
                        data-requester-email="${req.requesterEmail}" 
                        data-requester-name="${req.requesterName}">
                        Chat
                       </button>`
        : ""}
            </td>
        `;

    tableBody.appendChild(row);

    if (req.approved === null) {
      const cell = row.querySelector(".action-cell");
      const approveBtn = document.createElement("button");
      approveBtn.className = "btn btn-approve me-2";
      approveBtn.textContent = "Approve";
      approveBtn.addEventListener("click", () => approveRequest(req.requestId, req.petName));

      const declineBtn = document.createElement("button");
      declineBtn.className = "btn btn-decline";
      declineBtn.textContent = "Decline";
      declineBtn.addEventListener("click", () => declineRequest(req.requestId));

      cell.appendChild(approveBtn);
      cell.appendChild(declineBtn);
    }
  });

  updateNotificationBadge(requests);
}

// ---------------------------
// Approve / Decline
// ---------------------------
async function approveRequest(requestId, petName) {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `Approve adoption request for ${petName}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'Cancel'
  });

  if (!result.isConfirmed) return;

  try {
    const res = await fetch(`${BASE_URL}/${requestId}/approve`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (data.status === 200) {
      Swal.fire('Approved!', data.message, 'success');
      loadAdoptionRequests();
    } else {
      Swal.fire('Error', data.message, 'error');
    }
  } catch (err) {
    console.error(err);
    Swal.fire('Error', 'Failed to approve request.', 'error');
  }
}

async function declineRequest(requestId) {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'Decline this adoption request?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'Cancel'
  });

  if (!result.isConfirmed) return;

  try {
    const res = await fetch(`${BASE_URL}/${requestId}/decline`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (data.status === 200) {
      Swal.fire('Declined!', data.message, 'success');
      loadAdoptionRequests();
    } else {
      Swal.fire('Error', data.message, 'error');
    }
  } catch (err) {
    console.error(err);
    Swal.fire('Error', 'Failed to decline request.', 'error');
  }
}

// ---------------------------
// Notification Badge
// ---------------------------
function updateNotificationBadge(requests) {
  const badge = document.getElementById("adoption-badge");
  const pendingCount = requests.filter(r => r.approved === null).length;
  badge.textContent = pendingCount;
  badge.style.display = pendingCount > 0 ? "flex" : "none";
}

// ---------------------------
// Load Notifications
// ---------------------------
async function fetchNotifications() {
  try {
    const res = await fetch(NOTIFICATIONS_URL, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function loadNotifications() {
  const notifications = await fetchNotifications();

  const adoptionCard = document.querySelector(".adoption-notification .notification-content");
  const adoptionBadge = document.getElementById("adoption-badge");
  const lostFoundCard = document.querySelector(".lost-found-notification .notification-content");
  const lostFoundBadge = document.querySelector(".lost-found-notification .notification-badge");
  const vaccinationCard = document.querySelector(".vaccination-notification .notification-content");
  const vaccinationBadge = document.querySelector(".vaccination-notification .notification-badge");

  adoptionCard.innerHTML = "";
  lostFoundCard.innerHTML = "";
  vaccinationCard.innerHTML = "";

  let adoptionCount = 0, lostFoundCount = 0, vaccinationCount = 0;

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

  adoptionBadge.textContent = adoptionCount;
  adoptionBadge.style.display = adoptionCount > 0 ? "flex" : "none";
  lostFoundBadge.textContent = lostFoundCount;
  lostFoundBadge.style.display = lostFoundCount > 0 ? "flex" : "none";
  vaccinationBadge.textContent = vaccinationCount;
  vaccinationBadge.style.display = vaccinationCount > 0 ? "flex" : "none";
}

// ---------------------------
// Sent Requests (Requester)
// ---------------------------
async function fetchSentRequests() {
  try {
    const res = await fetch(`${BASE_URL}/requester`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.error(err);
    showNotification("Failed to fetch sent requests.", "warning");
    return [];
  }
}

async function loadSentRequests() {
  const requests = await fetchSentRequests();
  const tableBody = document.getElementById("sentRequestsTableBody");
  if (!tableBody) return;
  tableBody.innerHTML = "";

  requests.forEach(req => {
    const row = document.createElement("tr");

    row.innerHTML = `
            <td>${req.petType || "Unknown"}</td>
            <td><img src="${req.petImage || ''}" class="pet-image" /></td>
            <td>${req.petName || "Unknown"}</td>
            <td>${req.ownerUsername || "Unknown"}</td>
            <td><a href="mailto:${req.ownerEmail || ""}">${req.ownerEmail || "Unknown"}</a></td>
            <td>${req.requestDate ? new Date(req.requestDate).toLocaleDateString() : "Unknown"}</td>
            <td>
                ${req.approved === null
        ? '<span class="status-pending">Pending</span>'
        : (req.approved ? '<span class="status-approved">Approved</span>' : '<span class="status-declined">Declined</span>')}
            </td>
            <td>
                ${req.approved !== null
        ? `<button class="btn btn-outline-success btn-sm chat-btn" 
                        data-requester-email="${req.requesterEmail}" 
                        data-requester-name="${req.requesterName}" 
                        data-owner-email="${req.ownerEmail}" 
                        data-owner-name="${req.ownerUsername}">
                        Chat
                       </button>`
        : ""}
            </td>
        `;

    tableBody.appendChild(row);
  });
}

// ---------------------------
// Real-time Chat
// ---------------------------
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('chat-btn')) {
    targetEmail = e.target.dataset.ownerEmail || e.target.dataset.requesterEmail;
    const name = e.target.dataset.ownerName || e.target.dataset.requesterName || targetEmail;

    document.getElementById('chatWith').textContent = name;
    document.getElementById('chatMessages').innerHTML = '';

    const chatModal = new bootstrap.Modal(document.getElementById('chatModal'));
    chatModal.show();

    initWebSocket(myEmail);
    loadChatHistory(myEmail, targetEmail);
  }
});

function initWebSocket(email) {
  if (!email) return showNotification("Cannot start chat: email missing.", "warning");

  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    socket.close();
  }

  socket = new WebSocket(`ws://localhost:8080/chat?email=${encodeURIComponent(email)}`);

  socket.onopen = () => console.log("WebSocket connected:", email);

  socket.onmessage = (event) => {
    const msgData = JSON.parse(event.data);
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = msgData.senderEmail === myEmail ? 'chat-message sent' : 'chat-message received';

    const senderDisplay = msgData.senderEmail === myEmail ? 'You' : (msgData.senderName || msgData.senderEmail);

    const time = new Date(msgData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    messageDiv.innerHTML = `
    <strong>${senderDisplay}</strong>:
    <span>${msgData.message}</span>
    <div class="chat-time">${time}</div>
  `;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  socket.onclose = () => console.log("WebSocket closed");
  socket.onerror = (err) => {
    console.error(err);
    showNotification("Chat connection error", "warning");
  };
}

document.getElementById('sendChatBtn').addEventListener('click', async () => {
  const input = document.getElementById('chatInput');
  if (!targetEmail || !input.value.trim()) return;

  const messageData = {
    receiverEmail: targetEmail,
    receiverName: targetName || '',
    senderEmail: myEmail,
    senderName: localStorage.getItem('username') || 'You',
    message: input.value.trim()
  };

  // Send via WebSocket for real-time display
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(messageData));
  }

  try {
    const res = await fetch('http://localhost:8080/chat/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify(messageData)
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const savedMessage = await res.json();
    console.log('Message saved:', savedMessage);
  } catch (err) {
    console.error('Failed to save message:', err);
  }

  const chatMessages = document.getElementById('chatMessages');
  const messageDiv = document.createElement('div');
  messageDiv.className = 'chat-message sent';
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  messageDiv.innerHTML = `<strong>You</strong>: <span>${input.value.trim()}</span><div class="chat-time">${time}</div>`;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  input.value = '';
});

// ---------------------------
// Fetch Chat History
// ---------------------------
async function loadChatHistory(userEmail, otherEmail) {
  if (!userEmail || !otherEmail) return;

  try {
    const res = await fetch(
        `http://localhost:8080/chat/history?user1=${encodeURIComponent(userEmail)}&user2=${encodeURIComponent(otherEmail)}`,
        {
          headers: { "Authorization": `Bearer ${TOKEN}` }
        }
    );

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const messages = await res.json();
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '';

    messages.forEach(msg => {
      const messageDiv = document.createElement('div');
      const senderDisplay = msg.senderEmail === userEmail ? 'You' : msg.senderName;

      messageDiv.className = msg.senderEmail === userEmail ? 'chat-message sent' : 'chat-message received';

      const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      messageDiv.innerHTML = `
    <strong>${senderDisplay}</strong>:
    <span>${msg.message}</span>
    <div class="chat-time">${time}</div>
  `;

      chatMessages.appendChild(messageDiv);
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
  } catch (err) {
    console.error(err);
    document.getElementById('chatMessages').innerHTML = '<p class="text-muted">Failed to load chat history.</p>';
  }
}
