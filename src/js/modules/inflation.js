/**
 * 📉 Inflation Module
 * Calcula a perda do poder de compra e o valor corrigido
 */

import { formatCurrency, parseCurrency } from './utils.js';
import { getTranslation } from './i18n.js';

export function initInflationCalculator() {
    const form = document.getElementById('inflation-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        calculateInflation();
    });

    const valInput = document.getElementById('inflation-value');
    if (valInput) {
        valInput.addEventListener('input', function () {
            formatCurrencyInput(this);
        });
    }
}

function formatCurrencyInput(input) {
    let value = input.value.replace(/\D/g, '');
    if (value === '') return;
    value = (parseInt(value) / 100).toFixed(2).replace('.', ',');
    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    input.value = value;
}

function calculateInflation() {
    const originalValue = parseCurrency(document.getElementById('inflation-value').value);
    const annualRate = parseFloat(document.getElementById('inflation-rate').value.replace(',', '.')) / 100;
    const years = parseInt(document.getElementById('inflation-period').value) || 0;

    if (originalValue <= 0 || annualRate <= 0 || years <= 0) {
        alert(getTranslation('fill_correctly'));
        return;
    }

    // Valor Corrigido = Valor original * (1 + taxa)^anos
    const adjustedValue = originalValue * Math.pow(1 + annualRate, years);

    // Perda de poder de compra = 1 - (valor original / valor corrigido)
    const powerLoss = 1 - (originalValue / adjustedValue);

    document.getElementById('inflation-adjusted-value').textContent = formatCurrency(adjustedValue);
    document.getElementById('inflation-loss-perc').textContent = (powerLoss * 100).toFixed(2) + '%';

    document.getElementById('inflation-results-card').classList.add('active');
}
