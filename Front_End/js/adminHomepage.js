document.addEventListener("DOMContentLoaded", function () {
    const mainContent = document.getElementById("mainContent");
    const navLinks = document.querySelectorAll(".nav-link");

    // Function to load page content dynamically
    function loadPage(url) {
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error("Network response was not ok");
                return response.text();
            })
            .then(html => {
                mainContent.innerHTML = html;

                // Initialize page-specific scripts
                if (url.includes("admin-dashboard.html") && typeof initAdminDashboard === "function") {
                    initAdminDashboard();
                }else if (url.includes("registered-pet-accounts.html") && typeof initRegisteredPets === "function") {
                    initRegisteredPets();
                }else if (url.includes("registered-users.html") && typeof initRegisteredUsers === "function") {
                    initRegisteredUsers();
                }else if (url.includes("appointed-vet-appointments.html") && typeof initAppointments === "function") {
                    initAppointments();
                }else if (url.includes("reported-lost&founds.html") && typeof initPetReports === "function") {
                    initPetReports();
                }else if (url.includes("admin-management.html") && typeof initAdminManagement === "function") {
                    initAdminManagement();
                } else if (url.includes("admin-account-settings.html") && typeof initAdminSettings === "function") {
                    initAdminSettings();
                }else if (url.includes("submitted-pet-gallery.html") && typeof initSubmittedGallery === "function") {
                    initSubmittedGallery();
                }else if (url.includes("admin-blog.html") && typeof initBlogs === "function") {
                    initBlogs();
                }
            })
            .catch(error => {
                mainContent.innerHTML = `<div class="alert alert-danger">Failed to load content.</div>`;
                console.error("Fetch error:", error);
            });
    }

    // Attach click events to sidebar links
    navLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            const page = this.getAttribute("data-page");

            if (page) {
                e.preventDefault();  // Prevent navigation only if data-page exists

                navLinks.forEach(l => l.classList.remove("active"));
                this.classList.add("active");

                loadPage(page);
            }
            // If no data-page attribute, let the link behave normally (navigate away)
        });
    });

    // Load default page on first load
    loadPage("../pages/admin-dashboard.html");
});

// Sidebar toggle for mobile
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (window.innerWidth <= 768) {
        sidebar.style.transform = sidebar.style.transform === 'translateX(0px)'
            ? 'translateX(-100%)'
            : 'translateX(0px)';
    }
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('mobile-menu-toggle')) {
        toggleSidebar();
    }
});
