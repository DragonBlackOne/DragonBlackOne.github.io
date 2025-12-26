/**
 * 📏 Units Module
 * Gerencia conversões de comprimento, massa, temperatura, área e volume
 */

const UNIT_DATA = {
    length: {
        units: { 'm': 1, 'km': 1000, 'cm': 0.01, 'mm': 0.001, 'mi': 1609.34, 'ft': 0.3048, 'in': 0.0254 },
        labels: { 'm': 'Metros (m)', 'km': 'Quilômetros (km)', 'cm': 'Centímetros (cm)', 'mm': 'Milímetros (mm)', 'mi': 'Milhas (mi)', 'ft': 'Pés (ft)', 'in': 'Polegadas (in)' }
    },
    mass: {
        units: { 'kg': 1, 'g': 0.001, 'mg': 0.000001, 'lb': 0.453592, 'oz': 0.0283495, 't': 1000 },
        labels: { 'kg': 'Quilogramas (kg)', 'g': 'Gramas (g)', 'mg': 'Miligramas (mg)', 'lb': 'Libras (lb)', 'oz': 'Onças (oz)', 't': 'Toneladas (t)' }
    },
    area: {
        units: { 'm2': 1, 'km2': 1000000, 'ha': 10000, 'ac': 4046.86, 'ft2': 0.092903 },
        labels: { 'm2': 'Metros² (m²)', 'km2': 'Quilômetros² (km²)', 'ha': 'Hectares (ha)', 'ac': 'Acres (ac)', 'ft2': 'Pés² (ft²)' }
    },
    volume: {
        units: { 'l': 1, 'ml': 0.001, 'm3': 1000, 'gal': 3.78541, 'qt': 0.946353 },
        labels: { 'l': 'Litros (L)', 'ml': 'Mililitros (ml)', 'm3': 'Metros cúbicos (m³)', 'gal': 'Galões (gal)', 'qt': 'Quartos (qt)' }
    },
    temperature: {
        units: { 'c': 'C', 'f': 'F', 'k': 'K' },
        labels: { 'c': 'Celsius (°C)', 'f': 'Fahrenheit (°F)', 'k': 'Kelvin (K)' }
    }
};

export function initUnitConverter() {
    const categorySelect = document.getElementById('unit-category');
    const fromSelect = document.getElementById('unit-from-select');
    const toSelect = document.getElementById('unit-to-select');
    const fromInput = document.getElementById('unit-from-value');
    const toInput = document.getElementById('unit-to-value');

    if (!categorySelect) return;

    categorySelect.addEventListener('change', () => {
        populateUnits(categorySelect.value);
        convert();
    });

    fromSelect.addEventListener('change', convert);
    toSelect.addEventListener('change', convert);
    fromInput.addEventListener('input', convert);

    // Inicialização
    populateUnits('length');
}

function populateUnits(category) {
    const fromSelect = document.getElementById('unit-from-select');
    const toSelect = document.getElementById('unit-to-select');
    const data = UNIT_DATA[category];

    const options = Object.keys(data.units).map(key =>
        `<option value="${key}">${data.labels[key]}</option>`
    ).join('');

    fromSelect.innerHTML = options;
    toSelect.innerHTML = options;

    // Selecionar unidades diferentes por padrão
    if (toSelect.options.length > 1) toSelect.selectedIndex = 1;
}

function convert() {
    const category = document.getElementById('unit-category').value;
    const fromUnit = document.getElementById('unit-from-select').value;
    const toUnit = document.getElementById('unit-to-select').value;
    const fromValue = parseFloat(document.getElementById('unit-from-value').value) || 0;
    const toInput = document.getElementById('unit-to-value');

    if (category === 'temperature') {
        toInput.value = convertTemperature(fromValue, fromUnit, toUnit).toFixed(2);
    } else {
        const factorFrom = UNIT_DATA[category].units[fromUnit];
        const factorTo = UNIT_DATA[category].units[toUnit];
        const result = (fromValue * factorFrom) / factorTo;
        toInput.value = result % 1 === 0 ? result : result.toFixed(4);
    }
}

function convertTemperature(value, from, to) {
    let celsius;
    if (from === 'c') celsius = value;
    else if (from === 'f') celsius = (value - 32) * 5 / 9;
    else if (from === 'k') celsius = value - 273.15;

    if (to === 'c') return celsius;
    else if (to === 'f') return (celsius * 9 / 5) + 32;
    else if (to === 'k') return celsius + 273.15;
    return value;
}
