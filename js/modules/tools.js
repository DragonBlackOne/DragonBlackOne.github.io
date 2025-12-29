/**
 * 🛠️ Tools Module
 * Ferramentas rápidas: Descontos e Gorjetas
 */

import { formatCurrency, parseCurrency } from './utils.js';

export function initQuickTools() {
    // Discount
    const discPrice = document.getElementById('discount-price');
    const discPerc = document.getElementById('discount-perc');

    if (discPrice && discPerc) {
        [discPrice, discPerc].forEach(el => {
            el.addEventListener('input', () => {
                const price = parseCurrency(discPrice.value);
                const perc = parseFloat(discPerc.value) || 0;
                const result = price * (1 - perc / 100);
                document.getElementById('discount-res').textContent = formatCurrency(result);
            });
        });
    }

    // Tips
    const tipTotal = document.getElementById('tip-total');
    const tipPerc = document.getElementById('tip-perc');
    const tipPeople = document.getElementById('tip-people');

    if (tipTotal && tipPerc && tipPeople) {
        [tipTotal, tipPerc, tipPeople].forEach(el => {
            el.addEventListener('input', () => {
                const total = parseCurrency(tipTotal.value);
                const perc = parseFloat(tipPerc.value) || 0;
                const people = parseInt(tipPeople.value) || 1;

                const tipAmount = total * (perc / 100);
                const finalPerPerson = (total + tipAmount) / Math.max(1, people);

                document.getElementById('tip-res').textContent = formatCurrency(finalPerPerson);
            });
        });
    }

    // Apply money masks
    document.querySelectorAll('.money-input').forEach(input => {
        input.addEventListener('input', function () {
            let value = this.value.replace(/\D/g, '');
            if (value === '') return;
            value = (parseInt(value) / 100).toFixed(2).replace('.', ',');
            value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
            this.value = value;
        });
    });
}
