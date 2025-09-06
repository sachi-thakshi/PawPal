function renderUserAvatar() {
    const avatarContainer = document.getElementById("user-avatar");
    if (!avatarContainer) return;

    const profileImageUrl = localStorage.getItem("profileImageUrl");
    const username = localStorage.getItem("username") || "?";

    avatarContainer.innerHTML = '';

    if (profileImageUrl) {
        const img = document.createElement("img");
        img.src = profileImageUrl;
        img.alt = "User Avatar";
        img.className = "rounded-circle";
        img.width = 36;
        img.height = 36;
        avatarContainer.appendChild(img);
    } else {
        avatarContainer.textContent = username.charAt(0).toUpperCase();
        avatarContainer.className = "avatar-initial"; // optional CSS
    }
}

document.addEventListener("DOMContentLoaded", renderUserAvatar);
