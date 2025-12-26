/**
 * 🔢 Calculator Module
 * Gerencia a lógica da calculadora (em breve científica)
 */

import { parseFormattedNumber } from './utils.js';
import { saveCalcHistory, loadCalcHistory } from './persistence.js';

let calcDisplay = '';
let calcExpression = '';
let calcHistory = loadCalcHistory();
let lastResult = null;

export function initStandardCalculator() {
    renderHistory();
    const buttons = document.querySelectorAll('.calc-btn');
    const sciToggle = document.getElementById('scientific-toggle');
    const panel = document.getElementById('panel-standard');

    // Toggle Modo Científico
    if (sciToggle && panel) {
        sciToggle.addEventListener('click', () => {
            panel.classList.toggle('scientific-mode');
        });
    }

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            const value = btn.dataset.value;

            if (value) appendNumber(value);
            else if (action === 'clear') clearCalc();
            else if (action === 'backspace') backspace();
            else if (action === 'percent') setPercent();
            else if (action === 'decimal') appendDecimal();
            else if (['add', 'subtract', 'multiply', 'divide'].includes(action)) setOperator(action);
            else if (action === 'equals') calculate();
            else if (action) handleScientificAction(action);
        });
    });

    // Suporte Teclado (Expandido)
    document.addEventListener('keydown', (e) => {
        if (document.activeElement.tagName === 'INPUT') return;

        const key = e.key;
        if (/[0-9]/.test(key)) appendNumber(key);
        else if (key === ',') appendDecimal();
        else if (key === '+') setOperator('add');
        else if (key === '-') setOperator('subtract');
        else if (key === '*') setOperator('multiply');
        else if (key === '/') setOperator('divide');
        else if (key === '^') handleScientificAction('pow');
        else if (key === '(') handleScientificAction('open-paren');
        else if (key === ')') handleScientificAction('close-paren');
        else if (key === 'Enter' || key === '=') calculate();
        else if (key === 'Escape') clearCalc();
        else if (key === 'Backspace') backspace();
    });
}

/**
 * Lida com funçoes científicas
 */
function handleScientificAction(action) {
    const sciActions = {
        'sin': 'sin(', 'cos': 'cos(', 'tan': 'tan(',
        'log': 'log(', 'ln': 'ln(', 'pi': 'π', 'e': 'e',
        'pow': '^', 'sqrt': '√(', 'open-paren': '(', 'close-paren': ')',
        'rand': 'rnd'
    };

    if (sciActions[action]) {
        if (action === 'rand') {
            calcDisplay = Math.random().toFixed(4).replace('.', ',');
        } else {
            calcDisplay += sciActions[action];
        }
        updateCalcDisplay();
    }
}

function updateCalcDisplay() {
    const expressionEl = document.getElementById('calc-expression');
    const resultEl = document.getElementById('calc-result');

    if (expressionEl) expressionEl.textContent = calcExpression;
    if (resultEl) resultEl.textContent = calcDisplay || '0';
}

function appendNumber(number) {
    if (number === '0' && calcDisplay === '0') return;
    if (calcDisplay === '0' && number !== '0') calcDisplay = number;
    else calcDisplay += number;
    updateCalcDisplay();
}

function appendDecimal() {
    if (calcDisplay.includes(',')) return;
    if (calcDisplay === '' || calcDisplay === '0') calcDisplay = '0,';
    else calcDisplay += ',';
    updateCalcDisplay();
}

function clearCalc() {
    calcDisplay = '';
    calcExpression = '';
    lastResult = null;
    updateCalcDisplay();
}

function backspace() {
    calcDisplay = calcDisplay.slice(0, -1);
    updateCalcDisplay();
}

function setPercent() {
    if (calcDisplay === '') return;
    const value = parseFormattedNumber(calcDisplay);
    calcDisplay = (value / 100).toString().replace('.', ',');
    updateCalcDisplay();
}

function setOperator(operator) {
    if (calcDisplay === '' && lastResult !== null) {
        calcDisplay = lastResult.toString().replace('.', ',');
    }
    if (calcDisplay === '') return;

    const opSymbols = { add: '+', subtract: '-', multiply: '×', divide: '÷' };
    calcExpression = `${calcDisplay} ${opSymbols[operator]} `;
    lastResult = parseFormattedNumber(calcDisplay);
    calcDisplay = '';
    updateCalcDisplay();
}

function calculate() {
    let expression = calcExpression + calcDisplay;
    if (!expression) return;

    try {
        // Sanitizar e preparar para eval seguro (apenas para fins de POC matemática)
        let evalExpr = expression
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/,/g, '.')
            .replace(/π/g, 'Math.PI')
            .replace(/e/g, 'Math.E')
            .replace(/sin\(/g, 'Math.sin(')
            .replace(/cos\(/g, 'Math.cos(')
            .replace(/tan\(/g, 'Math.tan(')
            .replace(/log\(/g, 'Math.log10(')
            .replace(/ln\(/g, 'Math.log(')
            .replace(/√\(/g, 'Math.sqrt(')
            .replace(/\^/g, '**');

        const result = eval(evalExpr);

        if (isNaN(result) || !isFinite(result)) throw new Error('Inválido');

        const fullExpr = `${expression} =`;
        addToHistory(fullExpr, formatValue(result));

        calcExpression = '';
        calcDisplay = formatValue(result);
        lastResult = result;
    } catch (error) {
        calcDisplay = 'Erro';
    }
    updateCalcDisplay();
}

function formatValue(val) {
    return val.toString().replace('.', ',');
}

function addToHistory(expression, result) {
    calcHistory.unshift({ expression, result });
    if (calcHistory.length > 20) calcHistory.pop();
    saveCalcHistory(calcHistory);
    renderHistory();
}

function renderHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;

    historyList.innerHTML = calcHistory.map((item, index) => `
        <div class="history-item" data-index="${index}" title="Clique para recuperar">
            <div class="history-expression">${item.expression}</div>
            <div class="history-result">${item.result}</div>
        </div>
    `).join('');

    historyList.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => {
            const index = item.dataset.index;
            const entry = calcHistory[index];
            calcDisplay = entry.result;
            updateCalcDisplay();
        });
    });
}
