const forgotForm = document.getElementById('forgotForm');
const otpSection = document.getElementById('otpSection');
const message = document.getElementById('message');
const resetBtn = document.getElementById('resetPasswordBtn');

// OTP input elements
const otpInputs = document.querySelectorAll(".otp");

// Password toggle icons
const togglePassword = document.querySelectorAll(".toggle-password");

// -------------------- SEND OTP --------------------
forgotForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();

  if (!email) {
    message.textContent = "Please enter your email.";
    message.style.color = "#f8d7da";
    return;
  }

  try {
    const response = await fetch("http://localhost:8080/forgot-password/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const text = await response.text();

    if (response.ok) {
      message.textContent = text;
      message.style.color = "#cce5ff";

      // Show OTP section
      forgotForm.classList.add('fade-out');
      setTimeout(() => {
        forgotForm.style.display = 'none';
        otpSection.style.display = 'flex';
        otpInputs[0].focus(); // focus first OTP box
      }, 500);

    } else {
      message.textContent = text;
      message.style.color = "#f8d7da";
    }

  } catch (error) {
    message.textContent = "Error sending OTP. Please try again.";
    message.style.color = "#f8d7da";
    console.error(error);
  }
});

// -------------------- RESET PASSWORD --------------------
resetBtn.addEventListener('click', async function () {
  const email = document.getElementById('email').value.trim();
  const newPassword = document.getElementById('newPassword').value.trim();
  const confirmPassword = document.getElementById('confirmPassword').value.trim();

  // Combine OTP inputs into one string
  let otp = '';
  otpInputs.forEach(input => otp += input.value.trim());

  if (otp.length < 6 || !newPassword || !confirmPassword) {
    message.textContent = "All fields are required and OTP must be 6 digits.";
    message.style.color = "#f8d7da";
    return;
  }

  if (newPassword !== confirmPassword) {
    message.textContent = "Passwords do not match.";
    message.style.color = "#f8d7da";
    return;
  }

  try {
    const response = await fetch("http://localhost:8080/forgot-password/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword })
    });

    const text = await response.text();

    if (response.ok) {
      message.textContent = text;
      message.style.color = "#d4edda";
      otpSection.style.display = 'none';

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        window.location.href = "../pages/authentication.html";
      }, 2000);

    } else {
      message.textContent = text;
      message.style.color = "#f8d7da";
    }

  } catch (error) {
    message.textContent = "Failed to reset password. Please try again.";
    message.style.color = "#f8d7da";
    console.error(error);
  }
});

// -------------------- OTP AUTO-FOCUS --------------------
otpInputs.forEach((input, index) => {
  input.addEventListener("input", () => {
    if (input.value.length === 1 && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus();
    }
    // Allow backspace to go to previous box
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && index > 0 && input.value === "") {
        otpInputs[index - 1].focus();
      }
    });
  });
});

// -------------------- PASSWORD EYE TOGGLE --------------------
togglePassword.forEach(icon => {
  icon.addEventListener("click", () => {
    const input = document.querySelector(icon.getAttribute("toggle"));
    if (input.type === "password") {
      input.type = "text";
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    } else {
      input.type = "password";
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    }
  });
});
