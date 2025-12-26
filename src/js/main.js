/**
 * 🧮 Super Calculadora - Entry Point
 * Orquestrador de módulos e inicialização
 */

import { initTabNavigation } from './modules/tabs.js';
import { initStandardCalculator } from './modules/calculator.js';
import { initCurrencyConverter } from './modules/currency.js';
import { initInterestCalculator } from './modules/interest.js';
import { initUnitConverter } from './modules/units.js';
import { initFinancingCalculator } from './modules/financing.js';
import { initDateCalculator } from './modules/dates.js';
import { initQuickTools } from './modules/tools.js';
import { initI18n } from './modules/i18n.js';
import { initSharing } from './modules/sharing.js';
import { playClick } from './modules/audio.js';
import { formatCurrencyInput } from './modules/utils.js';
import { initThemeSystem, createThemeSelector } from './modules/themes.js';

document.addEventListener('DOMContentLoaded', () => {
    // Inicialização de Módulos de Infra
    initThemeSystem();
    createThemeSelector();

    // Inicialização de Ferramentas
    initTabNavigation();
    initStandardCalculator();
    initCurrencyConverter();
    initInterestCalculator();
    initUnitConverter();
    initFinancingCalculator();
    initDateCalculator();
    initQuickTools();
    initI18n();
    initSharing();

    // Global Audio Feedback
    document.addEventListener('click', (e) => {
        if (e.target.closest('button') || e.target.closest('.nav-tab') || e.target.closest('.type-btn')) {
            playClick();
        }
    });

    // Eventos Globais (ex: Formatação de Inputs de Juros)
    const currencyInputs = ['initial-value', 'monthly-contribution'];
    currencyInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', function () {
                formatCurrencyInput(this);
            });
        }
    });

    // Registrar Service Worker para PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => console.log('Service Worker registrado!', reg))
                .catch(err => console.log('Falha ao registrar SW:', err));
        });
    }
});
