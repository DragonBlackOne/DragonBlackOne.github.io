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

    if (currencyFrom) currencyFrom.addEventListener('change', convertCurrency);
    if (currencyTo) currencyTo.addEventListener('change', convertCurrency);
    if (swapBtn) swapBtn.addEventListener('click', swapCurrencies);

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
