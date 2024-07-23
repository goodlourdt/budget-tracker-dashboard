document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('budget-form');
    const balanceElement = document.getElementById('balance');
    const recordList = document.getElementById('record-list');
    const clearDataButton = document.getElementById('clear-data');
    const summaryChartElement = document.getElementById('summaryChart');
    
    let balance = 0;
    let weeklyRecords = [];
    let summaryChart;

    // Load data from localStorage
    loadFromLocalStorage();

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const incomeLabel = document.getElementById('income-label').value.trim();
        const income = parseFloat(document.getElementById('income').value);
        const expenseLabel = document.getElementById('expense-label').value.trim();
        const expense = parseFloat(document.getElementById('expense').value);
        const date = document.getElementById('date').value;

        if (!isNaN(income) && income > 0) {
            balance += income;
            saveWeeklyRecord(incomeLabel || 'Income', income, date, 'income');
        }

        if (!isNaN(expense) && expense > 0) {
            balance -= expense;
            saveWeeklyRecord(expenseLabel || 'Expense', expense, date, 'expense');
        }

        balanceElement.textContent = `₱${balance.toFixed(2)}`;
        form.reset();
        saveToLocalStorage();
    });

    clearDataButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all data?')) {
            localStorage.removeItem('budgetTrackerData');
            balance = 0;
            weeklyRecords = [];
            balanceElement.textContent = `₱${balance.toFixed(2)}`;
            displayWeeklyRecords();
            updateChart();
        }
    });

    function saveWeeklyRecord(label, amount, date, type) {
        const record = {
            date: new Date(date).toLocaleDateString(),
            label: label,
            amount: amount,
            type: type,
            balance: balance
        };
        weeklyRecords.push(record);
        displayWeeklyRecords();
        updateChart();
    }

    function displayWeeklyRecords() {
        recordList.innerHTML = '';
        weeklyRecords.forEach(record => {
            const li = document.createElement('li');
            li.textContent = `${record.date} - ${record.label}: ₱${record.amount.toFixed(2)}, Balance: ₱${record.balance.toFixed(2)}`;
            li.classList.add(record.type);
            recordList.appendChild(li);
        });
    }

    function saveToLocalStorage() {
        const data = {
            balance: balance,
            weeklyRecords: weeklyRecords
        };
        localStorage.setItem('budgetTrackerData', JSON.stringify(data));
    }

    function loadFromLocalStorage() {
        const data = JSON.parse(localStorage.getItem('budgetTrackerData'));
        if (data) {
            balance = data.balance;
            weeklyRecords = data.weeklyRecords;
            balanceElement.textContent = `₱${balance.toFixed(2)}`;
            displayWeeklyRecords();
            updateChart();
        }
    }

    function updateChart() {
        const incomeTotal = weeklyRecords
            .filter(r => r.type === 'income')
            .reduce((sum, r) => sum + r.amount, 0);
        const expenseTotal = weeklyRecords
            .filter(r => r.type === 'expense')
            .reduce((sum, r) => sum + r.amount, 0);

        if (summaryChart) {
            summaryChart.destroy();
        }

        summaryChart = new Chart(summaryChartElement, {
            type: 'pie',
            data: {
                labels: ['Income', 'Expenses'],
                datasets: [{
                    data: [incomeTotal, expenseTotal],
                    backgroundColor: ['#28a745', '#dc3545']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                return `₱${tooltipItem.raw.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
    }
});
