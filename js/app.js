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

        // PWA Service Worker for PWA (with Cache Busting)
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                // Add timestamp to force update check
                navigator.serviceWorker.register('./sw.js?v=' + new Date().getTime())
                    .then(reg => {
                        console.log('SW Registered:', reg.scope);
                        // Force update check
                        reg.update();
                    })
                    .catch(err => console.log('SW Fail:', err));
            });
        }
    });
