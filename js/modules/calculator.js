/**
 * Standard Calculator Module
 */

export function initCalculator() {
    const display = document.getElementById('calc-display');
    const buttons = document.querySelectorAll('.calc-btn');
    let currentInput = '0';
    let clean = true;

    if (!display) return;

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            const value = btn.innerText;

            if (!action) {
                // Number
                if (clean) {
                    currentInput = value;
                    clean = false;
                } else {
                    currentInput += value;
                }
            } else if (action === 'clear') {
                currentInput = '0';
                clean = true;
            } else if (action === 'eval') {
                try {
                    // Safe evaluation
                    currentInput = String(eval(currentInput.replace(/[^-()\d/*+.]/g, '')));
                    clean = true;
                } catch {
                    currentInput = 'Erro';
                    clean = true;
                }
            } else {
                // Operator
                if (!clean || action === 'negative') {
                    currentInput += value;
                    clean = false;
                }
            }

            display.innerText = currentInput;
        });
    });
}
