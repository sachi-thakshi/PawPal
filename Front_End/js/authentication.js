// Panel toggle
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
	container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
	container.classList.remove("right-panel-active");
});

document.addEventListener("DOMContentLoaded", () => {

	// ----- SIGN-UP -----
	const signupButton = document.getElementById("signup-button");
	if (signupButton) {
		signupButton.addEventListener("click", async (e) => {
			e.preventDefault();

			const username = document.getElementById("signup-username").value.trim();
			const email = document.getElementById("signup-email").value.trim();
			const contactNumber = document.getElementById("signup-contact").value.trim();
			const password = document.getElementById("signup-password").value;
			const confirmPassword = document.getElementById("signup-confirm-password").value;

			if (!username || !email || !contactNumber || !password || !confirmPassword) {
				Swal.fire({ icon: 'error', title: 'Oops...', text: 'All fields are required!' });
				return;
			}

			if (password !== confirmPassword) {
				Swal.fire({ icon: 'error', title: 'Oops...', text: 'Passwords do not match!' });
				return;
			}

			const registerDTO = { username, email, contactNumber, password, role: "CUSTOMER" };

			try {
				const response = await fetch("http://localhost:8080/auth/register", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(registerDTO)
				});

				const data = await response.json();

				if (response.ok) {
					Swal.fire({
						icon: 'success',
						title: 'Success',
						text: 'Registration Successful! Please log in.',
						timer: 2000,
						showConfirmButton: false
					}).then(() => {
						container.classList.remove("right-panel-active"); // show login form
					});
				} else {
					Swal.fire({ icon: 'error', title: 'Error', text: data.message || 'Registration failed!' });
				}
			} catch (error) {
				console.error("Sign-Up error:", error);
				Swal.fire({ icon: 'error', title: 'Error', text: 'Unable to register at this time.' });
			}
		});
	}

	// ----- LOGIN -----
	const signinButton = document.getElementById("signin-button");
	if (signinButton) {
		signinButton.addEventListener("click", async (e) => {
			e.preventDefault();

			const email = document.getElementById("signin-email").value.trim();
			const password = document.getElementById("signin-password").value;

			if (!email || !password) {
				Swal.fire({ icon: 'error', title: 'Oops...', text: 'Please enter both email and password!' });
				return;
			}

			const authDTO = { email, password };

			try {
				const response = await fetch("http://localhost:8080/auth/login", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(authDTO)
				});

				const data = await response.json();
				console.log("Backend response:", data);

				if (response.ok && data.data?.accessToken) {
					localStorage.setItem("jwtToken", data.data.accessToken);
					localStorage.setItem("username", data.data.username); // full name
					localStorage.setItem("userRole", data.data.role);
					localStorage.setItem("userId", data.data.userId);

					console.log(localStorage.getItem("jwtToken"));
					console.log(localStorage.getItem("userId"));

					Swal.fire({ icon: 'success', title: 'Logged In', text: 'Login Successful!', timer: 1500, showConfirmButton: false })
						.then(() => {
							if (data.data.role === "ADMIN") {
								window.location.href = "../pages/admin-dashboard.html";
							} else {
								window.location.href = "../pages/pet-owner-dashboard.html";
							}
						});
				} else {
					Swal.fire({ icon: 'error', title: 'Login Failed', text: data.message || 'Invalid credentials!' });
				}
			} catch (error) {
				console.error("Login error:", error);
				Swal.fire({ icon: 'error', title: 'Error', text: 'Unable to login at this time.' });
			}
		});
	}
});

// ----- Show/Hide Password -----
document.querySelectorAll(".toggle-password").forEach(icon => {
	icon.addEventListener("click", function () {
		const input = document.querySelector(this.getAttribute("toggle"));
		const isPassword = input.getAttribute("type") === "password";
		input.setAttribute("type", isPassword ? "text" : "password");
		this.classList.toggle("fa-eye");
		this.classList.toggle("fa-eye-slash");
	});
});
