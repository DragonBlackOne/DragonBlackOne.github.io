/**
 * FIRE Calculator Module
 * Financial Independence, Retire Early
 */

export function initFire() {
    const currentInput = document.getElementById('fire-current');
    const monthlyInput = document.getElementById('fire-monthly');
    const expenseInput = document.getElementById('fire-expense');
    const rateInput = document.getElementById('fire-rate');
    const calcBtn = document.getElementById('btn-calc-fire');
    const resultEl = document.getElementById('fire-result');

    if (!currentInput) return;

    const calculate = () => {
        const current = parseFloat(currentInput.value);
        const monthly = parseFloat(monthlyInput.value);
        const expense = parseFloat(expenseInput.value);
        const rate = parseFloat(rateInput.value) / 100; // Annual

        if (isNaN(current) || isNaN(monthly) || isNaN(expense) || isNaN(rate)) return;

        // Target: 25x annual expenses (4% rule)
        const target = expense * 12 * 25;

        let balance = current;
        let months = 0;
        const monthlyRate = Math.pow(1 + rate, 1 / 12) - 1;

        // Simulation (Max 100 years to prevent infinite loop)
        while (balance < target && months < 1200) {
            balance = balance * (1 + monthlyRate) + monthly;
            months++;
        }

        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;

        resultEl.innerHTML = `
            <div class="summary-card">
                <p>Meta FIRE (Regra dos 4%): <strong>${formatCurrency(target)}</strong></p>
                <p>Tempo Estimado: <strong>${years} anos e ${remainingMonths} meses</strong></p>
                <p>Patrimônio Projetado: <strong>${formatCurrency(balance)}</strong></p>
            </div>
        `;
    };

    const formatCurrency = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    calcBtn.addEventListener('click', calculate);
}
