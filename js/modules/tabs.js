/**
 * 🚀 Tab Navigation Module
 * Gerencia a navegação por abas e acessibilidade ARIA
 */

export function initTabNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    const panels = document.querySelectorAll('.calc-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;

            // Remove active e atualiza ARIA de todas as abas e painéis
            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            panels.forEach(p => p.classList.remove('active'));

            // Adiciona active e atualiza ARIA na aba clicada e painel correspondente
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            const targetPanel = document.getElementById(`panel-${targetTab}`);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
}
