/**
 * Financing Calculator Module
 * Supports Price (Fixed PMT) and SAC (Fixed Amortization)
 */

export function initFinancing() {
    const amountInput = document.getElementById('finance-amount');
    const rateInput = document.getElementById('finance-rate');
    const monthsInput = document.getElementById('finance-months');
    const typeSelect = document.getElementById('finance-type'); // NEW
    const calcBtn = document.getElementById('btn-calc-finance');
    const resultEl = document.getElementById('finance-result');
    const tableBody = document.getElementById('finance-table-body');

    if (!amountInput) return;

    const calculate = () => {
        const P = parseFloat(amountInput.value);
        const i = parseFloat(rateInput.value) / 100;
        const n = parseFloat(monthsInput.value);
        const type = typeSelect ? typeSelect.value : 'price';

        if (isNaN(P) || isNaN(i) || isNaN(n)) return;

        let totalPaid = 0;
        let totalInterest = 0;
        let html = '';
        let balance = P;

        // SAC variables
        const fixedAmortization = P / n;

        // Price variables
        const pricePMT = P * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);

        for (let m = 1; m <= n; m++) {
            let interest, amortization, pmt;

            if (type === 'sac') {
                interest = balance * i;
                amortization = fixedAmortization;
                pmt = amortization + interest;
            } else { // Price
                pmt = pricePMT;
                interest = balance * i;
                amortization = pmt - interest;
            }

            balance -= amortization;
            if (balance < 0.01) balance = 0; // Floating point fix

            totalPaid += pmt;
            totalInterest += interest;

            html += `
                <tr>
                    <td>${m}</td>
                    <td>${formatCurrency(pmt)}</td>
                    <td>${formatCurrency(interest)}</td>
                    <td>${formatCurrency(amortization)}</td>
                    <td>${formatCurrency(balance)}</td>
                </tr>
            `;
        }

        // Summary
        const firstInstallment = type === 'sac' ? (fixedAmortization + P * i) : pricePMT;
        const lastInstallment = type === 'sac' ? (fixedAmortization + fixedAmortization * i) : pricePMT;

        const installmentText = type === 'sac'
            ? `${formatCurrency(firstInstallment)} ➜ ${formatCurrency(lastInstallment)}`
            : `${formatCurrency(pricePMT)}`;

        resultEl.innerHTML = `
            <div class="summary-card">
                <p>Parcela: <strong>${installmentText}</strong></p>
                <p>Total Financiado: <strong>${formatCurrency(P)}</strong></p>
                <p>Total Juros: <strong style="color:#ef4444">${formatCurrency(totalInterest)}</strong></p>
                <hr style="border-color:rgba(255,255,255,0.1); margin:0.5rem 0;">
                <p>Custo Total: <strong>${formatCurrency(totalPaid)}</strong></p>
            </div>
        `;

        if (tableBody) tableBody.innerHTML = html;
        document.querySelector('.finance-table-container').classList.add('visible');
    };

    const formatCurrency = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    calcBtn.addEventListener('click', calculate);
}
