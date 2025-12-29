/**
 * Salary & Inflation Calculator
 * Real Salary (deflated) and Net Salary (CLT 2024 rules approx)
 */

export function initSalary() {
    const grossInput = document.getElementById('salary-gross');
    const inflationInput = document.getElementById('inflation-rate');
    const calcBtn = document.getElementById('btn-calc-salary');
    const resultEl = document.getElementById('salary-result');

    if (!grossInput) return;

    const calculate = () => {
        const gross = parseFloat(grossInput.value);
        const inflation = parseFloat(inflationInput.value);

        if (isNaN(gross) || isNaN(inflation)) return;

        // Simple INSS/IRRF approximation (2024 tables simplified)
        let inss = 0;
        if (gross <= 1412.00) inss = gross * 0.075;
        else if (gross <= 2666.68) inss = gross * 0.09 - 21.18;
        else if (gross <= 4000.03) inss = gross * 0.12 - 101.18;
        else if (gross <= 7786.02) inss = gross * 0.14 - 181.18;
        else inss = 908.85; // Teto

        const baseIRRF = gross - inss;
        let irrf = 0;
        if (baseIRRF <= 2259.20) irrf = 0;
        else if (baseIRRF <= 2826.65) irrf = baseIRRF * 0.075 - 169.44;
        else if (baseIRRF <= 3751.05) irrf = baseIRRF * 0.15 - 381.44;
        else if (baseIRRF <= 4664.68) irrf = baseIRRF * 0.225 - 662.77;
        else irrf = baseIRRF * 0.275 - 896.00;

        const net = gross - inss - irrf;

        // Inflation Impact (Real Value in 1 year)
        const realValue = net / (1 + (inflation / 100));

        resultEl.innerHTML = `
            <div class="summary-card">
                <p>Salário Bruto: <strong>${formatCurrency(gross)}</strong></p>
                <p>Descontos (INSS+IR): <strong>${formatCurrency(inss + irrf)}</strong></p>
                <p>Salário Líquido (Estimado): <strong>${formatCurrency(net)}</strong></p>
                <p style="margin-top:0.5rem; color:var(--text-muted)">Poder de Compra (1 ano): <strong>${formatCurrency(realValue)}</strong></p>
            </div>
        `;
    };

    const formatCurrency = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    calcBtn.addEventListener('click', calculate);
}
