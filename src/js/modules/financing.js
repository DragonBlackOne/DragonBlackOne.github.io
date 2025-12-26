/**
 * 🏢 Financing Module
 * Simula financiamentos bancários pelos sistemas SAC e PRICE
 */

import { formatCurrency, parseCurrency } from './utils.js';

export function initFinancingCalculator() {
    const form = document.getElementById('financing-form');
    if (!form) return;

    // Toggle SAC/PRICE
    const typeSac = document.getElementById('type-sac');
    const typePrice = document.getElementById('type-price');

    if (typeSac && typePrice) {
        typeSac.addEventListener('click', () => {
            typeSac.classList.add('active');
            typePrice.classList.remove('active');
        });
        typePrice.addEventListener('click', () => {
            typePrice.classList.add('active');
            typeSac.classList.remove('active');
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        calculateFinancing();
    });

    // Perda de contexto: exportar
    const exportBtn = document.getElementById('export-financing-csv');
    if (exportBtn) {
        exportBtn.onclick = () => {
            const data = {
                first: document.getElementById('fin-first-parcel').textContent,
                last: document.getElementById('fin-last-parcel').textContent,
                interest: document.getElementById('fin-total-interest').textContent,
                cost: document.getElementById('fin-total-cost').textContent
            };
            if (data.first === 'R$ 0,00') return;

            import('./utils.js').then(utils => {
                const rows = [
                    ["Campo", "Valor"],
                    ["Primeira/Fixa Parcela", data.first],
                    ["Ultima Parcela", data.last],
                    ["Total de Juros", data.interest],
                    ["Custo Total", data.cost]
                ];
                utils.exportToCSV("simulacao_financiamento.csv", rows);
            });
        };
    }

    // Formatação de inputs de moeda
    ['fin-total-value', 'fin-down-payment'].forEach(id => {
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

function calculateFinancing() {
    const totalValue = parseCurrency(document.getElementById('fin-total-value').value);
    const downPayment = parseCurrency(document.getElementById('fin-down-payment').value);
    const annualRate = parseFloat(document.getElementById('fin-interest-rate').value.replace(',', '.')) / 100;
    const years = parseInt(document.getElementById('fin-period').value);

    if (totalValue <= 0 || years <= 0 || annualRate <= 0) {
        alert('Por favor, preencha os dados corretamente.');
        return;
    }

    const principal = totalValue - downPayment;
    const months = years * 12;
    const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;
    const isSac = document.getElementById('type-sac').classList.contains('active');

    let results;
    if (isSac) results = calculateSAC(principal, monthlyRate, months);
    else results = calculatePRICE(principal, monthlyRate, months);

    renderResults(results);
}

function calculateSAC(principal, rate, months) {
    const amortization = principal / months;
    let balance = principal;
    let totalInterest = 0;
    let firstParcel = 0;
    let lastParcel = 0;

    for (let m = 1; m <= months; m++) {
        const interest = balance * rate;
        const parcel = amortization + interest;

        if (m === 1) firstParcel = parcel;
        if (m === months) lastParcel = parcel;

        totalInterest += interest;
        balance -= amortization;
    }

    return { firstParcel, lastParcel, totalInterest, totalCost: principal + totalInterest };
}

function calculatePRICE(principal, rate, months) {
    // Parcela PRICE: P = (PV * i) / (1 - (1 + i)^-n)
    const parcel = (principal * rate) / (1 - Math.pow(1 + rate, -months));
    const totalCost = parcel * months;
    const totalInterest = totalCost - principal;

    return { firstParcel: parcel, lastParcel: parcel, totalInterest, totalCost };
}

function renderResults(res) {
    document.getElementById('fin-first-parcel').textContent = formatCurrency(res.firstParcel);
    document.getElementById('fin-last-parcel').textContent = formatCurrency(res.lastParcel);
    document.getElementById('fin-total-interest').textContent = formatCurrency(res.totalInterest);
    document.getElementById('fin-total-cost').textContent = formatCurrency(res.totalCost);

    document.getElementById('fin-results-card').classList.add('active');

    // Atualiza label caso seja PRICE (mesmo valor)
    const firstLabel = document.getElementById('first-parcel-label');
    const isSac = document.getElementById('type-sac').classList.contains('active');
    firstLabel.textContent = isSac ? 'Primeira Parcela' : 'Parcela Fixa';

    if (window.innerWidth < 992) {
        document.getElementById('fin-results-card').scrollIntoView({ behavior: 'smooth' });
    }
}
