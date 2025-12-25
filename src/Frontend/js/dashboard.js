document.addEventListener('DOMContentLoaded', () => {

    // Check Auth
    const token = localStorage.getItem('finsight_token');
    const user = JSON.parse(localStorage.getItem('finsight_user'));

    if (!token || !user) {
        window.location.href = 'login.html';
        return;
    }

    // Display User Name in sidebar
    const userName = document.querySelector('.user-name');
    const userEmail = document.querySelector('.user-email');
    if (userName && user.name) {
        userName.textContent = user.name;
    }
    if (userEmail && user.email) {
        userEmail.textContent = user.email;
    }

    loadDashboardData();
});

async function loadDashboardData() {
    try {
        // Centralized Fetching: Get all data once to prevent race conditions and redundancy
        const [walletRes, transRes, budgetRes] = await Promise.all([
            APIClient.get('/wallets'),
            APIClient.get('/transactions'),
            APIClient.get('/budgets')
        ]);

        const data = {
            wallets: walletRes.success && Array.isArray(walletRes.data) ? walletRes.data : [],
            transactions: transRes.success && Array.isArray(transRes.data) ? transRes.data : [],
            budgets: budgetRes.success && Array.isArray(budgetRes.data) ? budgetRes.data : []
        };

        // Render All Sections
        renderBalanceSummary(data.wallets);
        renderTransactionSummary(data.transactions);
        loadRecentTransactions(data.transactions);

        // Pass data to sub-components instead of re-fetching
        renderBudgetProgress(data.budgets, data.transactions);
        renderDashboardInsights(data);

        // Initialize Cashflow Chart
        initializeCashflowChart(data.transactions);

    } catch (error) {
        console.error("Dashboard Error:", error);
    }
}

function renderBalanceSummary(wallets) {
    const totalBalance = wallets.reduce((sum, wallet) => sum + parseFloat(wallet.balance || 0), 0);
    const el = document.getElementById('totalBalance');
    if (el) el.textContent = formatCurrency(totalBalance);
}

function renderTransactionSummary(transactions) {
    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
        const amount = parseFloat(t.amount || 0);
        if (t.transaction_type === 'income') {
            income += amount;
        } else {
            expense += amount;
        }
    });

    const incEl = document.getElementById('totalIncome');
    const expEl = document.getElementById('totalExpense');
    if (incEl) incEl.textContent = formatCurrency(income);
    if (expEl) expEl.textContent = formatCurrency(expense);
}

function renderBudgetProgress(budgets, transactions) {
    const container = document.getElementById('budgetProgressContainer');
    if (!container) return;

    if (budgets.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-chart-pie"></i>
                <p>No active budgets. <a href="budgets.html" class="text-primary-custom">Set a budget</a> to track your spending.</p>
            </div>
        `;
        return;
    }

    let html = '';

    budgets.slice(0, 4).forEach(budget => {
        const limit = parseFloat(budget.allocated_amount || 0);
        const startDate = new Date(budget.start_date);
        const endDate = new Date(budget.end_date);

        const spent = transactions.reduce((sum, t) => {
            const tDate = new Date(t.transaction_date);
            if (
                t.category_name === budget.category_name &&
                t.transaction_type === 'expense' &&
                tDate >= startDate && tDate <= endDate
            ) {
                return sum + parseFloat(t.amount || 0);
            }
            return sum;
        }, 0);

        const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;

        // Color Logic
        let colorClass = 'success';
        let statusClass = 'status-success';
        if (percentage > 90) {
            colorClass = 'danger';
            statusClass = 'status-danger';
        } else if (percentage > 75) {
            colorClass = 'warning';
            statusClass = 'status-warning';
        }

        html += `
            <div class="budget-progress-item">
                <div class="budget-progress-header">
                    <div class="d-flex align-items-center gap-3">
                        <div class="category-icon" style="width: 40px; height: 40px; font-size: 1rem;">
                            <i class="fas fa-tag"></i>
                        </div>
                        <div>
                            <div class="budget-progress-name">${budget.category_name}</div>
                            <span class="budget-period">Ends: ${endDate.toLocaleDateString('id-ID')}</span>
                        </div>
                    </div>
                    <span class="budget-status-badge ${statusClass}">${Math.round(percentage)}%</span>
                </div>
                <div class="budget-progress-amount mb-2">
                    ${formatCurrency(spent)} / ${formatCurrency(limit)}
                </div>
                <div class="progress">
                    <div class="progress-bar bg-${colorClass}" role="progressbar" style="width: ${percentage}%"
                        aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100">
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function loadRecentTransactions(transactions) {
    const container = document.getElementById('recentTransactionsContainer');

    if (!transactions || transactions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <p>No transactions yet. <a href="transactions.html" class="text-primary-custom">Add your first transaction</a>.</p>
            </div>
        `;
        return;
    }

    // Sort by date and take latest 5
    const recent = transactions
        .sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date))
        .slice(0, 5);

    let html = '<div class="table-responsive"><table class="table"><thead><tr>';
    html += '<th>Date</th><th>Category</th><th>Description</th><th>Amount</th>';
    html += '</tr></thead><tbody>';

    recent.forEach(t => {
        const isIncome = t.transaction_type === 'income';
        const amountClass = isIncome ? 'text-success' : 'text-danger';
        const amountPrefix = isIncome ? '+' : '-';

        html += `
            <tr>
                <td>${new Date(t.transaction_date).toLocaleDateString('id-ID')}</td>
                <td>
                    <span class="category-badge">
                        <i class="fas fa-tag"></i>
                        ${t.category_name || 'Uncategorized'}
                    </span>
                </td>
                <td>${t.description || '-'}</td>
                <td class="${amountClass} fw-bold">${amountPrefix} ${formatCurrency(parseFloat(t.amount))}</td>
            </tr>
        `;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function formatCurrency(amount) {
    return 'IDR ' + amount.toLocaleString('id-ID');
}

function renderDashboardInsights(data) {
    const container = document.getElementById('dashboardInsightsContainer');
    if (!container) return;

    try {
        const insights = generateDashboardInsights(data);

        if (insights.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle text-success"></i>
                    <p>Keuangan Anda dalam kondisi baik! Tidak ada peringatan saat ini.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="dashboard-insights-list">
                ${insights.slice(0, 3).map(insight => `
                    <div class="dashboard-insight-item ${insight.type}">
                        <div class="dashboard-insight-icon ${insight.type}">
                            <i class="fas ${insight.icon}"></i>
                        </div>
                        <div class="dashboard-insight-content">
                            <div class="dashboard-insight-title">${insight.title}</div>
                            <div class="dashboard-insight-message">${insight.message}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

    } catch (error) {
        console.error('Error rendering insights:', error);
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Gagal memuat insights.</p>
            </div>
        `;
    }
}

function generateDashboardInsights(data) {
    const insights = [];
    const today = new Date();

    // Check budgets
    if (data.budgets) {
        data.budgets.forEach(budget => {
            const limit = parseFloat(budget.allocated_amount || 0);
            const startDate = new Date(budget.start_date);
            const endDate = new Date(budget.end_date);

            const spent = data.transactions.reduce((sum, t) => {
                const tDate = new Date(t.transaction_date);
                if (
                    t.category_name === budget.category_name &&
                    t.transaction_type === 'expense' &&
                    tDate >= startDate && tDate <= endDate
                ) {
                    return sum + parseFloat(t.amount || 0);
                }
                return sum;
            }, 0);

            if (limit > 0) {
                const percentage = (spent / limit) * 100;

                if (percentage > 100) {
                    insights.push({
                        type: 'critical',
                        icon: 'fa-exclamation-circle',
                        title: `Budget ${budget.category_name} Terlampaui!`,
                        message: `Melebihi budget sebesar IDR ${Math.abs(limit - spent).toLocaleString('id-ID')}`
                    });
                } else if (percentage > 90) {
                    insights.push({
                        type: 'warning',
                        icon: 'fa-exclamation-triangle',
                        title: `Budget ${budget.category_name} Hampir Habis`,
                        message: `${Math.round(percentage)}% dari budget telah terpakai`
                    });
                }
            }
        });
    }

    // Check low wallet balance
    if (data.wallets) {
        data.wallets.forEach(wallet => {
            const balance = parseFloat(wallet.balance || 0);
            if (balance < 0) {
                insights.push({
                    type: 'critical',
                    icon: 'fa-wallet',
                    title: `Saldo ${wallet.wallet_name} Negatif!`,
                    message: `Deficit: IDR ${Math.abs(balance).toLocaleString('id-ID')}`
                });
            } else if (balance < 100000) {
                insights.push({
                    type: 'warning',
                    icon: 'fa-wallet',
                    title: `Saldo ${wallet.wallet_name} Rendah`,
                    message: `Saldo: IDR ${balance.toLocaleString('id-ID')}`
                });
            }
        });
    }

    // Check spending ratio
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    const thisMonthTrans = data.transactions.filter(t => {
        const tDate = new Date(t.transaction_date);
        return tDate.getMonth() === thisMonth && tDate.getFullYear() === thisYear;
    });

    const income = thisMonthTrans
        .filter(t => t.transaction_type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const expense = thisMonthTrans
        .filter(t => t.transaction_type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    if (income > 0 && expense > income * 0.8) {
        insights.push({
            type: 'warning',
            icon: 'fa-balance-scale',
            title: 'Rasio Pengeluaran Tinggi',
            message: `${Math.round(expense / income * 100)}% pendapatan terpakai bulan ini`
        });
    }

    // Sort by priority
    const priorityOrder = { critical: 0, warning: 1, info: 2, success: 3 };
    insights.sort((a, b) => priorityOrder[a.type] - priorityOrder[b.type]);

    return insights;
}

// ==========================================
// Chart.js Implementation
// ==========================================
let cashflowChartInstance = null;

function initializeCashflowChart(transactions) {
    const ctxElement = document.getElementById('cashflowChart');
    if (!ctxElement) return;

    const ctx = ctxElement.getContext('2d');

    // Process Data: Group by Month (Last 6 Months)
    const monthlyData = processChartData(transactions);

    // Destroy existing chart if any
    if (cashflowChartInstance) {
        cashflowChartInstance.destroy();
    }

    // Create Gradients
    const incomeGradient = ctx.createLinearGradient(0, 0, 0, 300);
    incomeGradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)'); // Success Color High Opacity
    incomeGradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)'); // Transparent

    const expenseGradient = ctx.createLinearGradient(0, 0, 0, 300);
    expenseGradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)'); // Danger Color High Opacity
    expenseGradient.addColorStop(1, 'rgba(239, 68, 68, 0.0)'); // Transparent

    // Dark Theme Colors
    const textColor = '#94a3b8'; // text-secondary
    const gridColor = 'rgba(255, 255, 255, 0.05)';

    // Create Chart
    cashflowChartInstance = new Chart(ctxElement, {
        type: 'line',
        data: {
            labels: monthlyData.labels,
            datasets: [
                {
                    label: 'Income',
                    data: monthlyData.income,
                    borderColor: '#10b981', // Success Green
                    backgroundColor: incomeGradient,
                    borderWidth: 2,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#10b981',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Expense',
                    data: monthlyData.expense,
                    borderColor: '#ef4444', // Danger Red
                    backgroundColor: expenseGradient,
                    borderWidth: 2,
                    pointBackgroundColor: '#ef4444',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#ef4444',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: textColor,
                        font: {
                            family: "'Segoe UI', sans-serif",
                            size: 12
                        },
                        usePointStyle: true,
                        boxWidth: 8
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(30, 41, 59, 0.9)', // bg-card-hover
                    titleColor: '#f1f5f9',
                    bodyColor: '#cbd5e1',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            scales: {
                x: {
                    grid: {
                        color: gridColor,
                        drawBorder: false
                    },
                    ticks: {
                        color: textColor
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: gridColor,
                        drawBorder: false
                    },
                    ticks: {
                        color: textColor,
                        callback: function (value) {
                            return (value / 1000).toLocaleString('id-ID') + 'k';
                        }
                    }
                }
            }
        }
    });
}

function processChartData(transactions) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();

    // Initialize last 6 months buckets
    const result = {
        labels: [],
        income: [],
        expense: []
    };

    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthKey = `${d.getFullYear()}-${d.getMonth()}`; // Unique key
        const label = `${months[d.getMonth()]} ${d.getFullYear()}`;

        result.labels.push(label);

        // Filter transactions for this month
        const monthTrans = transactions.filter(t => {
            const tDate = new Date(t.transaction_date);
            return tDate.getMonth() === d.getMonth() && tDate.getFullYear() === d.getFullYear();
        });

        const inc = monthTrans
            .filter(t => t.transaction_type === 'income')
            .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

        const exp = monthTrans
            .filter(t => t.transaction_type === 'expense')
            .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

        result.income.push(inc);
        result.expense.push(exp);
    }

    return result;
}
