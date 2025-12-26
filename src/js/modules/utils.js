/**
 * 🛠️ Utils Module
 * Funções de utilidade para formatação e manipulação de DOM
 */

/**
 * Formata um número como moeda BRL
 */
export function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

/**
 * Formata número para percentual
 */
export function formatPercent(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value / 100);
}

/**
 * Formata input de moeda em tempo real
 */
export function formatCurrencyInput(input) {
    let value = input.value.replace(/\D/g, '');
    if (value === '') {
        input.value = '';
        return;
    }
    value = (parseInt(value) / 100).toFixed(2);
    value = value.replace('.', ',');
    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    input.value = value;
}

/**
 * Converte string formatada em número
 */
export function parseFormattedNumber(value) {
    if (!value) return 0;
    return parseFloat(value.toString().replace(/\./g, '').replace(',', '.')) || 0;
}

/**
 * Converte string de moeda (com R$ etc) para número
 */
export function parseCurrency(str) {
    if (!str) return 0;
    return parseFloat(str.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
}

/**
 * Exporta dados para arquivo CSV e dispara download
 */
export function exportToCSV(filename, rows) {
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
        + rows.map(e => e.join(";")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
