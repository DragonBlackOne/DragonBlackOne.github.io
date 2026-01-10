document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('calculate-btn');
    const resultBox = document.getElementById('result');
    const resInvested = document.getElementById('res-invested');
    const resInterest = document.getElementById('res-interest');
    const resTotal = document.getElementById('res-total');

    let growthChart = null;

    function formatCurrency(value) {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    btn.addEventListener('click', () => {
        // Inputs
        const initial = parseFloat(document.getElementById('initial').value) || 0;
        const monthly = parseFloat(document.getElementById('monthly').value) || 0;
        const rateYearly = parseFloat(document.getElementById('rate').value) || 0;
        const years = parseFloat(document.getElementById('years').value) || 0;

        if (years <= 0 && initial <= 0 && monthly <= 0) {
            alert("Por favor, preencha os valores para calcular.");
            return;
        }

        // Logic: Effective Annual Rate (Brazil Standard) -> Monthly
        // Formula: (1+r)^(1/12) - 1
        const rateMonthly = Math.pow(1 + (rateYearly / 100), 1 / 12) - 1;
        const totalMonths = years * 12;

        let total = initial;
        let invested = initial;

        // Data for Chart
        const labels = [];
        const dataTotal = [];
        const dataInvested = [];

        // Initial Point (Year 0)
        labels.push(0);
        dataTotal.push(initial);
        dataInvested.push(initial);

        // Initial table clear
        const tableBody = document.getElementById('table-body');
        tableBody.innerHTML = ''; // Clear previous

        // Iteration
        for (let m = 1; m <= totalMonths; m++) {
            total = total * (1 + rateMonthly); // Interest on existing balance

            // Calculate monthly interest just for display
            const monthlyInterest = total - (invested + (monthly * (m > 1 ? 0 : 0))); // Simplified approximation effectively treated below

            total += monthly;                  // Add new deposit at end of period
            invested += monthly;

            // Snapshot every year for the chart (or final month)
            if (m % 12 === 0) {
                labels.push(m / 12);
                dataTotal.push(total);
                dataInvested.push(invested);
            }

            // Table Row Data
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${m}</td>
                <td style="color:var(--success)">${formatCurrency(total - invested)}</td>
                <td>${formatCurrency(invested)}</td>
                <td><strong>${formatCurrency(total)}</strong></td>
            `;
            tableBody.appendChild(row);
        }

        const interest = total - invested;

        // Render Text
        resInvested.textContent = formatCurrency(invested);
        resInterest.textContent = formatCurrency(interest);
        resTotal.textContent = formatCurrency(total);

        // Show Container
        resultBox.classList.remove('hidden');
        void resultBox.offsetWidth;
        resultBox.classList.add('show');

        // Render Chart
        updateChart(labels, dataInvested, dataTotal);
    });

    function updateChart(labels, dataInvested, dataTotal) {
        const ctx = document.getElementById('growthChart').getContext('2d');

        if (growthChart) {
            growthChart.destroy();
        }

        growthChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Total Acumulado',
                        data: dataTotal,
                        borderColor: '#3b82f6', // Primary Blue
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Total Investido',
                        data: dataInvested,
                        borderColor: '#94a3b8', // Gray
                        backgroundColor: 'transparent',
                        borderDash: [5, 5],
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#f8fafc' }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: '#334155' },
                        title: { display: true, text: 'Anos', color: '#94a3b8' }
                    },
                    y: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: '#334155' },
                        title: { display: true, text: 'Valor (R$)', color: '#94a3b8' }
                    }
                }
            }
        });
    }

    // YouTube Latest Video Logic
    // Channel ID: UCd1fYytCxQCd1fptKWH6wCM (@0mortes)
    // Playlist ID for Uploads: UU + ID without UC = UUd1fYytCxQCd1fptKWH6wCM

    const playlistID = 'UUd1fYytCxQCd1fptKWH6wCM';
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistID}`;
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

    const container = document.getElementById('youtube-embed');

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.items && data.items.length > 0) {
                const latestVideo = data.items[0];
                const videoId = latestVideo.guid.split(':')[2];

                const embedHtml = `
                    <iframe 
                        width="100%" 
                        height="315" 
                        src="https://www.youtube.com/embed/${videoId}" 
                        title="YouTube video player" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                `;
                container.innerHTML = embedHtml;
            } else {
                throw new Error("No items found");
            }
        })
        .catch(error => {
            console.error('Erro ao carregar vídeo:', error);
            // Fallback Button
            container.innerHTML = `
                <div style="padding: 2rem; text-align: center;">
                    <p>Não foi possível carregar o vídeo automaticamente.</p>
                    <a href="https://www.youtube.com/@0mortes/featured" target="_blank" 
                       style="background-color: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                       Ver Último Vídeo no YouTube
                    </a>
                </div>
            `;
        });

    // Cookie Consent Logic
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('accept-cookies');

    if (!localStorage.getItem('cookieConsent')) {
        cookieBanner.classList.add('show');
    }

    acceptBtn.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'true');
        cookieBanner.classList.remove('show');
    });
});
