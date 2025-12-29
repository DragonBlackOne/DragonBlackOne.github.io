/**
 * 💼 Salary Module
 * Comparativo CLT vs PJ com tabelas de INSS/IRRF (Brasil 2024/2025)
 */

import { formatCurrency, parseCurrency } from './utils.js';
import { getTranslation } from './i18n.js';

export function initSalaryCalculator() {
    const cltBtn = document.getElementById('salary-type-clt');
    const pjBtn = document.getElementById('salary-type-pj');
    const cltContainer = document.getElementById('clt-container');
    const pjContainer = document.getElementById('pj-container');
    const calcBtn = document.getElementById('btn-calc-salary');

    if (!cltBtn || !pjBtn) return;

    cltBtn.addEventListener('click', () => {
        cltBtn.classList.add('active');
        pjBtn.classList.remove('active');
        cltContainer.style.display = 'block';
        pjContainer.style.display = 'none';
    });

    pjBtn.addEventListener('click', () => {
        pjBtn.classList.add('active');
        cltBtn.classList.remove('active');
        cltContainer.style.display = 'none';
        pjContainer.style.display = 'block';
    });

    calcBtn.addEventListener('click', calculateSalary);

    // Formatação
    ['clt-gross', 'pj-gross'].forEach(id => {
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

function calculateSalary() {
    const isCLT = document.getElementById('salary-type-clt').classList.contains('active');

    if (isCLT) {
        const gross = parseCurrency(document.getElementById('clt-gross').value);
        if (gross <= 0) return;

        const inss = calculateINSS(gross);
        const irrf = calculateIRRF(gross - inss);
        const net = gross - inss - irrf;

        updateResults(net, inss + irrf);
    } else {
        const gross = parseCurrency(document.getElementById('pj-gross').value);
        if (gross <= 0) return;

        // Aproximação Simples Nacional (Anexo III - 6% média)
        const taxRate = 0.06;
        const tax = gross * taxRate;
        const net = gross - tax;

        updateResults(net, tax);
    }
}

function calculateINSS(salary) {
    // Tabela INSS 2024
    if (salary <= 1412.00) return salary * 0.075;
    if (salary <= 2666.68) return (salary - 1412) * 0.09 + 105.90;
    if (salary <= 4000.03) return (salary - 2666.68) * 0.12 + 105.90 + 112.92;
    if (salary <= 7786.02) return (salary - 4000.03) * 0.14 + 105.90 + 112.92 + 160.00;
    return 908.85; // Teto
}

function calculateIRRF(base) {
    // Tabela IRRF 2024 (Simplificada)
    if (base <= 2259.20) return 0;
    if (base <= 2826.65) return (base * 0.075) - 169.44;
    if (base <= 3751.05) return (base * 0.15) - 381.44;
    if (base <= 4664.68) return (base * 0.225) - 662.77;
    return (base * 0.275) - 896.00;
}

function updateResults(net, totalDiscounts) {
    document.getElementById('salary-net-value').textContent = formatCurrency(net);
    document.getElementById('salary-discounts').textContent = formatCurrency(totalDiscounts);
}
