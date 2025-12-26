const translations = {
    pt: {
        title: "Super Calculadora",
        calc: "Calculadora",
        currency: "Moedas",
        interest: "Juros",
        units: "Unidades",
        financing: "Financiar",
        dates: "Datas",
        tools: "Úteis",
        scientific_mode: "Modo Científico",
        currency_converter: "Conversor de Moedas",
        amount_label: "Valor para converter",
        from_label: "De",
        to_label: "Para",
        share_title: "Compartilhar Simulação",
        copy_link: "Copiar Link",
        calculate: "Calcular",
        simulate: "Simular",
        days: "dias",
        diff: "Diferença",
        result_date: "Nova Data",
        total_interest: "Total de Juros",
        total_cost: "Custo Total",
        first_parcel: "Primeira Parcela",
        last_parcel: "Última Parcela",
        initial_value: "Valor Inicial",
        monthly_contribution: "Aporte Mensal",
        interest_rate: "Taxa de Juros",
        period: "Período",
        net_worth: "Patrimônio Final",
        invested_total: "Total Investido",
        interest_earned: "Juros Ganhos",
        total_return: "Rentabilidade",
        results_title: "Resultados",
        history: "Histórico",
        interest_type: "Tipo de Juros",
        initial_value_label: "Capital Inicial",
        monthly_contribution_label: "Aporte Mensal",
        interest_rate_label: "Taxa de Juros",
        period_label: "Período",
        exchange_rate: "Taxa de câmbio",
        property_value: "Valor do Bem",
        down_payment: "Entrada",
        financing_summary: "Resumo do Financiamento",
        export_csv: "Exportar para CSV",
        add_subtract: "Adicionar/Subtrair",
        discount: "Desconto",
        tip_split: "Gorjeta / Divisão",
        footer_proof: "Prova de conceito por IA",
        length: "📏 Comprimento",
        mass: "⚖️ Peso / Massa",
        temperature: "🌡️ Temperatura",
        area: "📐 Área",
        volume: "🧪 Volume",
        field: "Campo",
        value: "Valor",
        fixed_parcel: "Parcela Fixa",
        fill_correctly: "Por favor, preencha corretamente.",
        calc_interest_done: "Cálculo de juros concluído",
        investment_summary: "Resumo do Investimento"
    },
    en: {
        title: "Super Calculator",
        calc: "Calculator",
        currency: "Currency",
        interest: "Interest",
        units: "Units",
        financing: "Finance",
        dates: "Dates",
        tools: "Tools",
        scientific_mode: "Scientific Mode",
        currency_converter: "Currency Converter",
        amount_label: "Amount to convert",
        from_label: "From",
        to_label: "To",
        share_title: "Share Simulation",
        copy_link: "Copy Link",
        calculate: "Calculate",
        simulate: "Simulate",
        days: "days",
        diff: "Difference",
        result_date: "New Date",
        total_interest: "Total Interest",
        total_cost: "Total Cost",
        first_parcel: "First Payment",
        last_parcel: "Last Payment",
        initial_value: "Initial Amount",
        monthly_contribution: "Monthly Contribution",
        interest_rate: "Interest Rate",
        period: "Period",
        net_worth: "Final Net Worth",
        invested_total: "Total Invested",
        interest_earned: "Interest Earned",
        total_return: "Yield",
        results_title: "Results",
        history: "History",
        interest_type: "Interest Type",
        initial_value_label: "Initial Capital",
        monthly_contribution_label: "Monthly Contribution",
        interest_rate_label: "Interest Rate",
        period_label: "Period",
        exchange_rate: "Exchange rate",
        property_value: "Property Value",
        down_payment: "Down Payment",
        financing_summary: "Financing Summary",
        export_csv: "Export to CSV",
        add_subtract: "Add/Subtract",
        discount: "Discount",
        tip_split: "Tip / Split",
        footer_proof: "Proof of concept by AI",
        length: "📏 Length",
        mass: "⚖️ Mass",
        temperature: "🌡️ Temperature",
        area: "📐 Area",
        volume: "🧪 Volume",
        field: "Field",
        value: "Value",
        fixed_parcel: "Fixed Payment",
        fill_correctly: "Please fill correctly.",
        calc_interest_done: "Interest calculation completed",
        investment_summary: "Investment Summary"
    },
    es: {
        title: "Súper Calculadora",
        calc: "Calculadora",
        currency: "Monedas",
        interest: "Interés",
        units: "Unidades",
        financing: "Financiar",
        dates: "Fechas",
        tools: "Útiles",
        scientific_mode: "Modo Científico",
        currency_converter: "Conversor de Monedas",
        amount_label: "Cantidad a convertir",
        from_label: "De",
        to_label: "Para",
        share_title: "Compartir Simulación",
        copy_link: "Copiar Enlace",
        calculate: "Calcular",
        simulate: "Simular",
        days: "días",
        diff: "Diferencia",
        result_date: "Nueva Fecha",
        total_interest: "Total Interés",
        total_cost: "Costo Total",
        first_parcel: "Primer Pago",
        last_parcel: "Último Pago",
        initial_value: "Monto Inicial",
        monthly_contribution: "Aporte Mensual",
        interest_rate: "Tasa de Interés",
        period: "Periodo",
        net_worth: "Patrimonio Final",
        invested_total: "Total Invertido",
        interest_earned: "Interés Ganado",
        total_return: "Rentabilidad",
        results_title: "Resultados",
        history: "Historial",
        interest_type: "Tipo de Interés",
        initial_value_label: "Capital Inicial",
        monthly_contribution_label: "Aporte Mensual",
        interest_rate_label: "Tasa de Interés",
        period_label: "Periodo",
        exchange_rate: "Tipo de cambio",
        property_value: "Valor del Bien",
        down_payment: "Enganche",
        financing_summary: "Resumen de Financiación",
        export_csv: "Exportar a CSV",
        add_subtract: "Sumar/Restar",
        discount: "Descuento",
        tip_split: "Propina / División",
        footer_proof: "Prueba de concepto por IA",
        length: "📏 Longitud",
        mass: "⚖️ Masa",
        temperature: "🌡️ Temperatura",
        area: "📐 Área",
        volume: "🧪 Volumen",
        field: "Campo",
        value: "Valor",
        fixed_parcel: "Cuota Fija",
        fill_correctly: "Por favor, complete correctamente.",
        calc_interest_done: "Cálculo de intereses completado",
        investment_summary: "Resumen de Inversión"
    }
};

let currentLang = localStorage.getItem('app-lang') || 'pt';

export function initI18n() {
    applyTranslations();

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            setLanguage(lang);
        });
    });
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('app-lang', lang);
    applyTranslations();

    // Atualiza botões
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
}

export function applyTranslations() {
    const t = translations[currentLang];

    // Busca todos os elementos com data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (t[key]) {
            // Se tiver span interno de ícone, preservamos o span e traduzimos o texto se ele existir em um sub-elemento .nav-text
            const navText = el.querySelector('.nav-text');
            if (navText) {
                navText.textContent = t[key];
            } else {
                el.textContent = t[key];
            }
        }
    });

    // Casos especiais (placeholders, titles)
    const shareBtn = document.getElementById('global-share-btn');
    if (shareBtn) shareBtn.title = t.share_title;
}

export function getTranslation(key) {
    if (!translations[currentLang]) return key;
    return translations[currentLang][key] || key;
}
