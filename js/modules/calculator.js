/**
 * Standard Calculator Module
 * With History Tape
 */

export function initCalculator() {
    const display = document.getElementById('calc-display');
    const buttons = document.querySelectorAll('.calc-btn');
    const historyList = document.getElementById('calc-history-list');
    const clearHistoryBtn = document.getElementById('btn-clear-history');

    let currentInput = '0';
    let clean = true;
    let history = [];

    if (!display) return;

    const renderHistory = () => {
        if (history.length === 0) {
            historyList.innerHTML = '<p style="opacity:0.5; font-size:0.8rem;">Nenhum cálculo...</p>';
            return;
        }
        historyList.innerHTML = history.map(item => `
            <div style="margin-bottom:0.5rem; border-bottom:1px dashed rgba(255,255,255,0.05); padding-bottom:0.2rem;">
                <div style="opacity:0.7;">${item.expr} =</div>
                <div style="color:var(--secondary); font-weight:bold;">${item.res}</div>
            </div>
        `).join('');
        historyList.scrollTop = historyList.scrollHeight;
    };

    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            history = [];
            renderHistory();
        });
    }

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
                    const expression = currentInput;
                    const result = String(eval(currentInput.replace(/[^-()\d/*+.]/g, '')));

                    // Add to history
                    if (expression !== result) {
                        history.push({ expr: expression, res: result });
                        if (history.length > 20) history.shift(); // Keep last 20
                        renderHistory();
                    }

                    currentInput = result;
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
