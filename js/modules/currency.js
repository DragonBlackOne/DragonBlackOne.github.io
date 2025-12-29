/**
 * Currency Converter Module
 * Uses ExchangeRate-API for real-time rates
 * Stores rates in localStorage for offline usage.
 */

export function initCurrency() {
    const amountInput = document.getElementById('currency-amount');
    const fromSelect = document.getElementById('currency-from');
    const toSelect = document.getElementById('currency-to');
    const resultEl = document.getElementById('currency-result');
    const convertBtn = document.getElementById('btn-convert');

    // Default Fallback
    let rates = { USD: 1, BRL: 5.0, EUR: 0.9 };

    if (!amountInput) return;

    // Load from LocalStorage
    const loadCachedRates = () => {
        const cached = localStorage.getItem('currency_rates');
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                // Check if data is fresh enough (e.g., 24h)? For now just use it.
                rates = parsed.rates;
                console.log('💱 Loaded offline rates');
                return true;
            } catch (e) {
                console.error('Error parsing cached rates', e);
            }
        }
        return false;
    };

    // Fetch Rates
    const fetchRates = async () => {
        try {
            const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            if (!res.ok) throw new Error('Network response was not ok');
            const data = await res.json();
            rates = data.rates;

            // Save to LocalStorage
            localStorage.setItem('currency_rates', JSON.stringify(data));
            console.log('💱 Rates updated & saved');
        } catch (e) {
            console.warn('Using offline/cached rates due to error:', e);
            loadCachedRates();
        }
    };

    const convert = () => {
        const amount = parseFloat(amountInput.value);
        const from = fromSelect.value;
        const to = toSelect.value;
        const rateFrom = rates[from] || 1;
        const rateTo = rates[to] || 1;

        if (isNaN(amount)) return;

        // Convert to USD then to Target
        // 1 USD = rateFrom[FROM]
        // 1 USD = rateTo[TO]
        // val / rateFrom = val in USD
        // val in USD * rateTo = val in Target

        const inUSD = amount / rateFrom;
        const result = inUSD * rateTo;

        resultEl.innerText = `${result.toLocaleString('pt-BR', { style: 'currency', currency: to })}`;

        // Show indicator if offline?
        if (!navigator.onLine) {
            resultEl.innerText += ' (Offline)';
        }
    };

    convertBtn.addEventListener('click', convert);
    amountInput.addEventListener('input', convert);
    fromSelect.addEventListener('change', convert);
    toSelect.addEventListener('change', convert);

    // Initial load
    fetchRates().then(() => {
        convert();
    });
}
