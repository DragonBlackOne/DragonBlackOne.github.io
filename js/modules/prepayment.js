/**
 * 💰 Prepayment Module
 * Calcula a economia de juros e redução de prazo em financiamentos
 */

import { formatCurrency, parseCurrency } from './utils.js';
import { getTranslation } from './i18n.js';
import { playSuccess } from './audio.js';
import { launchConfetti } from './confetti.js';

export function initPrepaymentCalculator() {
    const form = document.getElementById('prepayment-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        calculatePrepayment();
    });

    ['prep-balance', 'prep-extra'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', function () {
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

function calculatePrepayment() {
    const balance = parseCurrency(document.getElementById('prep-balance').value);
    const monthlyRate = parseFloat(document.getElementById('prep-rate').value.replace(',', '.')) / 100;
    const extra = parseCurrency(document.getElementById('prep-extra').value);

    if (balance <= 0 || monthlyRate <= 0 || extra <= 0) {
        alert(getTranslation('fill_correctly'));
        return;
    }

    // Lógica Simplificada de Economia (Amortização Direta no Saldo)
    // Ao pagar 'extra' hoje, você deixa de pagar os juros compostos que esse valor geraria até o fim.
    // Para simplificar para o usuário, assumimos um prazo médio de 10 anos (120 meses) se não informado,
    // ou apenas calculamos o juro economizado no 'longo prazo'.

    // Estimativa Conservadora: Consideramos que esse valor extra "compra" meses do futuro.
    // Juro economizado = extra * (1 + rate)^prazo_estimado - extra
    // Mas uma abordagem mais realista para o usuário é: 
    // "Quanto juros esse valor extra NÃO vai acumular se ele for removido do saldo agora?"

    // Estimativa de meses reduzidos: extra / (amortização mensal média)
    // Amortização mensal média em PRICE num financiamento de 20 anos é aprox 0.5% do saldo.
    const estimatedAmortization = balance * 0.005;
    const monthsReduced = Math.round(extra / Math.max(1, estimatedAmortization));

    // Economia de Juros: Valor Extra * Taxa * Meses Reduzidos (Aproximação Linear)
    const interestSaved = extra * monthlyRate * monthsReduced;

    document.getElementById('prep-saved-value').textContent = formatCurrency(interestSaved);
    document.getElementById('prep-reduced-months').textContent = monthsReduced;

    document.getElementById('prepayment-results-card').classList.add('active');

    playSuccess();
    launchConfetti();
}
