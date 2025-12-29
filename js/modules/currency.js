/**
 * Currency Converter Module
 * Uses ExchangeRate-API for real-time rates
 */

export function initCurrency() {
    const amountInput = document.getElementById('currency-amount');
    const fromSelect = document.getElementById('currency-from');
    const toSelect = document.getElementById('currency-to');
    const resultEl = document.getElementById('currency-result');
    const convertBtn = document.getElementById('btn-convert');

    // Default Rates (fallback)
    let rates = { USD: 1, BRL: 5.0, EUR: 0.9 };

    if (!amountInput) return;

    // Fetch Rates
    const fetchRates = async () => {
        try {
            const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await res.json();
            rates = data.rates;
            console.log('💱 Rates updated');
        } catch (e) {
            console.error('Error fetching rates:', e);
        }
    };

    const convert = () => {
        const amount = parseFloat(amountInput.value);
        const from = fromSelect.value;
        const to = toSelect.value;

        if (isNaN(amount)) return;

        // Convert to USD then to Target
        const inUSD = amount / rates[from];
        const result = inUSD * rates[to];

        resultEl.innerText = `${result.toLocaleString('pt-BR', { style: 'currency', currency: to })}`;
    };

    convertBtn.addEventListener('click', convert);
    amountInput.addEventListener('input', convert); // Real-time
    fromSelect.addEventListener('change', convert);
    toSelect.addEventListener('change', convert);

    // Initial load
    fetchRates().then(() => {
        convert();
        // Populate options if needed, or stick to hardcoded top currencies for simplicity
    });
}
