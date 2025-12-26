/**
 * 📅 Date Module
 * Calculadora de diferença e manipulação de datas
 */

export function initDateCalculator() {
    const startInput = document.getElementById('date-start');
    const endInput = document.getElementById('date-end');
    const modeDiff = document.getElementById('date-mode-diff');
    const modeAdd = document.getElementById('date-mode-add');

    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    if (startInput) startInput.value = today;
    if (endInput) endInput.value = today;
    document.getElementById('date-base').value = today;

    // Toggle Modes
    modeDiff.addEventListener('click', () => {
        modeDiff.classList.add('active');
        modeAdd.classList.remove('active');
        document.getElementById('date-diff-container').style.display = 'block';
        document.getElementById('date-add-container').style.display = 'none';
        document.getElementById('date-res-label').textContent = 'Diferença';
        calculateDiff();
    });

    modeAdd.addEventListener('click', () => {
        modeAdd.classList.add('active');
        modeDiff.classList.remove('active');
        document.getElementById('date-diff-container').style.display = 'none';
        document.getElementById('date-add-container').style.display = 'block';
        document.getElementById('date-res-label').textContent = 'Nova Data';
        calculateAdd();
    });

    // Listeners
    [startInput, endInput].forEach(el => el.addEventListener('change', calculateDiff));
    ['date-base', 'date-add-days', 'date-add-months'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculateAdd);
    });

    calculateDiff(); // Initial run
}

function calculateDiff() {
    const start = new Date(document.getElementById('date-start').value);
    const end = new Date(document.getElementById('date-end').value);

    if (isNaN(start) || isNaN(end)) return;

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    document.getElementById('date-res-value').textContent = `${diffDays} dias`;
}

function calculateAdd() {
    const base = new Date(document.getElementById('date-base').value);
    const days = parseInt(document.getElementById('date-add-days').value) || 0;
    const months = parseInt(document.getElementById('date-add-months').value) || 0;

    if (isNaN(base)) return;

    const result = new Date(base);
    result.setDate(result.getDate() + days);
    result.setMonth(result.getMonth() + months);

    document.getElementById('date-res-value').textContent = result.toLocaleDateString();
}
