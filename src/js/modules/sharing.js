/**
 * 🔗 Sharing Module
 * Serializa o estado da calculadora na URL
 */

export function initSharing() {
    const shareBtn = document.getElementById('global-share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', generateShareLink);
    }

    // Check if there is state in URL on load
    loadStateFromURL();
}

function generateShareLink() {
    const activeTab = document.querySelector('.nav-tab.active').dataset.tab;
    const params = new URLSearchParams();
    params.set('tab', activeTab);

    // Captura inputs específicos dependendo da aba
    if (activeTab === 'financing') {
        params.set('val', document.getElementById('fin-total-value').value);
        params.set('down', document.getElementById('fin-down-payment').value);
        params.set('rate', document.getElementById('fin-interest-rate').value);
        params.set('period', document.getElementById('fin-period').value);
    } else if (activeTab === 'interest') {
        params.set('init', document.getElementById('initial-value').value);
        params.set('monthly', document.getElementById('monthly-contribution').value);
        params.set('rate', document.getElementById('interest-rate').value);
        params.set('period', document.getElementById('period').value);
    }

    const newURL = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

    // Copiar para o clipboard
    navigator.clipboard.writeText(newURL).then(() => {
        alert('Link de compartilhamento copiado!');
    });
}

function loadStateFromURL() {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');

    if (tab) {
        const tabBtn = document.querySelector(`.nav-tab[data-tab="${tab}"]`);
        if (tabBtn) tabBtn.click();

        if (tab === 'financing') {
            if (params.get('val')) document.getElementById('fin-total-value').value = params.get('val');
            if (params.get('down')) document.getElementById('fin-down-payment').value = params.get('down');
            if (params.get('rate')) document.getElementById('fin-interest-rate').value = params.get('rate');
            if (params.get('period')) document.getElementById('fin-period').value = params.get('period');
        }
        // Adicionar outros conforme necessário
    }
}
