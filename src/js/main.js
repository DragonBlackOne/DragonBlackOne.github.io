/**
 * 🧮 Calculadora de Juros Simples e Compostos
 * Desenvolvido com ❤️ para ajudar no planejamento financeiro
 */

// ================================
// 📊 Chart.js Configuration
// ================================
let growthChart = null;

// ================================
// 🔧 Utility Functions
// ================================

/**
 * Formata número para moeda brasileira
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

/**
 * Formata número para percentual
 */
function formatPercent(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value / 100);
}

/**
 * Converte string de moeda para número
 */
function parseCurrency(str) {
    if (!str) return 0;
    // Remove R$, pontos e substitui vírgula por ponto
    return parseFloat(str.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
}

/**
 * Formata input de moeda enquanto digita
 */
function formatCurrencyInput(input) {
    let value = input.value.replace(/\D/g, '');
    if (value === '') {
        input.value = '';
        return;
    }
    value = (parseInt(value) / 100).toFixed(2);
    value = value.replace('.', ',');
    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    input.value = value;
}

/**
 * Formata input de percentual enquanto digita
 */
function formatPercentInput(input) {
    let value = input.value.replace(/[^\d,]/g, '');
    const parts = value.split(',');
    if (parts.length > 2) {
        value = parts[0] + ',' + parts.slice(1).join('');
    }
    input.value = value;
}

// ================================
// 💰 Interest Calculation Functions
// ================================

/**
 * Calcula juros compostos com aportes mensais
 */
function calculateCompoundInterest(principal, monthlyRate, months, monthlyContribution) {
    const data = [];
    let currentAmount = principal;
    let totalInvested = principal;

    // Mês 0 - Capital inicial
    data.push({
        month: 0,
        contribution: principal,
        interest: 0,
        totalInvested: principal,
        balance: principal
    });

    for (let month = 1; month <= months; month++) {
        // Juros do mês sobre o saldo atual
        const interestThisMonth = currentAmount * monthlyRate;

        // Adiciona aporte mensal
        currentAmount += monthlyContribution;
        totalInvested += monthlyContribution;

        // Adiciona juros
        currentAmount += interestThisMonth;

        data.push({
            month: month,
            contribution: monthlyContribution,
            interest: interestThisMonth,
            totalInvested: totalInvested,
            balance: currentAmount
        });
    }

    return data;
}

/**
 * Calcula juros simples com aportes mensais
 */
function calculateSimpleInterest(principal, monthlyRate, months, monthlyContribution) {
    const data = [];
    let totalInvested = principal;

    // Mês 0 - Capital inicial
    data.push({
        month: 0,
        contribution: principal,
        interest: 0,
        totalInvested: principal,
        balance: principal
    });

    for (let month = 1; month <= months; month++) {
        // Em juros simples, os juros são calculados apenas sobre o capital inicial
        // e sobre cada aporte individual desde o momento em que foi feito

        // Adiciona aporte do mês
        totalInvested += monthlyContribution;

        // Juros sobre o capital inicial (todos os meses desde o início)
        const interestOnPrincipal = principal * monthlyRate * month;

        // Juros sobre cada aporte mensal (cada aporte rende pelos meses restantes)
        let interestOnContributions = 0;
        for (let i = 1; i < month; i++) {
            interestOnContributions += monthlyContribution * monthlyRate * (month - i);
        }

        const totalInterest = interestOnPrincipal + interestOnContributions;
        const balance = totalInvested + totalInterest;

        // Juros ganhos apenas neste mês
        const interestThisMonth = month === 1
            ? principal * monthlyRate
            : (principal * monthlyRate) + (monthlyContribution * monthlyRate * (month - 1));

        data.push({
            month: month,
            contribution: monthlyContribution,
            interest: interestThisMonth,
            totalInvested: totalInvested,
            balance: balance
        });
    }

    return data;
}

// ================================
// 📈 Chart Functions
// ================================

/**
 * Cria ou atualiza o gráfico de evolução
 */
function updateChart(data) {
    const ctx = document.getElementById('growth-chart');
    if (!ctx) return;

    const labels = data.map(d => `Mês ${d.month}`);
    const investedData = data.map(d => d.totalInvested);
    const balanceData = data.map(d => d.balance);

    // Se há muitos pontos, reduzir para melhor visualização
    let displayLabels = labels;
    let displayInvested = investedData;
    let displayBalance = balanceData;

    if (data.length > 24) {
        const step = Math.ceil(data.length / 24);
        displayLabels = labels.filter((_, i) => i % step === 0 || i === labels.length - 1);
        displayInvested = investedData.filter((_, i) => i % step === 0 || i === investedData.length - 1);
        displayBalance = balanceData.filter((_, i) => i % step === 0 || i === balanceData.length - 1);
    }

    if (growthChart) {
        growthChart.destroy();
    }

    // Verifica se Chart.js está disponível
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js não está carregado. Carregando...');
        loadChartJS(() => createChart(ctx, displayLabels, displayInvested, displayBalance));
        return;
    }

    createChart(ctx, displayLabels, displayInvested, displayBalance);
}

/**
 * Carrega Chart.js dinamicamente
 */
function loadChartJS(callback) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';
    script.onload = callback;
    document.head.appendChild(script);
}

/**
 * Cria o gráfico
 */
function createChart(ctx, labels, investedData, balanceData) {
    growthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Total Investido',
                    data: investedData,
                    borderColor: 'hsl(170, 100%, 50%)',
                    backgroundColor: 'hsla(170, 100%, 50%, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6
                },
                {
                    label: 'Montante Total',
                    data: balanceData,
                    borderColor: 'hsl(250, 100%, 65%)',
                    backgroundColor: 'hsla(250, 100%, 65%, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'hsla(230, 25%, 15%, 0.95)',
                    titleColor: '#fff',
                    bodyColor: 'hsl(230, 15%, 70%)',
                    borderColor: 'hsla(230, 25%, 30%, 0.5)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function (context) {
                            return context.dataset.label + ': ' + formatCurrency(context.raw);
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'hsla(230, 25%, 30%, 0.2)'
                    },
                    ticks: {
                        color: 'hsl(230, 15%, 50%)',
                        maxRotation: 0
                    }
                },
                y: {
                    grid: {
                        color: 'hsla(230, 25%, 30%, 0.2)'
                    },
                    ticks: {
                        color: 'hsl(230, 15%, 50%)',
                        callback: function (value) {
                            if (value >= 1000000) {
                                return 'R$ ' + (value / 1000000).toFixed(1) + 'M';
                            } else if (value >= 1000) {
                                return 'R$ ' + (value / 1000).toFixed(0) + 'k';
                            }
                            return 'R$ ' + value;
                        }
                    }
                }
            }
        }
    });
}

// ================================
// 📋 Table Functions
// ================================

/**
 * Atualiza a tabela de extrato detalhado
 */
function updateBreakdownTable(data) {
    const tbody = document.getElementById('breakdown-body');
    if (!tbody) return;

    // Limpar tabela
    tbody.innerHTML = '';

    // Se houver muitos meses, mostrar apenas alguns
    let displayData = data;
    if (data.length > 60) {
        // Mostrar primeiro, alguns intermediários e último
        const indices = [0];
        const step = Math.floor(data.length / 12);
        for (let i = step; i < data.length - 1; i += step) {
            indices.push(i);
        }
        indices.push(data.length - 1);
        displayData = indices.map(i => data[i]);
    }

    displayData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.month}</td>
            <td>${formatCurrency(row.contribution)}</td>
            <td style="color: hsl(145, 80%, 50%)">+${formatCurrency(row.interest)}</td>
            <td>${formatCurrency(row.totalInvested)}</td>
            <td style="font-weight: 600">${formatCurrency(row.balance)}</td>
        `;
        tbody.appendChild(tr);
    });
}

// ================================
// 🎯 Main Calculation
// ================================

function calculate() {
    // Obter valores dos inputs
    const initialValue = parseCurrency(document.getElementById('initial-value').value);
    const monthlyContribution = parseCurrency(document.getElementById('monthly-contribution').value);
    const interestRateInput = document.getElementById('interest-rate').value;
    const periodInput = parseInt(document.getElementById('period').value) || 0;

    // Validações básicas
    if (initialValue <= 0 || !interestRateInput || periodInput <= 0) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }

    // Obter tipo de juros (simples ou composto)
    const isCompound = document.getElementById('type-compound').classList.contains('active');

    // Obter tipo de taxa (mensal ou anual)
    const isMonthlyRate = document.getElementById('rate-monthly').classList.contains('active');

    // Obter tipo de período (meses ou anos)
    const isPeriodMonths = document.getElementById('period-months').classList.contains('active');

    // Converter taxa para número
    let interestRate = parseFloat(interestRateInput.replace(',', '.')) / 100;

    // Converter taxa anual para mensal se necessário
    let monthlyRate;
    if (isMonthlyRate) {
        monthlyRate = interestRate;
    } else {
        // Taxa anual para mensal
        if (isCompound) {
            // Para juros compostos: (1 + taxa_anual)^(1/12) - 1
            monthlyRate = Math.pow(1 + interestRate, 1 / 12) - 1;
        } else {
            // Para juros simples: taxa_anual / 12
            monthlyRate = interestRate / 12;
        }
    }

    // Converter período para meses se necessário
    const months = isPeriodMonths ? periodInput : periodInput * 12;

    // Calcular
    let data;
    if (isCompound) {
        data = calculateCompoundInterest(initialValue, monthlyRate, months, monthlyContribution);
    } else {
        data = calculateSimpleInterest(initialValue, monthlyRate, months, monthlyContribution);
    }

    // Obter resultados finais
    const finalData = data[data.length - 1];
    const totalInvested = finalData.totalInvested;
    const finalAmount = finalData.balance;
    const interestEarned = finalAmount - totalInvested;
    const totalReturn = ((finalAmount - totalInvested) / totalInvested) * 100;

    // Atualizar resultados na interface
    document.getElementById('final-amount').textContent = formatCurrency(finalAmount);
    document.getElementById('total-invested').textContent = formatCurrency(totalInvested);
    document.getElementById('interest-earned').textContent = formatCurrency(interestEarned);
    document.getElementById('total-return').textContent = totalReturn.toFixed(2).replace('.', ',') + '%';

    // Ativar card de resultados
    document.getElementById('results-card').classList.add('active');

    // Atualizar gráfico
    updateChart(data);

    // Atualizar tabela
    updateBreakdownTable(data);

    // Scroll para resultados em mobile
    if (window.innerWidth < 992) {
        document.getElementById('results-card').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// ================================
// 🎮 Event Listeners
// ================================

document.addEventListener('DOMContentLoaded', function () {
    // Form submit
    const form = document.getElementById('calculator-form');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            calculate();
        });
    }

    // Formatação de inputs de moeda
    const currencyInputs = ['initial-value', 'monthly-contribution'];
    currencyInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', function () {
                formatCurrencyInput(this);
            });
        }
    });

    // Formatação de input de taxa
    const rateInput = document.getElementById('interest-rate');
    if (rateInput) {
        rateInput.addEventListener('input', function () {
            formatPercentInput(this);
        });
    }

    // Toggle de tipo de juros (Simples/Composto)
    const typeCompound = document.getElementById('type-compound');
    const typeSimple = document.getElementById('type-simple');

    if (typeCompound && typeSimple) {
        typeCompound.addEventListener('click', function () {
            typeCompound.classList.add('active');
            typeSimple.classList.remove('active');
        });

        typeSimple.addEventListener('click', function () {
            typeSimple.classList.add('active');
            typeCompound.classList.remove('active');
        });
    }

    // Toggle de taxa (mensal/anual)
    const rateMonthly = document.getElementById('rate-monthly');
    const rateYearly = document.getElementById('rate-yearly');

    if (rateMonthly && rateYearly) {
        rateMonthly.addEventListener('click', function () {
            rateMonthly.classList.add('active');
            rateYearly.classList.remove('active');
        });

        rateYearly.addEventListener('click', function () {
            rateYearly.classList.add('active');
            rateMonthly.classList.remove('active');
        });
    }

    // Toggle de período (meses/anos)
    const periodMonths = document.getElementById('period-months');
    const periodYears = document.getElementById('period-years');

    if (periodMonths && periodYears) {
        periodMonths.addEventListener('click', function () {
            periodMonths.classList.add('active');
            periodYears.classList.remove('active');
        });

        periodYears.addEventListener('click', function () {
            periodYears.classList.add('active');
            periodMonths.classList.remove('active');
        });
    }

    // Carregar Chart.js ao iniciar
    if (typeof Chart === 'undefined') {
        loadChartJS(() => {
            console.log('Chart.js carregado com sucesso!');
        });
    }
});
