/**
 * Tab Navigation Module
 */

export function initTabs() {
    const buttons = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.tool-view');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            console.log('Tab Clicked:', btn.dataset.tab);
            const targetId = btn.dataset.tab;

            // Toggle Buttons
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Toggle Views
            views.forEach(view => {
                if (view.id === `tab-${targetId}`) {
                    view.classList.add('active');
                } else {
                    view.classList.remove('active');
                }
            });
        });
    });
}
