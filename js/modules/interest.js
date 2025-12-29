/**
 * Interest Calculator Module
 * Supports Simple and Compound Interest with Monthly Contributions
 * Visualizes growth with Chart.js
 */

let interestChartInstance = null;

export function initInterest() {
    const principalInput = document.getElementById('interest-principal');
    const monthlyInput = document.getElementById('interest-monthly');
    const rateInput = document.getElementById('interest-rate');
    const timeInput = document.getElementById('interest-time');
    const typeSelect = document.getElementById('interest-type');
    const calcBtn = document.getElementById('btn-calc-interest');
    const resultEl = document.getElementById('interest-result');
    const chartCtx = document.getElementById('interestChart')?.getContext('2d');

    if (!principalInput) return;

    const calculate = () => {
        const P = parseFloat(principalInput.value);
        const PMT = parseFloat(monthlyInput.value) || 0;
        const rYear = parseFloat(rateInput.value);
        const tYears = parseFloat(timeInput.value);
        const type = typeSelect.value;
        const r = rYear / 100;

        if (isNaN(P) || isNaN(rYear) || isNaN(tYears)) return;

        let total = 0;
        let totalInvested = P + (PMT * tYears * 12);

        // Data for Chart
        const labels = [];
        const dataInvested = [];
        const dataInterest = [];
        const dataTotal = [];

        if (type === 'simple') {
            total = P * (1 + r * tYears);
            if (PMT > 0) total += (PMT * tYears * 12);
            // Simple interest usually doesn't chart well with PMT mixed in this way, 
            // but let's render standard lines.

            for (let y = 0; y <= tYears; y++) {
                labels.push(`Ano ${y}`);
                let invested = P + (PMT * y * 12);
                let interest = P * r * y;
                dataInvested.push(invested);
                dataInterest.push(interest);
                dataTotal.push(invested + interest);
            }

        } else {
            // Compound
            const i = Math.pow(1 + r, 1 / 12) - 1;

            for (let y = 0; y <= tYears; y++) {
                labels.push(`Ano ${y}`);
                const n = y * 12;

                const valPrincipal = P * Math.pow(1 + i, n);
                const valPMT = PMT * ((Math.pow(1 + i, n) - 1) / i) || 0;

                const currentTotal = valPrincipal + valPMT;
                const currentInvested = P + (PMT * n);

                dataInvested.push(currentInvested);
                dataInterest.push(currentTotal - currentInvested);
                dataTotal.push(currentTotal);
            }
            total = dataTotal[dataTotal.length - 1]; // Last value
        }

        const totalInterest = total - totalInvested;

        resultEl.innerHTML = `
            <div class="summary-card">
                <p>Total Investido: <strong>${formatCurrency(totalInvested)}</strong></p>
                <p>Total em Juros: <strong style="color:var(--primary)">${formatCurrency(totalInterest)}</strong></p>
                <hr style="border-color:rgba(255,255,255,0.1); margin:0.5rem 0;">
                <p style="font-size:1.2rem">Valor Total: <strong style="color:var(--secondary)">${formatCurrency(total)}</strong></p>
            </div>
        `;

        renderChart(labels, dataInvested, dataInterest);
    };

    const renderChart = (labels, invested, interest) => {
        if (!chartCtx) return;

        if (interestChartInstance) interestChartInstance.destroy();

        interestChartInstance = new Chart(chartCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Total Investido',
                        data: invested,
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        borderWidth: 1,
                        stack: 'Stack 0',
                    },
                    {
                        label: 'Juros Acumulados',
                        data: interest,
                        backgroundColor: '#6366f1',
                        stack: 'Stack 0',
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#cbd5e1' } },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                }
            }
        });
    };

    const formatCurrency = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    calcBtn.addEventListener('click', calculate);
}
