// adminDashboard.js

function initAdminDashboard() {
    animateCounters();
    animateProgressBars();

    // Simulate real-time updates every 30s
    setInterval(updateStats, 30000);
}

// Counter Animation
function animateCounters() {
    const counters = document.querySelectorAll('.animate-counter');
    counters.forEach(counter => {
        const target = parseInt(counter.innerText.replace(/,/g, '')) || 0;
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                counter.innerText = target.toLocaleString();
                clearInterval(timer);
            } else {
                counter.innerText = Math.floor(current).toLocaleString();
            }
        }, 16);
    });
}

// Progress Bar Animation
function animateProgressBars() {
    const progressBars = document.querySelectorAll('.rating-fill, .progress-bar');
    progressBars.forEach((bar, index) => {
        setTimeout(() => {
            bar.style.transition = 'width 1.5s ease-out';
        }, index * 200);
    });
}

// Notification System
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Real-time Updates Simulation
function updateStats() {
    const dailyAdoptions = document.querySelector('.stats-value');
    if (!dailyAdoptions) return;

    const currentValue = parseInt(dailyAdoptions.textContent.replace(/,/g, '')) || 0;
    const newValue = currentValue + Math.floor(Math.random() * 3);

    dailyAdoptions.textContent = newValue.toLocaleString();

    if (Math.random() > 0.7) {
        showNotification(`New pet adoption completed! Total today: ${newValue}`, 'success');
    }
}

// Use event delegation for dynamic buttons
document.addEventListener("click", function (e) {
    if (e.target.closest(".btn-approve")) {
        const btn = e.target.closest(".btn-approve");
        showNotification('Application approved successfully!', 'success');
        btn.closest('.user-item').style.backgroundColor = '#d4edda';
        setTimeout(() => {
            btn.closest('.user-item').style.display = 'none';
        }, 1000);
    }

    if (e.target.closest(".btn-reject")) {
        showNotification('Application moved to review queue.', 'info');
    }
});
