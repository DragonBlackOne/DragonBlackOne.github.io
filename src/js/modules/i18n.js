/**
 * 🌐 i18n Module
 * Gerencia traduções e troca de idioma
 */

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
        share_title: "Compartilhar Simulação",
        copy_link: "Copiar Link",
        // ... mais traduções serão adicionadas conforme necessário
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
        share_title: "Share Simulation",
        copy_link: "Copy Link",
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
        share_title: "Compartir Simulación",
        copy_link: "Copiar Enlace",
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

function applyTranslations() {
    const t = translations[currentLang];

    // Traduz abas
    document.querySelector('#tab-standard .nav-text').textContent = t.calc;
    document.querySelector('#tab-currency .nav-text').textContent = t.currency;
    document.querySelector('#tab-interest .nav-text').textContent = t.interest;
    document.querySelector('#tab-units .nav-text').textContent = t.units;
    document.querySelector('#tab-financing .nav-text').textContent = t.financing;
    document.querySelector('#tab-dates .nav-text').textContent = t.dates;
    document.querySelector('#tab-tools .nav-text').textContent = t.tools;

    // Traduz título global
    document.querySelector('.header h1').textContent = t.title;
}

export function getTranslation(key) {
    return translations[currentLang][key] || key;
}
