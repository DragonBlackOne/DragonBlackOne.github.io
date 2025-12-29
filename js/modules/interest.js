/**
 * 📈 Interest Module
 * Cálculo de Juros Simples e Compostos com Projeção e IR
 */

import { formatCurrency, parseCurrency } from './utils.js';
import { getTranslation } from './i18n.js';
import { playSuccess } from './audio.js';
import { launchConfetti } from './confetti.js';
import { saveSimulation } from './sharing.js';

let growthChart = null;
let lastBreakdownData = null;

export function initInterestCalculator() {
    const form = document.getElementById('interest-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        calculateInterest();
    });

    // Toggle Juros Simples/Compostos
    const typeBtns = document.querySelectorAll('#panel-interest .type-btn');
    typeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            typeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Toggle Taxa Mensal/Anual
    const rateBtns = document.querySelectorAll('#panel-interest .rate-btn');
    rateBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            rateBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Toggle Período Meses/Anos
    const periodBtns = document.querySelectorAll('#panel-interest .period-btn');
    periodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            periodBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Formatação automática para campos de juros
    ['initial-value', 'monthly-contribution'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', function () {
                formatCurrencyInput(this);
            });
        }
    });
}

function formatCurrencyInput(input) {
    let value = input.value.replace(/\D/g, '');
    if (value === '') return;
    value = (parseInt(value) / 100).toFixed(2).replace('.', ',');
    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    input.value = value;
}

function calculateInterest() {
    const initialValue = parseCurrency(document.getElementById('initial-value').value);
    const monthlyContribution = parseCurrency(document.getElementById('monthly-contribution').value);
    const interestRateInput = document.getElementById('interest-rate-input').value;
    const periodInput = parseInt(document.getElementById('period-input').value);

    if (isNaN(initialValue) || !interestRateInput || isNaN(periodInput)) {
        alert(getTranslation('fill_correctly'));
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
    let netBalance = finalData.balance;
    let interestEarned = finalData.balance - finalData.totalInvested;

    // Simulate IR (Regressive Income Tax)
    const includeIR = document.getElementById('include-ir')?.checked;
    if (includeIR) {
        if (interestEarned > 0) {
            let taxRate = 0.15;
            if (months <= 6) taxRate = 0.225;
            else if (months <= 12) taxRate = 0.20;
            else if (months <= 24) taxRate = 0.175;

            const taxAmount = interestEarned * taxRate;
            netBalance = finalData.balance - taxAmount;
            interestEarned = interestEarned - taxAmount;
        }
    }

    const totalInvested = finalData.totalInvested;
    const totalReturn = ((netBalance / totalInvested) - 1) * 100;

    document.getElementById('final-amount').textContent = formatCurrency(netBalance);
    document.getElementById('total-invested').textContent = formatCurrency(totalInvested);
    document.getElementById('interest-earned').textContent = formatCurrency(interestEarned);
    document.getElementById('total-return').textContent = totalReturn.toFixed(2).replace('.', ',') + '%';

    document.getElementById('results-card').classList.add('active');
    updateChart(data);
    updateBreakdownTable(data);

    document.getElementById('aria-announce').textContent = `${getTranslation('calc_interest_done')}. ${getTranslation('net_worth')}: ${formatCurrency(netBalance)}`;

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
                label: getTranslation('invested_total'),
                data: data.map(d => d.totalInvested),
                borderColor: 'hsl(170, 100%, 50%)',
                backgroundColor: 'hsla(170, 100%, 50%, 0.1)',
                fill: true, tension: 0.4, pointRadius: 0
            }, {
                label: getTranslation('net_worth'),
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
