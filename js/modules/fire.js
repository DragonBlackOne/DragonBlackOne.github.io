/**
 * 🔥 FIRE Module
 * Financial Independence, Retire Early - Calcula o montante necessário para viver de renda
 */

import { formatCurrency, parseCurrency } from './utils.js';
import { playSuccess } from './audio.js';
import { launchConfetti } from './confetti.js';
import { getTranslation } from './i18n.js';

let fireChart = null;

export function initFireCalculator() {
    const form = document.getElementById('fire-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        calculateFIRE();
    });

    // Formatação automática
    ['fire-monthly-spend', 'fire-current-wealth', 'fire-monthly-invest'].forEach(id => {
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

function calculateFIRE() {
    const monthlySpend = parseCurrency(document.getElementById('fire-monthly-spend').value);
    const currentWealth = parseCurrency(document.getElementById('fire-current-wealth').value);
    const monthlyInvest = parseCurrency(document.getElementById('fire-monthly-invest').value);
    const realReturnInput = document.getElementById('fire-real-return').value.replace(',', '.');
    const realReturnAnnual = parseFloat(realReturnInput) / 100;

    if (monthlySpend <= 0 || realReturnAnnual <= 0) {
        alert(getTranslation('fill_correctly'));
        return;
    }

    // Regra dos 4% (ou 12 / taxa real)
    // Montante = Gasto Mensal * 12 / Taxa Real Anual
    const targetAmount = (monthlySpend * 12) / realReturnAnnual;

    // Simulação de tempo para atingir o montante
    let balance = currentWealth;
    let months = 0;
    const monthlyRate = Math.pow(1 + realReturnAnnual, 1 / 12) - 1;
    const chartData = [{ month: 0, balance: currentWealth }];

    if (balance < targetAmount) {
        while (balance < targetAmount && months < 1200) { // Limite de 100 anos
            balance = (balance + monthlyInvest) * (1 + monthlyRate);
            months++;
            if (months % 12 === 0) chartData.push({ month: months / 12, balance });
        }
    }

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    document.getElementById('fire-target-amount').textContent = formatCurrency(targetAmount);
    document.getElementById('time-to-fire').textContent = `${years} ${getTranslation('years_label')} e ${remainingMonths} ${getTranslation('months_label')}`;

    document.getElementById('fire-results-card').classList.add('active');

    playSuccess();
    launchConfetti();
    updateFireChart(chartData, targetAmount);
}

function updateFireChart(data, target) {
    const ctx = document.getElementById('fire-chart');
    if (!ctx || typeof Chart === 'undefined') return;

    if (fireChart) fireChart.destroy();

    fireChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => `${d.month}y`),
            datasets: [{
                label: getTranslation('net_worth'),
                data: data.map(d => d.balance),
                borderColor: 'hsl(15, 100%, 55%)',
                backgroundColor: 'hsla(15, 100%, 55%, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }, {
                label: getTranslation('fire_target_amount'),
                data: Array(data.length).fill(target),
                borderColor: 'hsla(0, 0%, 100%, 0.5)',
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { ticks: { callback: v => formatCurrency(v).split(',')[0] } }
            }
        }
    });
}
