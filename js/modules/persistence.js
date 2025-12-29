/**
 * 💾 Persistence Module
 * Gerencia o salvamento do histórico e configurações
 */

import { parseFormattedNumber } from './utils.js';

const STORAGE_KEYS = {
    CALC_HISTORY: 'calc-history',
    CURRENCY_FAVORITES: 'currency-favs'
};

export function saveCalcHistory(history) {
    localStorage.setItem(STORAGE_KEYS.CALC_HISTORY, JSON.stringify(history));
}

export function loadCalcHistory() {
    const data = localStorage.getItem(STORAGE_KEYS.CALC_HISTORY);
    return data ? JSON.parse(data) : [];
}

export function saveSettings(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

export function loadSettings(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}
