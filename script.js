/**
 * ==========================================================================
 * LOGIC & ACTIONS: Financial Dashboard
 * Author: Senior Front-end Developer
 * Description: State persistence, date filters, Chart.js integrations, and
 *              JSON import/export utilities.
 * ==========================================================================
 */

// 1. GLOBAL STATE & DEFAULT DATA
// ==========================================================================
let transactions = [];
let categories = [];

// Default categories if none exist in localStorage
const DEFAULT_CATEGORIES = [
    'Salário',
    'Investimentos',
    'Alimentação',
    'Moradia',
    'Transporte',
    'Lazer',
    'Saúde',
    'Outros'
];

// Default transactions for styling and first launch visual feedback
const DEFAULT_TRANSACTIONS = [
    { id: '1', description: 'Salário Mensal', type: 'receita', value: 7500.00, category: 'Salário', date: '2026-06-05' },
    { id: '2', description: 'Aluguel Apartamento', type: 'despesa', value: 2200.00, category: 'Moradia', date: '2026-06-10' },
    { id: '3', description: 'Supermercado Semanal', type: 'despesa', value: 650.00, category: 'Alimentação', date: '2026-06-12' },
    { id: '4', description: 'Rendimentos FIIs', type: 'receita', value: 450.00, category: 'Investimentos', date: '2026-06-15' },
    { id: '5', description: 'Restaurante Fim de Semana', type: 'despesa', value: 180.00, category: 'Lazer', date: '2026-06-18' },
    { id: '6', description: 'Combustível Carro', type: 'despesa', value: 250.00, category: 'Transporte', date: '2026-06-20' },
    { id: '7', description: 'Salário Mensal', type: 'receita', value: 7500.00, category: 'Salário', date: '2026-07-05' },
    { id: '8', description: 'Aluguel Apartamento', type: 'despesa', value: 2200.00, category: 'Moradia', date: '2026-07-08' },
    { id: '9', description: 'Supermercado Semanal', type: 'despesa', value: 420.50, category: 'Alimentação', date: '2026-07-09' },
    { id: '10', description: 'Assinatura Streaming', type: 'despesa', value: 55.90, category: 'Lazer', date: '2026-07-03' }
];

// Chart Instances references for proper lifecycle management
let incomeChartInstance = null;
let expenseChartInstance = null;
let currentReportTransactions = [];

// 2. INITIALIZATION AND LIFE-CYCLE
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    setDefaultDates();
    setupTabNavigation();
    populateCategorySelects();
    updateDashboard();
    setupEventListeners();
});

/**
 * Loads categories and transactions from localStorage, or populates defaults.
 */
function loadState() {
    try {
        const storedTransactions = localStorage.getItem('fintrack_transactions');
        const storedCategories = localStorage.getItem('fintrack_categories');
        
        if (storedTransactions) {
            transactions = JSON.parse(storedTransactions);
        } else {
            transactions = [...DEFAULT_TRANSACTIONS];
            localStorage.setItem('fintrack_transactions', JSON.stringify(transactions));
        }

        if (storedCategories) {
            categories = JSON.parse(storedCategories);
        } else {
            categories = [...DEFAULT_CATEGORIES];
            localStorage.setItem('fintrack_categories', JSON.stringify(categories));
        }
    } catch (error) {
        console.error('Erro ao ler do localStorage. Restaurando dados padrões.', error);
        transactions = [...DEFAULT_TRANSACTIONS];
        categories = [...DEFAULT_CATEGORIES];
    }
}

/**
 * Saves current application state to localStorage
 */
function saveState() {
    localStorage.setItem('fintrack_transactions', JSON.stringify(transactions));
    localStorage.setItem('fintrack_categories', JSON.stringify(categories));
}

/**
 * Sets initial filters starting from the 1st of the previous month
 * to today (2026-07-09) to display our default mock data beautifully.
 */
function setDefaultDates() {
    const startDateInput = document.getElementById('filter-start-date');
    const endDateInput = document.getElementById('filter-end-date');
    const todayInput = document.getElementById('trans-date');

    // Set filter range
    startDateInput.value = '2026-06-01';
    endDateInput.value = '2026-07-31';

    // Set transaction default date to today's date (relative to 2026-07-09)
    todayInput.value = '2026-07-09';
}

/**
 * Re-populates the select elements in forms and reports with current categories.
 */
function populateCategorySelects() {
    const select = document.getElementById('trans-category');
    const reportSelect = document.getElementById('report-filter-category');
    
    if (select) select.innerHTML = '';
    
    // Save report selection to restore it after repopulating
    const reportSelectedVal = reportSelect ? reportSelect.value : 'todas';
    if (reportSelect) {
        reportSelect.innerHTML = '<option value="todas">Todas as Categorias</option>';
    }
    
    // Sort categories alphabetically
    const sorted = [...categories].sort((a, b) => a.localeCompare(b));
    
    sorted.forEach(cat => {
        // Trans category select option
        if (select) {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            select.appendChild(option);
        }

        // Report category select option
        if (reportSelect) {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            reportSelect.appendChild(option);
        }
    });

    // Restore report selection
    if (reportSelect) {
        reportSelect.value = reportSelectedVal;
    }
}

// 3. DASHBOARD UPDATING AND CALCULATIONS
// ==========================================================================
/**
 * Triggers all calculations, updates cards UI, table data, and renders charts.
 */
function updateDashboard() {
    const startDateVal = document.getElementById('filter-start-date').value;
    const endDateVal = document.getElementById('filter-end-date').value;

    const startDate = startDateVal ? new Date(startDateVal + 'T00:00:00') : null;
    const endDate = endDateVal ? new Date(endDateVal + 'T23:59:59') : null;

    // Filter transactions within range
    const filtered = transactions.filter(t => {
        const tDate = new Date(t.date + 'T00:00:00');
        if (startDate && tDate < startDate) return false;
        if (endDate && tDate > endDate) return false;
        return true;
    });

    // Calculations
    let totalIncome = 0;
    let totalExpenses = 0;

    filtered.forEach(t => {
        if (t.type === 'receita') {
            totalIncome += t.value;
        } else {
            totalExpenses += t.value;
        }
    });

    const balance = totalIncome - totalExpenses;

    // Update summary cards
    document.getElementById('total-receitas').textContent = formatCurrency(totalIncome);
    document.getElementById('total-despesas').textContent = formatCurrency(totalExpenses);
    document.getElementById('total-saldo').textContent = formatCurrency(balance);

    // Style the balance card based on value
    const balanceCard = document.querySelector('.saldo-card');
    const balanceBadge = document.getElementById('saldo-status-badge');
    
    if (balance >= 0) {
        balanceCard.style.borderLeft = '4px solid var(--accent-color)';
        balanceBadge.textContent = 'Positivo';
        balanceBadge.className = 'trend-badge trend-up';
    } else {
        balanceCard.style.borderLeft = '4px solid var(--danger-color)';
        balanceBadge.textContent = 'Negativo';
        balanceBadge.className = 'trend-badge trend-down';
    }

    // Update full transactions list table
    renderTransactionsTable(filtered);

    // Update dashboard preview table
    renderDashboardRecentTable(filtered);

    // Update categories page tags
    renderCategoriesList();
    
    // Update charts with filtered values (if dashboard view is visible, chart sizes compute correctly)
    const viewDashboard = document.getElementById('view-dashboard');
    if (viewDashboard && !viewDashboard.classList.contains('hidden')) {
        updateCharts(filtered);
    }
    
    // Sync updates to the Reports/Analytics panel
    updateReports();
}

/**
 * Utility helper to format numbers to Brazilian Real currency format.
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

/**
 * Utility helper to format dates from YYYY-MM-DD to DD/MM/YYYY.
 */
function formatDate(dateString) {
    const parts = dateString.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
}

// 4. CHART RENDERING (Chart.js via CDN)
// ==========================================================================
/**
 * Renders the income evolution bar chart and category doughnut chart.
 * Uses destruction to prevent ghost charts on hover or filter updates.
 */
function updateCharts(filteredData) {
    // Shared chart fonts config
    const fontConfig = {
        family: "'Inter', sans-serif",
        size: 11
    };

    // --- CHART 1: INCOME EVOLUTION (BAR CHART) ---
    const barCtx = document.getElementById('chart-receitas-evolucao').getContext('2d');
    
    // Destroy if exists to clean resources
    if (incomeChartInstance) {
        incomeChartInstance.destroy();
    }

    // Group income values by date
    const incomeByDate = {};
    filteredData.filter(t => t.type === 'receita').forEach(t => {
        incomeByDate[t.date] = (incomeByDate[t.date] || 0) + t.value;
    });

    // Sort dates chronologically
    const sortedDates = Object.keys(incomeByDate).sort();
    const formattedLabels = sortedDates.map(d => formatDate(d));
    const barValues = sortedDates.map(d => incomeByDate[d]);

    // Create Bar Chart
    incomeChartInstance = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: formattedLabels.length > 0 ? formattedLabels : ['Sem dados'],
            datasets: [{
                label: 'Receitas (R$)',
                data: barValues.length > 0 ? barValues : [0],
                backgroundColor: '#b4ff39',
                borderRadius: 4,
                borderWidth: 0,
                barPercentage: 0.6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#1c1d22',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#2d3039',
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        label: function(context) {
                            return `Receita: ${formatCurrency(context.parsed.y)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    grid: {
                        color: '#2d3039'
                    },
                    ticks: {
                        color: '#909299',
                        font: fontConfig,
                        callback: function(val) {
                            return formatCurrency(val);
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#909299',
                        font: fontConfig
                    }
                }
            }
        }
    });

    // --- CHART 2: EXPENSES DISTRIBUTION (DOUGHNUT CHART) ---
    const doughnutCtx = document.getElementById('chart-despesas-categoria').getContext('2d');

    // Destroy if exists to clean resources
    if (expenseChartInstance) {
        expenseChartInstance.destroy();
    }

    // Group expenses values by category
    const expenseByCat = {};
    filteredData.filter(t => t.type === 'despesa').forEach(t => {
        expenseByCat[t.category] = (expenseByCat[t.category] || 0) + t.value;
    });

    const expenseCategories = Object.keys(expenseByCat);
    const doughnutValues = Object.values(expenseByCat);

    // Color palette matching dark mode
    const doughnutPalette = [
        '#ff5a79', // Coral / Rose
        '#ff9f43', // Orange
        '#f1c40f', // Yellow/Gold
        '#00d2d3', // Cyan
        '#a55eea', // Muted Violet
        '#5758bb', // Indigo
        '#c8d6e5', // Light steel grey
        '#57606f'  // Dark slate
    ];

    // Create Doughnut Chart
    expenseChartInstance = new Chart(doughnutCtx, {
        type: 'doughnut',
        data: {
            labels: expenseCategories.length > 0 ? expenseCategories : ['Nenhuma Despesa'],
            datasets: [{
                data: doughnutValues.length > 0 ? doughnutValues : [1],
                backgroundColor: expenseCategories.length > 0 ? doughnutPalette.slice(0, expenseCategories.length) : ['#25272e'],
                borderColor: '#1c1d22',
                borderWidth: 2,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#909299',
                        font: fontConfig,
                        boxWidth: 12,
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: '#1c1d22',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#2d3039',
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        label: function(context) {
                            if (expenseCategories.length === 0) return 'Sem despesas no período';
                            const val = context.raw;
                            return ` ${context.label}: ${formatCurrency(val)}`;
                        }
                    }
                }
            },
            cutout: '70%'
        }
    });
}

// 5. TRANSACTIONS TABLE RENDERING
// ==========================================================================
/**
 * Builds table rows dynamically for the filtered list of transactions.
 */
function renderTransactionsTable(filteredData) {
    const tableBody = document.getElementById('transactions-table-body');
    const tableElement = document.getElementById('transactions-table');
    const emptyState = document.getElementById('table-empty-state');
    const counterLabel = document.getElementById('transaction-count');

    // Update count label
    counterLabel.textContent = `${filteredData.length} transaç${filteredData.length === 1 ? 'ão' : 'ões'}`;

    // Clear existing contents
    tableBody.innerHTML = '';

    if (filteredData.length === 0) {
        tableElement.style.display = 'none';
        emptyState.style.display = 'flex';
        return;
    }

    tableElement.style.display = 'table';
    emptyState.style.display = 'none';

    // Sort transactions by date descending for table presentation
    const sorted = [...filteredData].sort((a, b) => new Date(b.date) - new Date(a.date));

    sorted.forEach(t => {
        const tr = document.createElement('tr');
        
        // Formatted cells contents
        const typeBadge = t.type === 'receita' 
            ? `<span class="badge-type receita">Entrada</span>` 
            : `<span class="badge-type despesa">Saída</span>`;

        const valBadge = t.type === 'receita'
            ? `<span class="badge-value receita">+ ${formatCurrency(t.value)}</span>`
            : `<span class="badge-value despesa">- ${formatCurrency(t.value)}</span>`;

        tr.innerHTML = `
            <td style="font-weight: 500;">${escapeHTML(t.description)}</td>
            <td>${typeBadge}</td>
            <td><span class="badge-category">${escapeHTML(t.category)}</span></td>
            <td>${formatDate(t.date)}</td>
            <td>${valBadge}</td>
            <td style="text-align: right;">
                <button class="btn-delete-row" data-id="${t.id}" title="Excluir Transação">
                    <svg viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
            </td>
        `;

        tableBody.appendChild(tr);
    });

    // Delegate click events for row deletions
    tableBody.querySelectorAll('.btn-delete-row').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            deleteTransaction(id);
        });
    });
}

/**
 * Escapes strings to prevent cross-site scripting (XSS).
 */
function escapeHTML(str) {
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}

// 6. FORM HANDLERS AND CUSTOM ACTION STATE MODIFIERS
// ==========================================================================
/**
 * Binds all required event listeners for input fields, forms and buttons.
 */
function setupEventListeners() {
    // Filter trigger listeners
    document.getElementById('filter-start-date').addEventListener('change', updateDashboard);
    document.getElementById('filter-end-date').addEventListener('change', updateDashboard);

    // Form Submissions
    document.getElementById('transaction-form').addEventListener('submit', handleAddTransaction);
    document.getElementById('category-form').addEventListener('submit', handleAddCategory);

    // JSON file handlers
    document.getElementById('btn-export-json').addEventListener('click', exportJSON);
    document.getElementById('import-file-input').addEventListener('change', importJSON);

    // Advanced Report Filters & Actions
    document.getElementById('report-filter-type').addEventListener('change', updateReports);
    document.getElementById('report-filter-category').addEventListener('change', updateReports);
    document.getElementById('report-search-desc').addEventListener('input', updateReports);
    document.getElementById('btn-print-report').addEventListener('click', () => window.print());
    document.getElementById('btn-export-csv').addEventListener('click', exportCSV);
}

/**
 * Handles adding new transactions into the state stack.
 */
function handleAddTransaction(e) {
    e.preventDefault();

    const desc = document.getElementById('trans-desc').value.trim();
    const type = document.getElementById('trans-type').value;
    const value = parseFloat(document.getElementById('trans-value').value);
    const category = document.getElementById('trans-category').value;
    const date = document.getElementById('trans-date').value;

    if (!desc || isNaN(value) || !category || !date) {
        alert('Por favor, preencha todos os campos do formulário.');
        return;
    }

    const newTransaction = {
        id: Date.now().toString(),
        description: desc,
        type: type,
        value: value,
        category: category,
        date: date
    };

    transactions.push(newTransaction);
    saveState();
    updateDashboard();

    // Reset Form (keep date as default)
    document.getElementById('trans-desc').value = '';
    document.getElementById('trans-value').value = '';
}

/**
 * Handles adding a custom category, validation and select repopulation.
 */
function handleAddCategory(e) {
    e.preventDefault();

    const inputField = document.getElementById('new-category-name');
    const newCat = inputField.value.trim();

    if (!newCat) {
        return;
    }

    // Verify duplication
    const duplicate = categories.some(cat => cat.toLowerCase() === newCat.toLowerCase());
    if (duplicate) {
        alert('Esta categoria já existe!');
        return;
    }

    categories.push(newCat);
    saveState();
    populateCategorySelects();
    
    // Clear Input
    inputField.value = '';
}

/**
 * Deletes transaction by ID.
 */
function deleteTransaction(id) {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
        transactions = transactions.filter(t => t.id !== id);
        saveState();
        updateDashboard();
    }
}

// 7. IMPORT / EXPORT DATA STACK
// ==========================================================================
/**
 * Compiles transaction and categories data to JSON and downloads it as file.
 */
function exportJSON() {
    const dataObj = {
        transactions: transactions,
        categories: categories,
        version: '1.0',
        exportedAt: new Date().toISOString()
    };

    const dataString = JSON.stringify(dataObj, null, 2);
    const blob = new Blob([dataString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `fintrack-dados-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup anchor and object URL
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Parses, validates, and imports data from uploaded JSON files.
 */
function importJSON(e) {
    const file = e.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const dataObj = JSON.parse(evt.target.result);
            
            // Validation schema check
            if (!dataObj.transactions || !Array.isArray(dataObj.transactions) ||
                !dataObj.categories || !Array.isArray(dataObj.categories)) {
                throw new Error('Formato do arquivo JSON inválido. Deve conter transações e categorias.');
            }

            // Confirm overwrites
            if (confirm('Isso irá substituir todos os dados existentes no navegador. Deseja prosseguir?')) {
                transactions = dataObj.transactions;
                categories = dataObj.categories;
                saveState();
                populateCategorySelects();
                updateDashboard();
                alert('Dados importados com sucesso!');
            }
        } catch (err) {
            console.error(err);
            alert('Falha ao processar arquivo JSON: ' + err.message);
        } finally {
            // Reset file input value to allow importing same file again
            e.target.value = '';
        }
    };
    reader.readAsText(file);
}

// 8. TAB NAVIGATION & VIEW CONTROL
// ==========================================================================
/**
 * Handles toggling active classes on menu navigation items and switches content views.
 */
function setupTabNavigation() {
    const navDashboard = document.getElementById('nav-dashboard');
    const navTransactions = document.getElementById('nav-transactions');
    const navCategories = document.getElementById('nav-categories');
    const navAnalytics = document.getElementById('nav-analytics');

    const viewDashboard = document.getElementById('view-dashboard');
    const viewTransactions = document.getElementById('view-transactions');
    const viewCategories = document.getElementById('view-categories');
    const viewAnalytics = document.getElementById('view-analytics');

    const navItems = [navDashboard, navTransactions, navCategories, navAnalytics];
    const viewItems = [viewDashboard, viewTransactions, viewCategories, viewAnalytics];

    function switchTab(activeNav, activeView) {
        navItems.forEach(item => {
            if (item) item.classList.remove('active');
        });
        viewItems.forEach(view => {
            if (view) view.classList.add('hidden');
        });

        if (activeNav) activeNav.classList.add('active');
        if (activeView) activeView.classList.remove('hidden');

        // Fetch current filters and redraw/sync views on demand
        const startDateVal = document.getElementById('filter-start-date').value;
        const endDateVal = document.getElementById('filter-end-date').value;
        const startDate = startDateVal ? new Date(startDateVal + 'T00:00:00') : null;
        const endDate = endDateVal ? new Date(endDateVal + 'T23:59:59') : null;
        
        const filtered = transactions.filter(t => {
            const tDate = new Date(t.date + 'T00:00:00');
            if (startDate && tDate < startDate) return false;
            if (endDate && tDate > endDate) return false;
            return true;
        });

        if (activeView === viewDashboard) {
            updateCharts(filtered);
        } else if (activeView === viewAnalytics) {
            updateReports();
        } else if (activeView === viewCategories) {
            renderCategoriesList();
        }
    }

    if (navDashboard) {
        navDashboard.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(navDashboard, viewDashboard);
        });
    }

    if (navTransactions) {
        navTransactions.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(navTransactions, viewTransactions);
        });
    }

    if (navCategories) {
        navCategories.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(navCategories, viewCategories);
        });
    }

    if (navAnalytics) {
        navAnalytics.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(navAnalytics, viewAnalytics);
        });
    }

    // Connect dashboard link "Ver Todas / Adicionar" to transactions tab
    const dashboardLink = document.getElementById('btn-go-to-transactions');
    if (dashboardLink) {
        dashboardLink.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(navTransactions, viewTransactions);
        });
    }
}

/**
 * Renders a preview table of the latest 5 transactions on the dashboard tab.
 */
function renderDashboardRecentTable(filteredData) {
    const tableBody = document.getElementById('dashboard-transactions-table-body');
    const tableElement = document.getElementById('dashboard-transactions-table');
    const emptyState = document.getElementById('dashboard-table-empty-state');

    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (filteredData.length === 0) {
        if (tableElement) tableElement.style.display = 'none';
        if (emptyState) emptyState.style.display = 'flex';
        return;
    }

    if (tableElement) tableElement.style.display = 'table';
    if (emptyState) emptyState.style.display = 'none';

    // Sort transactions by date descending
    const sorted = [...filteredData].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Take only the latest 5
    const latestFive = sorted.slice(0, 5);

    latestFive.forEach(t => {
        const tr = document.createElement('tr');
        
        const typeBadge = t.type === 'receita' 
            ? `<span class="badge-type receita">Entrada</span>` 
            : `<span class="badge-type despesa">Saída</span>`;

        const valBadge = t.type === 'receita'
            ? `<span class="badge-value receita">+ ${formatCurrency(t.value)}</span>`
            : `<span class="badge-value despesa">- ${formatCurrency(t.value)}</span>`;

        tr.innerHTML = `
            <td style="font-weight: 500;">${escapeHTML(t.description)}</td>
            <td>${typeBadge}</td>
            <td><span class="badge-category">${escapeHTML(t.category)}</span></td>
            <td>${formatDate(t.date)}</td>
            <td>${valBadge}</td>
            <td style="text-align: right;">
                <button class="btn-delete-row" data-id="${t.id}" title="Excluir Transação">
                    <svg viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
            </td>
        `;

        tableBody.appendChild(tr);
    });

    // Delegate click events for row deletions on dashboard recent table
    tableBody.querySelectorAll('.btn-delete-row').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            deleteTransaction(id);
        });
    });
}

/**
 * Renders badges for all existing categories with transaction usage counters.
 */
function renderCategoriesList() {
    const container = document.getElementById('categories-badges-container');
    const categoryCountLabel = document.getElementById('category-count');

    if (!container) return;

    container.innerHTML = '';

    if (categoryCountLabel) {
        categoryCountLabel.textContent = `${categories.length} categorian${categories.length === 1 ? '' : 's'}`;
    }

    // Sort categories alphabetically
    const sorted = [...categories].sort((a, b) => a.localeCompare(b));

    sorted.forEach(cat => {
        // Count how many transactions are using this category
        const count = transactions.filter(t => t.category.toLowerCase() === cat.toLowerCase()).length;
        
        const badgeSpan = document.createElement('span');
        badgeSpan.className = 'badge-category';
        badgeSpan.style.display = 'inline-flex';
        badgeSpan.style.alignItems = 'center';
        badgeSpan.style.fontSize = '0.9rem';
        badgeSpan.style.padding = '0.4rem 0.8rem';
        badgeSpan.style.borderRadius = '20px';
        badgeSpan.style.border = '1px solid var(--border-color)';
        
        badgeSpan.innerHTML = `
            ${escapeHTML(cat)}
            <strong style="color: var(--accent-color); margin-left: 6px; font-weight: 700;">(${count})</strong>
        `;

        container.appendChild(badgeSpan);
    });
}

// 9. ADVANCED REPORTS & ANALYTICS
// ==========================================================================
/**
 * Calculates category-based statistics and applies filters to render the report table.
 */
function updateReports() {
    const startDateVal = document.getElementById('filter-start-date').value;
    const endDateVal = document.getElementById('filter-end-date').value;

    const startDate = startDateVal ? new Date(startDateVal + 'T00:00:00') : null;
    const endDate = endDateVal ? new Date(endDateVal + 'T23:59:59') : null;

    // Filter range (base list)
    const dateFiltered = transactions.filter(t => {
        const tDate = new Date(t.date + 'T00:00:00');
        if (startDate && tDate < startDate) return false;
        if (endDate && tDate > endDate) return false;
        return true;
    });

    // 1. Group expenses by category for the report cards
    const expenseByCat = {};
    let totalExpenses = 0;
    
    dateFiltered.filter(t => t.type === 'despesa').forEach(t => {
        expenseByCat[t.category] = (expenseByCat[t.category] || 0) + t.value;
        totalExpenses += t.value;
    });

    const categoryListDOM = document.getElementById('category-summary-list');
    if (categoryListDOM) {
        categoryListDOM.innerHTML = '';
        
        if (totalExpenses === 0) {
            categoryListDOM.innerHTML = '<p class="empty-state" style="padding: 1rem 0;">Nenhuma despesa no período.</p>';
        } else {
            // Sort categories by value descending
            const sortedCats = Object.keys(expenseByCat).sort((a, b) => expenseByCat[b] - expenseByCat[a]);
            sortedCats.forEach(cat => {
                const amount = expenseByCat[cat];
                const percent = ((amount / totalExpenses) * 100).toFixed(0);
                
                const itemDiv = document.createElement('div');
                itemDiv.className = 'category-report-item';
                itemDiv.innerHTML = `
                    <div class="category-report-info">
                        <span class="category-report-name">${escapeHTML(cat)}</span>
                        <div class="category-report-values">
                            <span class="category-report-percentage">${percent}%</span>
                            <span class="category-report-amount">${formatCurrency(amount)}</span>
                        </div>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar-fill expense" style="width: ${percent}%"></div>
                    </div>
                `;
                categoryListDOM.appendChild(itemDiv);
            });
        }
    }

    // 2. Filter report table criteria
    const typeFilter = document.getElementById('report-filter-type').value;
    const catFilter = document.getElementById('report-filter-category').value;
    const searchVal = document.getElementById('report-search-desc').value.trim().toLowerCase();

    let reportsFiltered = dateFiltered.filter(t => {
        // Type filter check
        if (typeFilter !== 'todos' && t.type !== typeFilter) return false;
        
        // Category filter check
        if (catFilter !== 'todas' && t.category !== catFilter) return false;
        
        // Search text check
        if (searchVal && !t.description.toLowerCase().includes(searchVal)) return false;
        
        return true;
    });

    // 3. Render report table row items
    const tableBody = document.getElementById('report-table-body');
    const tableElement = document.getElementById('report-table');
    const emptyState = document.getElementById('report-table-empty-state');
    const countLabel = document.getElementById('report-transaction-count');

    if (countLabel) {
        countLabel.textContent = `${reportsFiltered.length} transaç${reportsFiltered.length === 1 ? 'ão' : 'ões'}`;
    }

    if (tableBody) {
        tableBody.innerHTML = '';
        
        if (reportsFiltered.length === 0) {
            if (tableElement) tableElement.style.display = 'none';
            if (emptyState) emptyState.style.display = 'flex';
        } else {
            if (tableElement) tableElement.style.display = 'table';
            if (emptyState) emptyState.style.display = 'none';

            // Sort descending by date
            reportsFiltered.sort((a, b) => new Date(b.date) - new Date(a.date));

            reportsFiltered.forEach(t => {
                const tr = document.createElement('tr');
                
                const typeBadge = t.type === 'receita' 
                    ? `<span class="badge-type receita">Entrada</span>` 
                    : `<span class="badge-type despesa">Saída</span>`;

                const valBadge = t.type === 'receita'
                    ? `<span class="badge-value receita">+ ${formatCurrency(t.value)}</span>`
                    : `<span class="badge-value despesa">- ${formatCurrency(t.value)}</span>`;

                tr.innerHTML = `
                    <td style="font-weight: 500;">${escapeHTML(t.description)}</td>
                    <td>${typeBadge}</td>
                    <td><span class="badge-category">${escapeHTML(t.category)}</span></td>
                    <td>${formatDate(t.date)}</td>
                    <td>${valBadge}</td>
                `;
                tableBody.appendChild(tr);
            });
        }
    }

    // Reference in global scope for CSV download
    currentReportTransactions = reportsFiltered;
}

/**
 * Transforms report transactions list into CSV text and triggers file download.
 */
function exportCSV() {
    if (currentReportTransactions.length === 0) {
        alert('Não há dados para exportar no relatório atual.');
        return;
    }

    // Add BOM for Excel Portuguese encoding compatibility
    let csvContent = '\uFEFF'; 
    csvContent += 'Descrição,Tipo,Categoria,Data,Valor (R$)\n';

    currentReportTransactions.forEach(t => {
        const desc = `"${t.description.replace(/"/g, '""')}"`;
        const type = t.type === 'receita' ? 'Receita' : 'Despesa';
        const cat = `"${t.category.replace(/"/g, '""')}"`;
        const date = formatDate(t.date);
        const val = t.value.toFixed(2);
        
        csvContent += `${desc},${type},${cat},${date},${val}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fintrack-relatorio-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
