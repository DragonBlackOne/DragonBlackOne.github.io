/**
 * Interest Calculator Module
 * Calculates Simple and Compound Interest
 */

export function initInterest() {
    const principalInput = document.getElementById('interest-principal');
    const rateInput = document.getElementById('interest-rate');
    const timeInput = document.getElementById('interest-time');
    const typeSelect = document.getElementById('interest-type');
    const calcBtn = document.getElementById('btn-calc-interest');
    const resultEl = document.getElementById('interest-result');

    if (!principalInput) return;

    const calculate = () => {
        const P = parseFloat(principalInput.value);
        const r = parseFloat(rateInput.value) / 100;
        const t = parseFloat(timeInput.value);
        const type = typeSelect.value;

        if (isNaN(P) || isNaN(r) || isNaN(t)) return;

        let A = 0;

        if (type === 'simple') {
            A = P * (1 + r * t);
        } else {
            A = P * Math.pow((1 + r), t);
        }

        resultEl.innerText = A.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    calcBtn.addEventListener('click', calculate);
}
