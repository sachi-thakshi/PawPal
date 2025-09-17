// ---------------- Enhanced Admin Dashboard ----------------
function initAdminDashboard() {
    console.log('Enhanced Pet Admin Dashboard initialized successfully!');
}

// ---------------- Username Setter ----------------
function setAdminUsername() {
    const usernameSpan = document.getElementById("logged-admin-name");
    const username = localStorage.getItem("username");

    if (usernameSpan) {
        usernameSpan.textContent = username;
        console.log("Admin username loaded:", username);

        const avatarImg = document.querySelector(".dropdown img");
        if (avatarImg) {
            avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=667eea&color=fff`;
            avatarImg.alt = username;
        }

        return true;
    } else {
        console.warn("#logged-admin-name not found yet");
        return false;
    }
}

// ---------------- Adoption Requests Chart ----------------
let adoptionRequestChart = null;
async function updateAdoptionsRequestsChart() {
    try {
        const token = localStorage.getItem("jwtToken");
        const res = await fetch("http://localhost:8080/admin-dashboard/adoptions-requests-chart-week", {
            headers: token ? { "Authorization": `Bearer ${token}` } : {}
        });

        if (!res.ok) throw new Error("Failed to fetch chart data");

        const data = await res.json();
        const canvas = document.getElementById("adoptionsRequestsChart");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        if (adoptionRequestChart) adoptionRequestChart.destroy();

        adoptionRequestChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Approved Adoptions',
                        data: data.adoptions,
                        backgroundColor: 'rgba(102, 126, 234, 0.8)'
                    },
                    {
                        label: 'Pending Requests',
                        data: data.requests,
                        backgroundColor: 'rgba(255, 159, 64, 0.8)'
                    }
                ]
            },
            options: {
                animation: { duration: 0 },
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Count' } },
                    x: { title: { display: true, text: 'Date' } }
                },
                plugins: {
                    legend: { position: 'top' },
                    tooltip: { mode: 'index', intersect: false }
                }
            }
        });

    } catch (err) {
        console.error("Failed to update adoption chart:", err);
    }
}

// ---------------- Shop Performance Chart ----------------
let shopChartInstance = null;
async function updateShopChart() {
    console.log("updateShopChart() called");

    const shopCanvas = document.getElementById('shopChart');
    if (!shopCanvas) return;

    const ctx = shopCanvas.getContext('2d');

    try {
        const res = await fetch("http://localhost:8080/admin-dashboard/shop-categories-count");
        console.log("Fetch response status:", res.status);

        if (!res.ok) throw new Error(`Failed to fetch shop data. Status: ${res.status}`);

        const data = await res.json();
        console.log("Shop chart raw data:", data);

        if (shopChartInstance) {
            shopChartInstance.destroy();
            shopChartInstance = null;
        }

        const labels = Object.keys(data);
        const counts = Object.values(data);

        if (labels.length === 0 || counts.length === 0) {
            console.warn("No data to display in shop chart.");
            ctx.clearRect(0, 0, shopCanvas.width, shopCanvas.height);
            ctx.font = "16px Arial";
            ctx.fillText("No shop data available", 10, 50);
            return;
        }

        const generateColors = (num) => {
            const baseColors = [
                'rgba(102, 126, 234, 0.8)',
                'rgba(118, 75, 162, 0.8)',
                'rgba(240, 147, 251, 0.8)',
                'rgba(79, 172, 254, 0.8)',
                'rgba(32, 201, 151, 0.8)',
                'rgba(255, 99, 132, 0.8)',
                'rgba(255, 206, 86, 0.8)'
            ];
            return Array.from({ length: num }, (_, i) => baseColors[i % baseColors.length]);
        };

        const backgroundColors = generateColors(labels.length);
        const borderColors = backgroundColors.map(c => c.replace('0.8', '1'));

        shopChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: counts,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { boxWidth: 20, padding: 15 }
                    }
                }
            }
        });

    } catch (err) {
        console.error("Failed to load shop chart:", err);
        ctx.clearRect(0, 0, shopCanvas.width, shopCanvas.height);
        ctx.font = "16px Arial";
        ctx.fillText("Failed to load shop chart", 10, 50);
    }
}

function waitForCanvasAndRender() {
    const canvas = document.getElementById('shopChart');
    if (canvas) {
        updateShopChart();
    } else {
        setTimeout(waitForCanvasAndRender, 100);
    }
}

// ---------------- Dashboard Stats ----------------
async function loadDashboardStats() {
    try {
        const response = await fetch("http://localhost:8080/admin-dashboard/stats");
        const stats = await response.json();

        document.getElementById("dailyAdoptionsCount").textContent = stats.dailyAdoptions;
        document.getElementById("monthlyRegistrationsCount").textContent = stats.monthlyRegistrations;
        document.getElementById("totalPetsCount").textContent = stats.totalPets;
        document.getElementById("todayIncome").textContent = "LKR " + stats.todayIncome.toFixed(2);

    } catch (error) {
        console.error("Error loading dashboard stats:", error);
    }
}

// ---------------- Lost & Found Counts ----------------
async function loadLostFoundCounts() {
    try {
        const res = await fetch("http://localhost:8080/admin-dashboard/lost-found-counts");
        if (!res.ok) throw new Error("Failed to fetch lost & found counts");

        const counts = await res.json();
        console.log("Lost & Found counts:", counts);

        document.getElementById("lostCount").textContent = counts.lost;
        document.getElementById("foundCount").textContent = counts.found;

    } catch (err) {
        console.error("Error loading lost & found counts:", err);
    }
}

// ---------------- Initialize Dashboard ----------------
function initDashboardFeatures() {
    if (!setAdminUsername()) return;

    waitForCanvasAndRender();
    updateAdoptionsRequestsChart();
    loadDashboardStats();
    loadLostFoundCounts();

    setInterval(() => {
        updateAdoptionsRequestsChart();
        updateShopChart();
    }, 300000);

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
}

// ---------------- Static Load ----------------
document.addEventListener("DOMContentLoaded", () => {
    initDashboardFeatures();
});

// ---------------- Dynamic Load ----------------
const observer = new MutationObserver(() => {
    if (document.getElementById("logged-admin-name")) {
        console.log("Dashboard detected dynamically, initializing…");
        initDashboardFeatures();
        observer.disconnect();
    }
});
observer.observe(document.body, { childList: true, subtree: true });
