document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const registerForm = document.getElementById('registerForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const messageBox = document.getElementById('message');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Clear previous errors
            messageBox.classList.add('d-none');
            messageBox.textContent = '';

            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            const registerBtn = registerForm.querySelector('button[type="submit"]');

            // Basic Validation
            if (!name || !email || !password || !confirmPassword) {
                showError('All fields are required.');
                return;
            }

            if (password !== confirmPassword) {
                showError('Passwords do not match.');
                return;
            }

            if (password.length < 6) {
                showError('Password must be at least 6 characters long.');
                return;
            }

            // UI Loading State
            const originalBtnText = registerBtn.textContent;
            registerBtn.disabled = true;
            registerBtn.textContent = 'Creating Account...';

            try {
                // Actual API Call
                const result = await APIClient.post('/auth/register', { 
                    name: name,
                    email: email,
                    password: password
                });

                if (result.success) {
                    // Check if token is returned (auto-login after registration)
                    if (result.data && result.data.token) {
                        // Auto-login: Store token & User
                        localStorage.setItem('finsight_token', result.data.token);
                        localStorage.setItem('finsight_user', JSON.stringify(result.data.user));

                        // Show success message and redirect to dashboard
                        showSuccess('Registration successful! Redirecting to dashboard...');

                        // Redirect to dashboard after delay
                        setTimeout(() => {
                            window.location.href = 'dashboard.html';
                        }, 2000);
                    } else {
                        // Fallback: Redirect to login if no token returned
                        showSuccess('Registration successful! Redirecting to login...');

                        // Reset form
                        registerForm.reset();

                        // Redirect to login after delay
                        setTimeout(() => {
                            window.location.href = 'login.html';
                        }, 2000);
                    }
                } else {
                    // API Error (e.g. Email already exists)
                    showError(result.message || 'Registration failed.');
                }
            } catch (error) {
                console.error("Registration Error:", error);
                showError('An error occurred. Please try again.');
            } finally {
                // Reset UI
                registerBtn.disabled = false;
                registerBtn.textContent = originalBtnText;
            }
        });
    }

    function showError(msg) {
        messageBox.textContent = msg;
        messageBox.classList.remove('d-none');
        messageBox.classList.remove('alert-success');
        messageBox.classList.add('alert-danger');
    }

    function showSuccess(msg) {
        messageBox.textContent = msg;
        messageBox.classList.remove('d-none');
        messageBox.classList.remove('alert-danger');
        messageBox.classList.add('alert-success');
    }
});
