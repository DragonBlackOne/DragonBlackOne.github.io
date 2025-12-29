import { getTranslation } from './i18n.js';

export function initDateCalculator() {
    const startInput = document.getElementById('date-start');
    const endInput = document.getElementById('date-end');
    const modeDiff = document.getElementById('date-mode-diff');
    const modeAdd = document.getElementById('date-mode-add');

    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    if (startInput) startInput.value = today;
    if (endInput) endInput.value = today;
    const baseInput = document.getElementById('date-base');
    if (baseInput) baseInput.value = today;

    // Toggle Modes
    modeDiff.addEventListener('click', () => {
        modeDiff.classList.add('active');
        modeAdd.classList.remove('active');
        document.getElementById('date-diff-container').style.display = 'block';
        document.getElementById('date-add-container').style.display = 'none';
        document.getElementById('date-res-label').textContent = getTranslation('diff');
        calculateDiff();
    });

    modeAdd.addEventListener('click', () => {
        modeAdd.classList.add('active');
        modeDiff.classList.remove('active');
        document.getElementById('date-diff-container').style.display = 'none';
        document.getElementById('date-add-container').style.display = 'block';
        document.getElementById('date-res-label').textContent = getTranslation('result_date');
        calculateAdd();
    });

    // Listeners
    if (startInput) startInput.addEventListener('change', calculateDiff);
    if (endInput) endInput.addEventListener('change', calculateDiff);

    ['date-base', 'date-add-days', 'date-add-months'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', calculateAdd);
    });

    calculateDiff(); // Initial run
}

function calculateDiff() {
    const startVal = document.getElementById('date-start').value;
    const endVal = document.getElementById('date-end').value;
    if (!startVal || !endVal) return;

    const start = new Date(startVal);
    const end = new Date(endVal);

    if (isNaN(start) || isNaN(end)) return;

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    document.getElementById('date-res-value').textContent = `${diffDays} ${getTranslation('days')}`;
}

function calculateAdd() {
    const baseVal = document.getElementById('date-base').value;
    if (!baseVal) return;

    const base = new Date(baseVal);
    const days = parseInt(document.getElementById('date-add-days').value) || 0;
    const months = parseInt(document.getElementById('date-add-months').value) || 0;

    if (isNaN(base)) return;

    const result = new Date(base);
    result.setDate(result.getDate() + days);
    result.setMonth(result.getMonth() + months);

    document.getElementById('date-res-value').textContent = result.toLocaleDateString();
}
