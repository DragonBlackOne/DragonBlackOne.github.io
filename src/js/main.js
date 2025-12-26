/**
 * 🧮 Super Calculadora
 * Calculadora Padrão + Conversor de Moedas + Calculadora de Juros
 * Desenvolvido com ❤️ para ajudar no planejamento financeiro
 */

// ================================
// 🚀 Tab Navigation
// ================================

/**
 * Inicializa navegação por abas
 */
function initTabNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    const panels = document.querySelectorAll('.calc-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;

            // Remove active e atualiza ARIA de todas as abas e painéis
            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            panels.forEach(p => p.classList.remove('active'));

            // Adiciona active e atualiza ARIA na aba clicada e painel correspondente
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            const targetPanel = document.getElementById(`panel-${targetTab}`);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
}

// ================================
// 🔢 Standard Calculator
// ================================

let calcDisplay = '';
let calcExpression = '';
let calcHistory = [];
let lastResult = null;

/**
 * Atualiza o display da calculadora
 */
function updateCalcDisplay() {
    const expressionEl = document.getElementById('calc-expression');
    const resultEl = document.getElementById('calc-result');

    if (expressionEl) {
        expressionEl.textContent = calcExpression;
    }
    if (resultEl) {
        resultEl.textContent = calcDisplay || '0';
    }
}

/**
 * Adiciona número ao display
 */
function appendNumber(number) {
    // Evita múltiplos zeros no início
    if (number === '0' && calcDisplay === '0') return;

    // Substitui zero inicial por número
    if (calcDisplay === '0' && number !== '0') {
        calcDisplay = number;
    } else {
        calcDisplay += number;
    }

    updateCalcDisplay();
}

/**
 * Adiciona decimal
 */
function appendDecimal() {
    if (calcDisplay.includes(',')) return;
    if (calcDisplay === '' || calcDisplay === '0') {
        calcDisplay = '0,';
    } else {
        calcDisplay += ',';
    }
    updateCalcDisplay();
}

/**
 * Define operador
 */
function setOperator(operator) {
    if (calcDisplay === '' && lastResult !== null) {
        calcDisplay = lastResult.toString().replace('.', ',');
    }

    if (calcDisplay === '') return;

    const operatorSymbols = {
        'add': ' + ',
        'subtract': ' − ',
        'multiply': ' × ',
        'divide': ' ÷ '
    };

    calcExpression += calcDisplay + operatorSymbols[operator];
    calcDisplay = '';
    updateCalcDisplay();
}

/**
 * Calcula porcentagem
 */
function calcPercent() {
    if (calcDisplay === '') return;
    const value = parseFloat(calcDisplay.replace(',', '.'));
    calcDisplay = (value / 100).toString().replace('.', ',');
    updateCalcDisplay();
}

/**
 * Limpa calculadora
 */
function clearCalc() {
    calcDisplay = '';
    calcExpression = '';
    updateCalcDisplay();
}

/**
 * Apaga último caractere
 */
function backspace() {
    calcDisplay = calcDisplay.slice(0, -1);
    updateCalcDisplay();
}

/**
 * Calcula resultado
 */
function calculateResult() {
    if (calcDisplay === '' && calcExpression === '') return;

    const fullExpression = calcExpression + calcDisplay;

    // Converte para expressão matemática avaliável
    let mathExpression = fullExpression
        .replace(/,/g, '.')
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-');

    try {
        // Avalia a expressão de forma segura
        const result = Function('"use strict"; return (' + mathExpression + ')')();

        if (isNaN(result) || !isFinite(result)) {
            calcDisplay = 'Erro';
            calcExpression = '';
            updateCalcDisplay();
            return;
        }

        // Formata resultado
        const formattedResult = Number(result.toFixed(10)).toString().replace('.', ',');

        // Adiciona ao histórico
        addToHistory(fullExpression, formattedResult);

        lastResult = result;
        calcExpression = '';
        calcDisplay = formattedResult;
        updateCalcDisplay();
    } catch (error) {
        calcDisplay = 'Erro';
        calcExpression = '';
        updateCalcDisplay();
    }
}

/**
 * Adiciona item ao histórico
 */
function addToHistory(expression, result) {
    calcHistory.unshift({ expression, result });

    // Mantém apenas os últimos 10 itens
    if (calcHistory.length > 10) {
        calcHistory.pop();
    }

    updateHistoryDisplay();
}

/**
 * Atualiza display do histórico
 */
function updateHistoryDisplay() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;

    historyList.innerHTML = calcHistory.map(item => `
        <div class="history-item">
            <span class="history-expression">${item.expression} =</span>
            <span class="history-result">${item.result}</span>
        </div>
    `).join('');
}

/**
 * Inicializa calculadora padrão
 */
function initStandardCalculator() {
    const calcButtons = document.querySelectorAll('.calc-btn');

    calcButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const value = btn.dataset.value;
            const action = btn.dataset.action;

            if (value !== undefined) {
                appendNumber(value);
            } else if (action) {
                switch (action) {
                    case 'clear':
                        clearCalc();
                        break;
                    case 'backspace':
                        backspace();
                        break;
                    case 'percent':
                        calcPercent();
                        break;
                    case 'decimal':
                        appendDecimal();
                        break;
                    case 'equals':
                        calculateResult();
                        break;
                    case 'add':
                    case 'subtract':
                    case 'multiply':
                    case 'divide':
                        setOperator(action);
                        break;
                }
            }
        });
    });

    // Suporte a teclado
    document.addEventListener('keydown', (e) => {
        // Verifica se o foco está em um input da calculadora de juros
        if (document.activeElement.tagName === 'INPUT') return;

        const key = e.key;

        if (/^[0-9]$/.test(key)) {
            appendNumber(key);
        } else if (key === '.' || key === ',') {
            appendDecimal();
        } else if (key === '+') {
            setOperator('add');
        } else if (key === '-') {
            setOperator('subtract');
        } else if (key === '*') {
            setOperator('multiply');
        } else if (key === '/') {
            e.preventDefault();
            setOperator('divide');
        } else if (key === 'Enter' || key === '=') {
            e.preventDefault();
            calculateResult();
        } else if (key === 'Escape') {
            clearCalc();
        } else if (key === 'Backspace') {
            backspace();
        } else if (key === '%') {
            calcPercent();
        }
    });
}

// ================================
// 💱 Currency Converter
// ================================

let exchangeRates = {};
let lastRateUpdate = null;

// Taxas de fallback caso a API falhe (aproximadas)
const fallbackRates = {
    BRL: 1,
    USD: 0.17,
    EUR: 0.16,
    GBP: 0.13,
    JPY: 25.5,
    CAD: 0.23,
    AUD: 0.26,
    CHF: 0.15,
    CNY: 1.22,
    ARS: 170,
    MXN: 2.9,
    KRW: 230,
    INR: 14.2,
    BTC: 0.0000028
};

/**
 * Busca taxas de câmbio da API
 */
async function fetchExchangeRates() {
    const updateInfo = document.getElementById('rate-update-info');

    try {
        // Usando API gratuita (sem necessidade de chave)
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/BRL');

        if (!response.ok) {
            throw new Error('Falha ao buscar taxas');
        }

        const data = await response.json();
        exchangeRates = data.rates;
        exchangeRates.BRL = 1; // Base
        lastRateUpdate = new Date();

        if (updateInfo) {
            updateInfo.textContent = `✅ Taxas atualizadas em ${lastRateUpdate.toLocaleTimeString('pt-BR')}`;
        }

        // Converte automaticamente após carregar taxas
        convertCurrency();

    } catch (error) {
        console.warn('Erro ao buscar taxas de câmbio, usando valores de fallback:', error);
        exchangeRates = { ...fallbackRates };

        if (updateInfo) {
            updateInfo.textContent = '⚠️ Usando taxas aproximadas (offline)';
        }

        convertCurrency();
    }
}

/**
 * Converte moeda
 */
function convertCurrency() {
    const amountFromInput = document.getElementById('amount-from');
    const amountToInput = document.getElementById('amount-to');
    const currencyFrom = document.getElementById('currency-from');
    const currencyTo = document.getElementById('currency-to');
    const rateValueEl = document.getElementById('exchange-rate-value');

    if (!amountFromInput || !amountToInput || !currencyFrom || !currencyTo) return;

    // Pega valor do input
    const amountStr = amountFromInput.value;
    const amount = parseFloat(amountStr.replace(/\./g, '').replace(',', '.')) || 0;

    const from = currencyFrom.value;
    const to = currencyTo.value;

    if (Object.keys(exchangeRates).length === 0) return;

    // Calcula conversão
    // Primeiro converte para BRL, depois para moeda destino
    let amountInBRL = amount;
    if (from !== 'BRL') {
        amountInBRL = amount / exchangeRates[from];
    }

    let result = amountInBRL;
    if (to !== 'BRL') {
        result = amountInBRL * exchangeRates[to];
    }

    // Formata resultado
    let formattedResult;
    if (to === 'BTC') {
        formattedResult = result.toFixed(8).replace('.', ',');
    } else if (to === 'JPY' || to === 'KRW') {
        formattedResult = Math.round(result).toLocaleString('pt-BR');
    } else {
        formattedResult = result.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    amountToInput.value = formattedResult;

    // Atualiza taxa de câmbio exibida
    if (rateValueEl) {
        let rate;
        if (from === 'BRL') {
            rate = exchangeRates[to] || 1;
        } else if (to === 'BRL') {
            rate = 1 / (exchangeRates[from] || 1);
        } else {
            rate = (1 / (exchangeRates[from] || 1)) * (exchangeRates[to] || 1);
        }

        let rateFormatted;
        if (to === 'BTC') {
            rateFormatted = rate.toFixed(8);
        } else {
            rateFormatted = rate.toFixed(4);
        }

        rateValueEl.textContent = `1 ${from} = ${rateFormatted.replace('.', ',')} ${to}`;
    }
}

/**
 * Inverte moedas
 */
function swapCurrencies() {
    const currencyFrom = document.getElementById('currency-from');
    const currencyTo = document.getElementById('currency-to');
    const amountFrom = document.getElementById('amount-from');
    const amountTo = document.getElementById('amount-to');

    if (!currencyFrom || !currencyTo) return;

    // Troca moedas
    const tempCurrency = currencyFrom.value;
    currencyFrom.value = currencyTo.value;
    currencyTo.value = tempCurrency;

    // Troca valores (resultado vira input)
    if (amountTo.value && amountTo.value !== '0,00') {
        amountFrom.value = amountTo.value;
    }

    // Reconverte
    convertCurrency();
}

/**
 * Formata input de moeda do conversor
 */
function formatConverterInput(input) {
    let value = input.value.replace(/[^\d]/g, '');
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
 * Inicializa conversor de moedas
 */
function initCurrencyConverter() {
    const amountFrom = document.getElementById('amount-from');
    const currencyFrom = document.getElementById('currency-from');
    const currencyTo = document.getElementById('currency-to');
    const swapBtn = document.getElementById('swap-currencies');

    // Carregar taxas de câmbio
    fetchExchangeRates();

    // Event listeners
    if (amountFrom) {
        amountFrom.addEventListener('input', function () {
            formatConverterInput(this);
            convertCurrency();
        });
    }

    if (currencyFrom) {
        currencyFrom.addEventListener('change', convertCurrency);
    }

    if (currencyTo) {
        currencyTo.addEventListener('change', convertCurrency);
    }

    if (swapBtn) {
        swapBtn.addEventListener('click', swapCurrencies);
    }

    // Atualizar taxas a cada 5 minutos
    setInterval(fetchExchangeRates, 5 * 60 * 1000);
}

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
    // Inicializar navegação por abas
    initTabNavigation();

    // Inicializar calculadora padrão
    initStandardCalculator();

    // Inicializar conversor de moedas
    initCurrencyConverter();

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
