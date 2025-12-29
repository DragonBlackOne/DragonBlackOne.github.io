/**
 * 🚀 Super Calculadora 2.0 - Core
 */

import { initTabs } from './modules/tabs.js';
import { initCalculator } from './modules/calculator.js';
import { initCurrency } from './modules/currency.js';
import { initInterest } from './modules/interest.js';
import { initFinancing } from './modules/financing.js';
import { initFire } from './modules/fire.js';
import { initSalary } from './modules/salary.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('⚡ Super Calculadora Initializing...');

    // Core Systems
    initTabs();

    // Tools
    initCalculator();
    initCurrency();
    initInterest();
    initFinancing();
    initFire();
    initSalary();

    // PWA Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(() => console.log('✅ Service Worker Registered'))
            .catch(err => console.log('❌ SW Registration Failed:', err));
    }
});
