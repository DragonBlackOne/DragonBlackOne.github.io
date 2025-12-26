/**
 * 💰 Interest Module
 * Gerencia a calculadora de juros e gráficos
 */

import { formatCurrency, parseCurrency } from './utils.js';
import { playSuccess } from './audio.js';
import { launchConfetti } from './confetti.js';

let growthChart = null;

export function initInterestCalculator() {
    const form = document.getElementById('calculator-form');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            calculateInterest();
        });
    }

    // Toggle de Tipos
    const typeCompound = document.getElementById('type-compound');
    const typeSimple = document.getElementById('type-simple');

    if (typeCompound && typeSimple) {
        typeCompound.addEventListener('click', () => {
            typeCompound.classList.add('active');
            typeSimple.classList.remove('active');
        });
        typeSimple.addEventListener('click', () => {
            typeSimple.classList.add('active');
            typeCompound.classList.remove('active');
        });
    }

    // Toggle de Taxas e Período
    setupToggle('rate-monthly', 'rate-yearly');
    setupToggle('period-months', 'period-years');

    // Exportar
    setupExportButton();
}

let lastBreakdownData = [];

function setupExportButton() {
    const btn = document.getElementById('export-interest-csv');
    if (btn) {
        btn.onclick = () => {
            if (lastBreakdownData.length === 0) return;
            import('./utils.js').then(utils => {
                const rows = [
                    ["Mes", "Contribuicao", "Juros", "Investido", "Total"],
                    ...lastBreakdownData.map(d => [d.month, d.contribution, d.interest, d.totalInvested, d.balance])
                ];
                utils.exportToCSV("simulacao_juros.csv", rows);
            });
        };
    }
}

function setupToggle(id1, id2) {
    const btn1 = document.getElementById(id1);
    const btn2 = document.getElementById(id2);
    if (btn1 && btn2) {
        btn1.addEventListener('click', () => { btn1.classList.add('active'); btn2.classList.remove('active'); });
        btn2.addEventListener('click', () => { btn2.classList.add('active'); btn1.classList.remove('active'); });
    }
}

function calculateInterest() {
    const initialValue = parseCurrency(document.getElementById('initial-value').value);
    const monthlyContribution = parseCurrency(document.getElementById('monthly-contribution').value);
    const interestRateInput = document.getElementById('interest-rate').value;
    const periodInput = parseInt(document.getElementById('period').value) || 0;

    if (initialValue <= 0 || !interestRateInput || periodInput <= 0) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }

    const isCompound = document.getElementById('type-compound').classList.contains('active');
    const isMonthlyRate = document.getElementById('rate-monthly').classList.contains('active');
    const isPeriodMonths = document.getElementById('period-months').classList.contains('active');

    let interestRate = parseFloat(interestRateInput.replace(',', '.')) / 100;
    let monthlyRate = isMonthlyRate ? interestRate : (isCompound ? Math.pow(1 + interestRate, 1 / 12) - 1 : interestRate / 12);
    const months = isPeriodMonths ? periodInput : periodInput * 12;

    let data = isCompound ? calculateCompound(initialValue, monthlyRate, months, monthlyContribution) : calculateSimple(initialValue, monthlyRate, months, monthlyContribution);

    const finalData = data[data.length - 1];
    const totalInvested = finalData.totalInvested;
    const interestEarned = finalData.balance - totalInvested;
    const totalReturn = ((finalData.balance - totalInvested) / totalInvested) * 100;

    document.getElementById('final-amount').textContent = formatCurrency(finalData.balance);
    document.getElementById('total-invested').textContent = formatCurrency(totalInvested);
    document.getElementById('interest-earned').textContent = formatCurrency(interestEarned);
    document.getElementById('total-return').textContent = totalReturn.toFixed(2).replace('.', ',') + '%';

    document.getElementById('results-card').classList.add('active');
    updateChart(data);
    updateBreakdownTable(data);

    // Ultimate Effects
    playSuccess();
    launchConfetti();
}

function calculateCompound(principal, rate, months, contribution) {
    const data = [{ month: 0, contribution: principal, interest: 0, totalInvested: principal, balance: principal }];
    let current = principal;
    let invested = principal;
    for (let m = 1; m <= months; m++) {
        let interest = current * rate;
        current += contribution + interest;
        invested += contribution;
        data.push({ month: m, contribution, interest, totalInvested: invested, balance: current });
    }
    return data;
}

function calculateSimple(principal, rate, months, contribution) {
    const data = [{ month: 0, contribution: principal, interest: 0, totalInvested: principal, balance: principal }];
    let invested = principal;
    for (let m = 1; m <= months; m++) {
        invested += contribution;
        let interestOnPrincipal = principal * rate * m;
        let interestOnContributions = 0;
        for (let i = 1; i < m; i++) interestOnContributions += contribution * rate * (m - i);
        let totalInterest = interestOnPrincipal + interestOnContributions;
        data.push({ month: m, contribution, interest: totalInterest, totalInvested: invested, balance: invested + totalInterest });
    }
    return data;
}

function updateChart(data) {
    const ctx = document.getElementById('growth-chart');
    if (!ctx || typeof Chart === 'undefined') return;

    if (growthChart) growthChart.destroy();

    growthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => `Mês ${d.month}`),
            datasets: [{
                label: 'Investido',
                data: data.map(d => d.totalInvested),
                borderColor: 'hsl(170, 100%, 50%)',
                backgroundColor: 'hsla(170, 100%, 50%, 0.1)',
                fill: true, tension: 0.4, pointRadius: 0
            }, {
                label: 'Montante',
                data: data.map(d => d.balance),
                borderColor: 'hsl(250, 100%, 65%)',
                backgroundColor: 'hsla(250, 100%, 65%, 0.1)',
                fill: true, tension: 0.4, pointRadius: 0
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { ticks: { callback: v => formatCurrency(v).split(',')[0] } } }
        }
    });
}

function updateBreakdownTable(data) {
    lastBreakdownData = data;
    const tbody = document.getElementById('breakdown-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    const displayData = data.length > 60 ? [data[0], ...data.slice(1, -1).filter((_, i) => i % Math.floor(data.length / 10) === 0), data[data.length - 1]] : data;
    displayData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${row.month}</td><td>${formatCurrency(row.contribution)}</td><td style="color:hsl(145,80%,50%)">+${formatCurrency(row.interest)}</td><td>${formatCurrency(row.totalInvested)}</td><td>${formatCurrency(row.balance)}</td>`;
        tbody.appendChild(tr);
    });
}
