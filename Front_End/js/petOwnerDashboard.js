// Simulate user data
  const user = {
    name: "Alex", // fallback name
    avatarUrl: null // or provide URL like "/images/alex.jpg"
  };

  const avatarContainer = document.getElementById("user-avatar");

  if (user.avatarUrl) {
    // Create <img> tag if avatar exists
    const img = document.createElement("img");
    img.src = user.avatarUrl;
    img.alt = "User Avatar";
    img.className = "rounded-circle";
    img.width = 36;
    img.height = 36;
    avatarContainer.innerHTML = '';
    avatarContainer.appendChild(img);
  } else {
    // Show first initial
    const initial = user.name ? user.name.charAt(0) : "?";
    avatarContainer.textContent = initial;
  }

document.addEventListener("DOMContentLoaded", () => {
  const welcomeSpan = document.querySelector(".welcome-h1 span");
  const username = localStorage.getItem("username") || "User";

  if (welcomeSpan) welcomeSpan.textContent = username;

  const avatarDiv = document.getElementById("user-avatar");
  if (avatarDiv) {
    const initials = username.split(" ").map(n => n[0].toUpperCase()).join("");
    avatarDiv.textContent = initials;
  }
});