/**
 * 💱 Currency Module
 * Gerencia o conversor de moedas
 */

let exchangeRates = {};
let lastRateUpdate = null;

const fallbackRates = {
    BRL: 1, USD: 0.17, EUR: 0.16, GBP: 0.13, JPY: 25.5, CAD: 0.23, AUD: 0.26,
    CHF: 0.15, CNY: 1.22, ARS: 170, MXN: 2.9, KRW: 230, INR: 14.2, BTC: 0.0000028
};

export function initCurrencyConverter() {
    const amountFrom = document.getElementById('amount-from');
    const currencyFrom = document.getElementById('currency-from');
    const currencyTo = document.getElementById('currency-to');
    const swapBtn = document.getElementById('swap-currencies');

    fetchExchangeRates();

    if (amountFrom) {
        amountFrom.addEventListener('input', function () {
            formatConverterInput(this);
            convertCurrency();
        });
    }

    if (currencyFrom) currencyFrom.addEventListener('change', () => {
        convertCurrency();
        fetchCurrencyHistory(currencyFrom.value, currencyTo.value);
    });
    if (currencyTo) currencyTo.addEventListener('change', () => {
        convertCurrency();
        fetchCurrencyHistory(currencyFrom.value, currencyTo.value);
    });
    if (swapBtn) swapBtn.addEventListener('click', () => {
        swapCurrencies();
        fetchCurrencyHistory(currencyFrom.value, currencyTo.value);
    });

    // Initial history
    fetchCurrencyHistory(currencyFrom.value, currencyTo.value);

    setInterval(fetchExchangeRates, 5 * 60 * 1000);
}

async function fetchExchangeRates() {
    const updateInfo = document.getElementById('rate-update-info');
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/BRL');
        if (!response.ok) throw new Error('Falha ao buscar taxas');
        const data = await response.json();
        exchangeRates = data.rates;
        exchangeRates.BRL = 1;
        lastRateUpdate = new Date();
        if (updateInfo) updateInfo.textContent = `✅ Taxas atualizadas em ${lastRateUpdate.toLocaleTimeString('pt-BR')}`;
        convertCurrency();
    } catch (error) {
        console.warn('Usando valores de fallback:', error);
        exchangeRates = { ...fallbackRates };
        if (updateInfo) updateInfo.textContent = '⚠️ Usando taxas aproximadas (offline)';
        convertCurrency();
    }
}

function convertCurrency() {
    const amountFromInput = document.getElementById('amount-from');
    const amountToInput = document.getElementById('amount-to');
    const currencyFrom = document.getElementById('currency-from');
    const currencyTo = document.getElementById('currency-to');
    const rateValueEl = document.getElementById('exchange-rate-value');

    if (!amountFromInput || !amountToInput || !currencyFrom || !currencyTo) return;

    const amount = parseFloat(amountFromInput.value.replace(/\./g, '').replace(',', '.')) || 0;
    const from = currencyFrom.value;
    const to = currencyTo.value;

    if (Object.keys(exchangeRates).length === 0) return;

    let amountInBRL = from === 'BRL' ? amount : amount / exchangeRates[from];
    let result = to === 'BRL' ? amountInBRL : amountInBRL * exchangeRates[to];

    let formattedResult;
    if (to === 'BTC') formattedResult = result.toFixed(8).replace('.', ',');
    else if (to === 'JPY' || to === 'KRW') formattedResult = Math.round(result).toLocaleString('pt-BR');
    else formattedResult = result.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    amountToInput.value = formattedResult;

    if (rateValueEl) {
        let rate = (from === 'BRL' ? exchangeRates[to] : (to === 'BRL' ? 1 / exchangeRates[from] : (1 / exchangeRates[from]) * exchangeRates[to])) || 1;
        let rateFormatted = to === 'BTC' ? rate.toFixed(8) : rate.toFixed(4);
        rateValueEl.textContent = `1 ${from} = ${rateFormatted.replace('.', ',')} ${to}`;
    }
}

function swapCurrencies() {
    const currencyFrom = document.getElementById('currency-from');
    const currencyTo = document.getElementById('currency-to');
    const amountFrom = document.getElementById('amount-from');
    const amountTo = document.getElementById('amount-to');

    if (!currencyFrom || !currencyTo) return;

    const tempCurrency = currencyFrom.value;
    currencyFrom.value = currencyTo.value;
    currencyTo.value = tempCurrency;

    if (amountTo.value && amountTo.value !== '0,00') amountFrom.value = amountTo.value;
    convertCurrency();
}

function formatConverterInput(input) {
    let value = input.value.replace(/[^\d]/g, '');
    if (value === '') { input.value = ''; return; }
    value = (parseInt(value) / 100).toFixed(2);
    value = value.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    input.value = value;
}
let historyChart = null;

async function fetchCurrencyHistory(from, to) {
    // Frankfurter API só suporta certas moedas. Se não suportada, usamos mock.
    const supported = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];
    if (!supported.includes(from) && from !== 'BRL') return renderMockHistory(from, to);

    const end = new Date().toISOString().split('T')[0];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const start = startDate.toISOString().split('T')[0];

    try {
        const res = await fetch(`https://api.frankfurter.app/${start}..${end}?from=${from}&to=${to}`);
        if (!res.ok) throw new Error('History error');
        const data = await res.json();

        const labels = Object.keys(data.rates).map(d => d.split('-').slice(1).reverse().join('/'));
        const values = Object.values(data.rates).map(v => v[to]);

        renderHistoryChart(labels, values, `${from}/${to}`);
    } catch (e) {
        renderMockHistory(from, to);
    }
}

function renderMockHistory(from, to) {
    const labels = ['20/12', '21/12', '22/12', '23/12', '24/12', '25/12', '26/12'];
    const base = from === 'USD' ? 4.9 : (from === 'EUR' ? 5.3 : 1);
    const values = labels.map(() => base + (Math.random() * 0.2 - 0.1));
    renderHistoryChart(labels, values, `${from}/${to} (Simulado)`);
}

function renderHistoryChart(labels, values, title) {
    const ctx = document.getElementById('currency-history-chart');
    if (!ctx || typeof Chart === 'undefined') return;

    if (historyChart) historyChart.destroy();

    historyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: title,
                data: values,
                borderColor: 'hsl(170, 100%, 50%)',
                backgroundColor: 'hsla(170, 100%, 50%, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: 'white'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: { label: (c) => `1 ${title.split('/')[0]} = ${c.raw.toFixed(4)} ${title.split('/')[1]}` }
                }
            },
            scales: {
                y: { ticks: { count: 3 } },
                x: { ticks: { font: { size: 10 } } }
            }
        }
    });
}
