// Enhanced Admin Dashboard JavaScript
function initAdminDashboard() {
    animateCounters();
    animateProgressBars();
    initCharts();

    // Simulate real-time updates every 30s
    setInterval(updateStats, 30000);

    console.log('Enhanced Pet Admin Dashboard initialized successfully!');
}

// Counter Animation
function animateCounters() {
    const counters = document.querySelectorAll('.animate-counter');
    counters.forEach(counter => {
        const target = parseInt(counter.innerText.replace(/[$,]/g, '')) || 0;
        const isPrice = counter.innerText.includes('$');
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                counter.innerText = isPrice ? '$' + target.toLocaleString() : target.toLocaleString();
                clearInterval(timer);
            } else {
                const value = Math.floor(current);
                counter.innerText = isPrice ? '$' + value.toLocaleString() : value.toLocaleString();
            }
        }, 16);
    });
}

// Progress Bar Animation
function animateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-bar');
    progressBars.forEach((bar, index) => {
        setTimeout(() => {
            bar.style.transition = 'width 1.5s ease-out';
        }, index * 200);
    });
}

// Initialize Charts
// Global chart instance variables
let adoptionChartInstance = null;
let shopChartInstance = null;

function initCharts() {
    const adoptionCanvas = document.getElementById('adoptionChart');
    const shopCanvas = document.getElementById('shopChart');

    if (!adoptionCanvas || !shopCanvas) {
        console.warn('Chart canvas elements not found. Skipping chart initialization.');
        return;
    }

    const adoptionCtx = adoptionCanvas.getContext('2d');
    const shopCtx = shopCanvas.getContext('2d');

    // Destroy existing charts if they exist
    if (adoptionChartInstance) {
        adoptionChartInstance.destroy();
    }
    if (shopChartInstance) {
        shopChartInstance.destroy();
    }

    // Create Pet Adoption Bar Chart
    adoptionChartInstance = new Chart(adoptionCtx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'Adoptions',
                    data: [12, 19, 8, 15, 22, 18, 25],
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                },
                {
                    label: 'Applications',
                    data: [20, 32, 15, 28, 35, 30, 40],
                    backgroundColor: 'rgba(118, 75, 162, 0.6)',
                    borderColor: 'rgba(118, 75, 162, 1)',
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    // Create Shop Performance Doughnut Chart
    shopChartInstance = new Chart(shopCtx, {
        type: 'doughnut',
        data: {
            labels: ['Pet Food', 'Toys', 'Accessories', 'Medicine', 'Grooming'],
            datasets: [{
                data: [35, 25, 20, 12, 8],
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(118, 75, 162, 0.8)',
                    'rgba(240, 147, 251, 0.8)',
                    'rgba(79, 172, 254, 0.8)',
                    'rgba(32, 201, 151, 0.8)'
                ],
                borderColor: [
                    'rgba(102, 126, 234, 1)',
                    'rgba(118, 75, 162, 1)',
                    'rgba(240, 147, 251, 1)',
                    'rgba(79, 172, 254, 1)',
                    'rgba(32, 201, 151, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
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

    // Update shop sales
    const shopSales = document.querySelectorAll('.stats-value')[3];
    if (shopSales) {
        const currentSales = parseInt(shopSales.textContent.replace(/[$,]/g, '')) || 0;
        const newSales = currentSales + Math.floor(Math.random() * 100);
        shopSales.textContent = '$' + newSales.toLocaleString();
    }

    if (Math.random() > 0.7) {
        showNotification(`New pet adoption completed! Total today: ${newValue}`, 'success');
    }

    if (Math.random() > 0.8) {
        showNotification('New shop order received!', 'info');
    }
}

// Add new user to recent users table
function addNewUser() {
    const tableBody = document.getElementById('recentUsersTable');
    const names = ['Alex Thompson', 'Maria Garcia', 'John Smith', 'Anna Lee', 'Tom Wilson'];
    const types = ['Pet Adopter', 'Volunteer', 'Foster Parent', 'Pet Owner'];
    const statuses = ['Active', 'Pending', 'Verified'];
    const statusClasses = ['success', 'warning', 'info'];

    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomStatus = Math.floor(Math.random() * statuses.length);

    const newRow = document.createElement('tr');
    newRow.innerHTML = `
                <td>
                    <div class="d-flex align-items-center">
                        <img src="https://ui-avatars.com/api/?name=${randomName.replace(' ', '+')}&background=667eea&color=fff" class="rounded-circle me-2" width="35" height="35">
                        <div>
                            <div class="fw-semibold">${randomName}</div>
                            <small class="text-muted">${randomType}</small>
                        </div>
                    </div>
                </td>
                <td>${randomName.toLowerCase().replace(' ', '.')}@email.com</td>
                <td>
                    <small>Sep 12, 2025</small>
                    <div class="text-muted" style="font-size: 0.75rem;">Just now</div>
                </td>
                <td><span class="badge bg-${statusClasses[randomStatus]}">${statuses[randomStatus]}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary">View</button>
                </td>
            `;

    tableBody.insertBefore(newRow, tableBody.firstChild);

    // Remove last row if more than 5 users
    if (tableBody.children.length > 5) {
        tableBody.removeChild(tableBody.lastChild);
    }

    // Animate new row
    newRow.style.backgroundColor = '#e8f5e8';
    setTimeout(() => {
        newRow.style.backgroundColor = '';
        newRow.style.transition = 'background-color 0.5s ease';
    }, 2000);
}

// Use event delegation for dynamic buttons
document.addEventListener("click", function (e) {
    if (e.target.closest(".btn-approve")) {
        const btn = e.target.closest(".btn-approve");
        showNotification('Application approved successfully!', 'success');
        btn.closest('.user-item').style.backgroundColor = '#d4edda';
        btn.closest('.user-item').style.borderRadius = '10px';
        btn.closest('.user-item').style.padding = '15px 10px';
        setTimeout(() => {
            btn.closest('.user-item').style.display = 'none';
        }, 1000);
    }

    if (e.target.closest(".btn-reject")) {
        showNotification('Application moved to review queue.', 'info');
    }

    if (e.target.closest(".btn-outline-primary")) {
        showNotification('Opening user profile...', 'info');
    }
});

// Simulate new user registrations every 2 minutes
setInterval(addNewUser, 120000);

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initAdminDashboard, 500);
});

// Enhanced hover effects
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.stats-card, .chart-card, .info-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.15)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
        });
    });
});