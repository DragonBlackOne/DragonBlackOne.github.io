/**
 * 🎨 Themes Module
 * Gerencia a troca de temas e persistência da preferência
 */

const THEMES = {
    DARK: 'dark',
    MIDNIGHT: 'midnight',
    EMERALD: 'emerald',
    LIGHT: 'light',
    CONTRAST: 'high-contrast'
};

export function initThemeSystem() {
    const savedTheme = localStorage.getItem('user-theme') || THEMES.DARK;
    applyTheme(savedTheme);
}

export function applyTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('user-theme', themeName);
}

/**
 * Cria o seletor de temas no DOM (ex: no rodapé ou cabeçalho)
 */
export function createThemeSelector() {
    const footer = document.querySelector('.footer');
    if (!footer) return;

    const selector = document.createElement('div');
    selector.className = 'theme-selector';
    selector.innerHTML = `
        <span class="theme-label">Tema:</span>
        <div class="theme-options">
            <button class="theme-btn dark" data-theme="dark" title="Dark (Padrão)"></button>
            <button class="theme-btn midnight" data-theme="midnight" title="Midnight Blue"></button>
            <button class="theme-btn emerald" data-theme="emerald" title="Emerald Green"></button>
            <button class="theme-btn light" data-theme="light" title="Light Mode"></button>
            <button class="theme-btn contrast" data-theme="high-contrast" title="Alto Contraste"></button>
        </div>
    `;

    footer.insertBefore(selector, footer.firstChild);

    selector.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
    });
}
