const forgotForm = document.getElementById('forgotForm');
const otpSection = document.getElementById('otpSection');
const message = document.getElementById('message');
const resetBtn = document.getElementById('resetPasswordBtn');

forgotForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  const email = document.getElementById('email').value;

  try {
    // Simulate sending OTP (replace with actual API call)
    // await fetch('/send-otp', { method: 'POST', body: JSON.stringify({ email }), headers: { 'Content-Type': 'application/json' } });

    message.textContent = "OTP sent to your email.";
    message.style.color = "#cce5ff";

    // Smooth fade out form
    forgotForm.classList.add('fade-out');
    setTimeout(() => {
      forgotForm.style.display = 'none';
      otpSection.style.display = 'flex';
    }, 500);

  } catch (error) {
    message.textContent = "Error sending OTP.";
    message.style.color = "#f8d7da";
  }
});

resetBtn.addEventListener('click', async function () {
  const email = document.getElementById('email').value;
  const otp = document.getElementById('otp').value.trim();
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (!otp || !newPassword || !confirmPassword) {
    message.textContent = "All fields are required.";
    message.style.color = "#f8d7da";
    return;
  }

  if (newPassword !== confirmPassword) {
    message.textContent = "Passwords do not match.";
    message.style.color = "#f8d7da";
    return;
  }

  try {
    // Simulate backend password reset
    // await fetch('/reset-password', { method: 'POST', body: JSON.stringify({ email, otp, newPassword }), headers: { 'Content-Type': 'application/json' } });

    message.textContent = "Password successfully reset.";
    message.style.color = "#d4edda";

    otpSection.style.display = 'none';

  } catch (error) {
    message.textContent = "Failed to reset password.";
    message.style.color = "#f8d7da";
  }
});
