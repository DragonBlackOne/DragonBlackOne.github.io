/**
 * Financing Calculator Module
 * Calculates PMT and generates Amortization Schedule (Price/SAC)
 */

export function initFinancing() {
    const amountInput = document.getElementById('finance-amount');
    const rateInput = document.getElementById('finance-rate'); // Monthly rate %
    const monthsInput = document.getElementById('finance-months');
    const calcBtn = document.getElementById('btn-calc-finance');
    const resultEl = document.getElementById('finance-result');
    const tableBody = document.getElementById('finance-table-body');

    if (!amountInput) return;

    const calculate = () => {
        const P = parseFloat(amountInput.value); // Principal
        const i = parseFloat(rateInput.value) / 100; // Monthly Interest
        const n = parseFloat(monthsInput.value); // Months

        if (isNaN(P) || isNaN(i) || isNaN(n)) return;

        // PMT Formula (Price Table)
        const pmt = P * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
        const totalPaid = pmt * n;
        const totalInterest = totalPaid - P;

        // Display Summary
        resultEl.innerHTML = `
            <div class="summary-card">
                <p>Parcela Mensal: <strong>${formatCurrency(pmt)}</strong></p>
                <p>Total Pago: <strong>${formatCurrency(totalPaid)}</strong></p>
                <p>Total Juros: <strong>${formatCurrency(totalInterest)}</strong></p>
            </div>
        `;

        // Generate Table
        let balance = P;
        let html = '';

        for (let m = 1; m <= n; m++) {
            const interest = balance * i;
            const amortization = pmt - interest;
            balance -= amortization;
            if (balance < 0) balance = 0;

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

        if (tableBody) tableBody.innerHTML = html;
        document.querySelector('.finance-table-container').classList.add('visible');
    };

    const formatCurrency = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    calcBtn.addEventListener('click', calculate);
}
