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
