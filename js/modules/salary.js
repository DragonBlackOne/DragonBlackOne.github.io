/**
 * Salary & Inflation Calculator
 * Updated for Brasil 2025 Rules (INSS Progressive + IRRF)
 */

export function initSalary() {
    const grossInput = document.getElementById('salary-gross');
    const dependentsInput = document.getElementById('salary-dependents');
    const discountsInput = document.getElementById('salary-discounts');
    const inflationInput = document.getElementById('inflation-rate'); // Optional now
    const calcBtn = document.getElementById('btn-calc-salary');
    const resultEl = document.getElementById('salary-result');

    if (!grossInput) return;

    const calculateINSS = (gross) => {
        // Tabela Progressiva INSS 2025 (Teto R$ 8.157,41)
        // Faixas: 7.5% (1518.00), 9% (2793.88), 12% (4190.83), 14% (8157.41)
        let inss = 0;
        let remainder = gross;

        if (gross > 8157.41) return 908.85 + ((8157.41 - 4190.83) * 0.14) + ((4190.83 - 2793.88) * 0.12) + ((2793.88 - 1518.00) * 0.09) + (1518.00 * 0.075);
        // Actually, let's calculate progressively properly

        const ranges = [
            { limit: 1518.00, rate: 0.075 },
            { limit: 2793.88, rate: 0.09 },
            { limit: 4190.83, rate: 0.12 },
            { limit: 8157.41, rate: 0.14 }
        ];

        let calculatedINSS = 0;
        let previousLimit = 0;

        for (const range of ranges) {
            if (gross > previousLimit) {
                const base = Math.min(gross, range.limit) - previousLimit;
                calculatedINSS += base * range.rate;
                previousLimit = range.limit;
            } else {
                break;
            }
        }

        return Math.min(calculatedINSS, 908.85 + 200); // Wait, explicit ceiling check is better.
        // Re-doing ceiling logic based on simple sum of max contributions per band to be exact:
        // Band 1: 1518 * 0.075 = 113.85
        // Band 2: (2793.88 - 1518) * 0.09 = 114.83
        // Band 3: (4190.83 - 2793.88) * 0.12 = 167.63
        // Band 4: (8157.41 - 4190.83) * 0.14 = 555.32
        // Total Ceiling = 113.85 + 114.83 + 167.63 + 555.32 = 951.63 approx.
        // Let's rely on the loop output, it's safer.
    };

    const calculate = () => {
        const gross = parseFloat(grossInput.value);
        const dependents = parseFloat(dependentsInput.value) || 0;
        const otherDiscounts = parseFloat(discountsInput.value) || 0;

        if (isNaN(gross)) return;

        // 1. INSS
        const inss = gross > 8157.41 ? 951.63 : (() => {
            const ranges = [
                { limit: 1518.00, rate: 0.075 },
                { limit: 2793.88, rate: 0.09 },
                { limit: 4190.83, rate: 0.12 },
                { limit: 8157.41, rate: 0.14 }
            ];
            let acc = 0;
            let prev = 0;
            for (let r of ranges) {
                if (gross > prev) {
                    let base = Math.min(gross, r.limit) - prev;
                    acc += base * r.rate;
                    prev = r.limit;
                }
            }
            return acc;
        })();

        // 2. IRRF Base
        // Base = Gross - INSS - (Dependents * 189.59)
        const dependentDeduction = dependents * 189.59;
        const baseIRRF = gross - inss - dependentDeduction;

        // 3. IRRF Calc (2025 Table)
        let irrf = 0;
        // < 2259.20 Exempt
        if (baseIRRF <= 2259.20) {
            irrf = 0;
        } else if (baseIRRF <= 2826.65) {
            irrf = (baseIRRF * 0.075) - 169.44;
        } else if (baseIRRF <= 3751.05) {
            irrf = (baseIRRF * 0.150) - 381.44;
        } else if (baseIRRF <= 4664.68) {
            irrf = (baseIRRF * 0.225) - 662.77;
        } else {
            irrf = (baseIRRF * 0.275) - 896.00;
        }
        if (irrf < 0) irrf = 0;

        const totalDiscounts = inss + irrf + otherDiscounts;
        const net = gross - totalDiscounts;

        resultEl.innerHTML = `
            <div class="summary-card">
                <p>Salário Bruto: <strong>${formatCurrency(gross)}</strong></p>
                <p>INSS (2025): <span style="color:#ef4444">- ${formatCurrency(inss)}</span></p>
                <p>IRRF (2025): <span style="color:#ef4444">- ${formatCurrency(irrf)}</span></p>
                <p>Outros Descontos: <span style="color:#ef4444">- ${formatCurrency(otherDiscounts)}</span></p>
                <hr style="border-color:rgba(255,255,255,0.1); margin:0.5rem 0;">
                <p style="font-size:1.1rem">Salário Líquido: <strong style="color:var(--primary)">${formatCurrency(net)}</strong></p>
                <p style="font-size:0.8rem; color:var(--text-muted); margin-top:5px;">Aliquota Efetiva: <strong>${((totalDiscounts / gross) * 100).toFixed(2)}%</strong></p>
            </div>
        `;
    };

    const formatCurrency = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    calcBtn.addEventListener('click', calculate);
}
