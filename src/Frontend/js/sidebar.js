// Sidebar Component
class Sidebar {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.overlay = document.getElementById('sidebarOverlay');
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.substring(path.lastIndexOf('/') + 1);
        return page || 'dashboard.html';
    }

    getMenuItems() {
        return [
            {
                section: 'Menu',
                items: [
                    { name: 'Dashboard', icon: 'fa-home', url: 'dashboard.html', page: 'dashboard.html' },
                    { name: 'Wallets', icon: 'fa-wallet', url: 'wallets.html', page: 'wallets.html' },
                    { name: 'Transactions', icon: 'fa-exchange-alt', url: 'transactions.html', page: 'transactions.html' },
                    { name: 'Budgets', icon: 'fa-chart-pie', url: 'budgets.html', page: 'budgets.html' },
                    { name: 'Insights', icon: 'fa-lightbulb', url: 'insights.html', page: 'insights.html' },
                    { name: 'AI Chat', icon: 'fa-robot', url: 'chat.html', page: 'chat.html' }
                ]
            }
            // Account Section Removed
        ];
    }

    init() {
        // Render only if sidebar doesn't exist
        if (!this.sidebar) {
            this.render();
            // Re-select after render
            this.sidebar = document.getElementById('sidebar');
            this.overlay = document.getElementById('sidebarOverlay');
        }

        this.attachEventListeners();
        this.loadUserInfo();
    }

    render() {
        const menuItems = this.getMenuItems();

        const sidebarHTML = `
            <button class="mobile-menu-btn" id="mobileMenuBtn"><i class="fas fa-bars"></i></button>
            <div class="sidebar-overlay" id="sidebarOverlay"></div>
            <aside class="sidebar" id="sidebar">
                <div class="sidebar-header">
                    <a href="dashboard.html" class="sidebar-brand">
                        <div class="brand-icon"><i class="fas fa-chart-line"></i></div>
                        <span class="brand-text">FINSIGHT</span>
                    </a>
                    <button class="sidebar-toggle" id="sidebarToggle"><i class="fas fa-chevron-left"></i></button>
                </div>
                <nav class="sidebar-nav">
                    ${menuItems.map(section => `
                        <div class="nav-section">
                            <div class="nav-section-title">${section.section}</div>
                            <ul class="nav-menu">
                                ${section.items.map(item => `
                                    <li class="nav-item">
                                        <a href="${item.url}" class="nav-link ${this.currentPage === item.page ? 'active' : ''}" ${item.action ? `data-action="${item.action}"` : ''}>
                                            <span class="nav-icon"><i class="fas ${item.icon}"></i></span>
                                            <span class="nav-text">${item.name}</span>
                                        </a>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </nav>
                <div class="sidebar-footer">
                    <div class="user-profile" id="userProfile" title="Click to view Settings">
                        <div class="user-avatar" id="userAvatar"><i class="fas fa-user"></i></div>
                        <div class="user-info">
                            <div class="user-name" id="userName">User</div>
                            <div class="user-email" id="userEmail">user@finsight.com</div>
                        </div>
                        <div class="logout-btn-container">
                            <button class="logout-btn" id="logoutBtn" title="Sign Out">
                                <i class="fas fa-sign-out-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        `;

        document.body.insertAdjacentHTML('afterbegin', sidebarHTML);

        // Ensure main content wrapper
        if (!document.querySelector('.main-content')) {
            const mainContent = document.createElement('main');
            mainContent.className = 'main-content';
            while (document.body.children.length > 3) { // 3 elements are btn, overlay, sidebar
                mainContent.appendChild(document.body.children[3]);
            }
            document.body.appendChild(mainContent);
        }
    }

    attachEventListeners() {
        const toggleBtn = document.getElementById('sidebarToggle');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const userProfile = document.getElementById('userProfile');
        const logoutBtn = document.getElementById('logoutBtn');

        if (toggleBtn) toggleBtn.addEventListener('click', () => this.toggleSidebar());
        if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', () => this.toggleMobileSidebar());
        if (this.overlay) this.overlay.addEventListener('click', () => this.closeMobileSidebar());

        // Navigate to Settings on User Profile Click
        if (userProfile) {
            userProfile.addEventListener('click', () => {
                window.location.href = 'settings.html';
            });
        }

        // Logout Button Logic
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering parent click (Settings)
                this.handleLogout();
            });
        }

        // Clean up redundant logout handlers from old nav listeners if any
        document.querySelectorAll('[data-action="logout"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        });
    }

    toggleSidebar() {
        if (!this.sidebar) return;
        this.sidebar.classList.toggle('collapsed');
        localStorage.setItem('sidebarCollapsed', this.sidebar.classList.contains('collapsed'));

        // Update Icon
        const icon = this.sidebar.querySelector('#sidebarToggle i');
        if (icon) icon.className = this.sidebar.classList.contains('collapsed') ? 'fas fa-chevron-right' : 'fas fa-chevron-left';
    }

    toggleMobileSidebar() {
        if (this.sidebar) this.sidebar.classList.toggle('mobile-active');
        if (this.overlay) this.overlay.classList.toggle('active');
    }

    closeMobileSidebar() {
        if (this.sidebar) this.sidebar.classList.remove('mobile-active');
        if (this.overlay) this.overlay.classList.remove('active');
    }

    loadUserInfo() {
        // CORRECT KEY: 'finsight_user'
        const userStr = localStorage.getItem('finsight_user');

        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                const nameEl = document.querySelector('.sidebar-footer .user-name');
                const emailEl = document.querySelector('.sidebar-footer .user-email');

                if (nameEl) nameEl.textContent = user.name || user.username || 'User';
                if (emailEl) emailEl.textContent = user.email || 'user@finsight.com';
            } catch (e) {
                console.error("Error parsing user data", e);
            }
        }
    }

    handleLogout() {
        if (confirm('Are you sure you want to sign out?')) {
            localStorage.removeItem('finsight_token');
            localStorage.removeItem('finsight_user');
            localStorage.removeItem('sidebarCollapsed');
            window.location.href = 'login.html';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Sidebar();
});
