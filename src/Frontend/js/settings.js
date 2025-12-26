document.addEventListener('DOMContentLoaded', () => {
    // Check Auth
    const token = localStorage.getItem('finsight_token');
    const user = JSON.parse(localStorage.getItem('finsight_user'));

    if (!token || !user) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize UI
    const profileForm = document.getElementById('profileForm');
    const passwordForm = document.getElementById('passwordForm');

    // Display names
    updateUI(user);

    // Load detailed profile
    loadProfileData();

    // Handle Profile Update
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = profileForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Saving...';

            const payload = {
                name: document.getElementById('userName').value,
                email: document.getElementById('userEmail').value,
                monthly_income: document.getElementById('monthlyIncome').value,
                average_expense: document.getElementById('avgExpense').value,
                risk_appetite: document.getElementById('riskAppetite').value,
                financial_goals: document.getElementById('financialGoals').value
            };

            try {
                const res = await APIClient.post('/profile', payload);
                if (res.success) {
                    showToast('Profile updated successfully!', 'success');

                    // Update Local Storage User
                    const updatedUser = { ...user, name: payload.name };
                    localStorage.setItem('finsight_user', JSON.stringify(updatedUser));

                    // Update UI immediately
                    updateUI(updatedUser);
                } else {
                    showToast(res.message || 'Failed to update profile', 'danger');
                }
            } catch (error) {
                console.error('Profile Update Error:', error);
                showToast('An error occurred.', 'danger');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    // Handle Password Change
    if (passwordForm) {
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const currentPass = document.getElementById('currentPassword').value;
            const newPass = document.getElementById('newPassword').value;
            const confirmPass = document.getElementById('confirmPassword').value;

            if (newPass !== confirmPass) {
                showToast('New passwords do not match!', 'warning');
                return;
            }

            const submitBtn = passwordForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Updating...';

            const payload = {
                action: 'change_password',
                current_password: currentPass,
                new_password: newPass
            };

            try {
                const res = await APIClient.post('/profile', payload);
                if (res.success) {
                    showToast('Password updated successfully!', 'success');
                    passwordForm.reset();
                } else {
                    showToast(res.message || 'Failed to update password', 'danger');
                }
            } catch (error) {
                console.error('Password Update Error:', error);
                showToast('An error occurred.', 'danger');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    async function loadProfileData() {
        try {
            const res = await APIClient.get('/profile');
            if (res.success && res.data) {
                const p = res.data.profile || {};
                const u = res.data.user || {};

                // Set Form Values
                if (document.getElementById('userName')) document.getElementById('userName').value = u.name || '';
                if (document.getElementById('userEmail')) document.getElementById('userEmail').value = u.email || '';

                if (document.getElementById('monthlyIncome')) document.getElementById('monthlyIncome').value = p.monthly_income || '';
                if (document.getElementById('avgExpense')) document.getElementById('avgExpense').value = p.average_expense || '';
                if (document.getElementById('riskAppetite')) document.getElementById('riskAppetite').value = p.risk_appetite || 'moderate';
                if (document.getElementById('financialGoals')) document.getElementById('financialGoals').value = p.financial_goals || '';

            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    }

    function updateUI(userData) {
        // Sidebar (handled by sidebar.js if generic, but we can force it here too)
        const sidebarName = document.querySelector('.sidebar-footer .user-name');
        const sidebarEmail = document.querySelector('.sidebar-footer .user-email');
        if (sidebarName) sidebarName.textContent = userData.name || userData.username || 'User';
        if (sidebarEmail) sidebarEmail.textContent = userData.email || 'user@example.com';

        // Settings Page Info Card
        const displayNames = document.querySelectorAll('.user-name-display');
        const displayEmails = document.querySelectorAll('.user-email-display');

        displayNames.forEach(el => el.textContent = userData.name || 'User');
        displayEmails.forEach(el => el.textContent = userData.email || 'user@example.com');
    }

    function showToast(message, type = 'primary') {
        const toastEl = document.getElementById('liveToast');
        const toastBody = document.getElementById('toastMessage');
        if (!toastEl || !toastBody) return;

        toastBody.textContent = message;

        // Remove bg classes
        toastEl.classList.remove('bg-primary', 'bg-success', 'bg-danger', 'bg-warning');

        // Add color
        toastEl.classList.add('bg-' + type);

        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    }
});
