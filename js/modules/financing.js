/**
 * 🏢 Financing Module
 * Cálculo de Financiamento Habitacional (SAC e PRICE)
 */

import { formatCurrency, parseCurrency } from './utils.js';
import { getTranslation } from './i18n.js';

export function initFinancingCalculator() {
    const form = document.getElementById('financing-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        calculateFinancing();
    });

    // Toggle SAC/PRICE
    const typeBtns = document.querySelectorAll('#panel-financing .type-btn');
    typeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            typeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Formatação automática para campos de financiamento
    ['fin-total-value', 'fin-down-payment'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', function () {
                formatCurrencyInput(this);
            });
        }
    });

    // Export CSV
    const exportBtn = document.getElementById('export-financing-csv');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            // Logic for export? (Placeholder or actual export)
            alert('Exportação iniciada...');
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

function calculateFinancing() {
    const totalValue = parseCurrency(document.getElementById('fin-total-value').value);
    const downPayment = parseCurrency(document.getElementById('fin-down-payment').value);
    const annualRate = parseFloat(document.getElementById('fin-interest-rate').value.replace(',', '.')) / 100;
    const periodYears = parseInt(document.getElementById('fin-period').value);

    if (totalValue <= 0 || !annualRate || !periodYears) {
        alert(getTranslation('fill_correctly'));
        return;
    }

    const principal = totalValue - downPayment;
    const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;
    const periodMonths = periodYears * 12;

    const isSAC = document.getElementById('type-sac').classList.contains('active');

    const results = isSAC ? calculateSAC(principal, monthlyRate, periodMonths) : calculatePRICE(principal, monthlyRate, periodMonths);

    // Compare System Logic
    const shouldCompare = document.getElementById('compare-systems')?.checked;
    let comparisonResults = null;
    if (shouldCompare) {
        comparisonResults = isSAC ? calculatePRICE(principal, monthlyRate, periodMonths) : calculateSAC(principal, monthlyRate, periodMonths);
    }

    renderResults(results, principal, downPayment, comparisonResults);
}

function calculateSAC(principal, rate, months) {
    const amortization = principal / months;
    let balance = principal;
    let totalInterest = 0;
    let firstParcel = 0;
    let lastParcel = 0;
    const chartData = [{ month: 0, balance: principal, interest: 0 }];

    for (let m = 1; m <= months; m++) {
        const interest = balance * rate;
        const parcel = amortization + interest;

        if (m === 1) firstParcel = parcel;
        if (m === months) lastParcel = parcel;

        totalInterest += interest;
        balance -= amortization;

        if (m % Math.max(1, Math.floor(months / 20)) === 0 || m === months) {
            chartData.push({ month: m, balance: Math.max(0, balance), interest: totalInterest });
        }
    }

    return { firstParcel, lastParcel, totalInterest, totalCost: principal + totalInterest, chartData, system: 'SAC' };
}

function calculatePRICE(principal, rate, months) {
    const parcel = (principal * rate) / (1 - Math.pow(1 + rate, -months));
    const totalCost = parcel * months;
    const totalInterest = totalCost - principal;
    const chartData = [{ month: 0, balance: principal, interest: 0 }];

    let balance = principal;
    let accumulatedInterest = 0;
    for (let m = 1; m <= months; m++) {
        const interest = balance * rate;
        const amortization = parcel - interest;
        balance -= amortization;
        accumulatedInterest += interest;

        if (m % Math.max(1, Math.floor(months / 20)) === 0 || m === months) {
            chartData.push({ month: m, balance: Math.max(0, balance), interest: accumulatedInterest });
        }
    }

    return { firstParcel: parcel, lastParcel: parcel, totalInterest, totalCost, chartData, system: 'PRICE' };
}

function renderResults(res, principal, downPayment, comparison) {
    document.getElementById('fin-first-parcel').textContent = formatCurrency(res.firstParcel);
    document.getElementById('fin-last-parcel').textContent = formatCurrency(res.lastParcel);
    document.getElementById('fin-total-interest').textContent = formatCurrency(res.totalInterest);
    document.getElementById('fin-total-cost').textContent = formatCurrency(res.totalCost);

    document.getElementById('fin-results-card').classList.add('active');

    // Update label if PRICE
    const firstLabel = document.getElementById('first-parcel-label');
    const isSac = res.system === 'SAC';
    firstLabel.textContent = isSac ? getTranslation('first_parcel') : getTranslation('fixed_parcel');

    if (window.innerWidth < 992) {
        document.getElementById('fin-results-card').scrollIntoView({ behavior: 'smooth' });
    }

    document.getElementById('aria-announce').textContent = `${getTranslation('financing_summary')}. ${getTranslation('first_parcel')}: ${formatCurrency(res.firstParcel)}`;

    updateFinancingChart(res.chartData, comparison ? comparison.chartData : null, res.system, comparison ? comparison.system : null);
}

let financingChart = null;

function updateFinancingChart(data, comparisonData, system1, system2) {
    const ctx = document.getElementById('amortization-chart');
    if (!ctx || typeof Chart === 'undefined') return;

    if (financingChart) financingChart.destroy();

    const datasets = [{
        label: `${system1} - Saldo`,
        data: data.map(d => d.balance),
        borderColor: 'hsl(250, 100%, 75%)',
        backgroundColor: 'hsla(250, 100%, 75%, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0
    }, {
        label: `${system1} - Juros`,
        data: data.map(d => d.interest),
        borderColor: 'hsl(170, 100%, 50%)',
        backgroundColor: 'hsla(170, 100%, 50%, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0
    }];

    if (comparisonData) {
        datasets.push({
            label: `${system2} - Juros`,
            data: comparisonData.map(d => d.interest),
            borderColor: 'hsl(45, 100%, 50%)',
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false
        });
    }

    financingChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => `Mês ${d.month}`),
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { intersect: false, mode: 'index' },
            plugins: {
                legend: { display: true, labels: { color: '#fff', boxWidth: 10 } },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`
                    }
                }
            },
            scales: {
                y: { stacked: false, ticks: { callback: v => formatCurrency(v).split(',')[0] } },
                x: { ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 10 } }
            }
        }
    });
}
