/*
  Starlight Player Enterprise Module
  Version: 2.0.0 (Enterprise Polish)
  Adapted for ES Module Integration
*/

export function initVideoPlayer() {
    // Only init Starlight Custom Player if the video element exists
    // (If using YouTube Iframe, we skip this to avoid errors)
    if (document.getElementById('video-container') && document.getElementById('main-video')) {
        window.player = new StarlightPlayer();
    }
}

class StarlightPlayer {
    constructor() {
        // --- DOM Elements ---
        this.container = document.getElementById('video-container');
        this.video = document.getElementById('main-video');

        // Controls
        this.playPauseBtn = document.getElementById('play-pause');
        this.progressArea = document.getElementById('progress-area');
        this.progressBar = document.getElementById('progress-bar');
        this.bufferBar = document.getElementById('buffer-bar');

        // Volume
        this.muteBtn = document.getElementById('mute-unmute');
        this.volumeSlider = document.getElementById('volume-slider');

        // Settings & UI
        this.settingsBtn = document.getElementById('settings-btn');
        this.settingsPanel = document.getElementById('unified-settings');
        this.qualityList = document.getElementById('quality-list');
        this.speedSubmenu = document.querySelectorAll('#speed-submenu .submenu-item');

        // Notifications & Toasts
        this.toast = document.getElementById('toast-notification');
        this.toastIcon = this.toast.querySelector('.toast-icon');
        this.toastText = this.toast.querySelector('.toast-text');

        // --- State ---
        this.hls = null;
        this.isDragging = false;
        this.lastScrollTime = 0;
        this.hideTimeout = null;
        this.toastTimeout = null;

        // --- Cached UI Elements (Performance) ---
        this.ui = {
            centerFeedback: document.getElementById('center-icon'),
            centerPlay: document.getElementById('center-play-icon'),
            centerPause: document.getElementById('center-pause-icon'),
            playIcon: document.getElementById('play-icon'),
            pauseIcon: document.getElementById('pause-icon'),
            spinner: document.getElementById('spinner'),
            volumeHigh: document.getElementById('volume-high'),
            volumeMuted: document.getElementById('volume-muted'),
            timeCurrent: document.getElementById('time-current'),
            timeTotal: document.getElementById('time-total'),
            qualityLabel: document.getElementById('current-quality'),
            speedLabel: document.getElementById('current-speed'),
            fullscreenEnter: document.getElementById('enter-fullscreen'),
            fullscreenExit: document.getElementById('exit-fullscreen'),
            menuLoop: document.getElementById('menu-loop')
        };

        // --- Icons (SVG Paths) ---
        this.icons = {
            volume: "M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z",
            speed: "M13 2.05v2.02c3.39.49 6 3.39 6 6.93 0 3.54-2.61 6.44-6 6.93v2.02c4.5-.5 8-4.31 8-8.95S17.5 2.55 13 2.05z",
            quality: "M15 21h-2v-2h2v2zm4-12h-2v2h2V9zM7 21H5v-2h2v2zm4-12H9v2h2V9z",
            check: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
            error: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initHLS();
        this.loadPersistence();
    }

    // --- Media Core ---
    initHLS() {
        const videoSrc = this.video.dataset.src;

        if (window.Hls && Hls.isSupported()) {
            const hlsConfig = {
                debug: false,
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 60,
                maxBufferLength: 30,
                maxMaxBufferLength: 60,
                maxBufferSize: 60 * 1000 * 1000, // 60MB roughly
                fragLoadingTimeOut: 20000,
                fragLoadingMaxRetry: 6,
                fragLoadingRetryDelay: 1000,
                manifestLoadingMaxRetry: 3,
                abrEwmaFastLive: 3,
                abrEwmaSlowLive: 9,
                stretchShortVideoTrack: true,
                nudgeMaxRetry: 5
            };

            this.hls = new Hls(hlsConfig);
            this.hls.loadSource(videoSrc);
            this.hls.attachMedia(this.video);

            // Lifecycle Events
            this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
                this.setupQualityOptions();
                this.applySavedQuality();
            });

            this.hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
                const level = this.hls.levels[data.level];
                const isAuto = this.hls.loadLevel === -1;

                if (isAuto) {
                    this.ui.qualityLabel.innerText = `Automática (${level.height}p)`;
                } else {
                    this.ui.qualityLabel.innerText = `${level.height}p${level.height >= 720 ? ' (HD)' : ''}`;
                }
            });

            // Error Handling Engine
            this.hls.on(Hls.Events.ERROR, (event, data) => this.handleHLSError(data));

        } else if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
            this.video.src = videoSrc;
        }
    }

    handleHLSError(data) {
        if (data.fatal) {
            switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                    console.error("Fatal network error encountered, trying to recover...");
                    this.showToast("Erro de rede. Tentando reconectar...", this.icons.quality);
                    this.hls.startLoad();
                    break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                    console.error("Fatal media error encountered, trying to recover...");
                    this.hls.recoverMediaError();
                    break;
                default:
                    console.error("Unrecoverable fatal error:", data);
                    this.hls.destroy();
                    this.showToast("Erro fatal no player. Por favor, recarregue.", this.icons.error, 'error');
                    break;
            }
        } else {
            if (data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
                this.showSpinner(true);
            }
        }
    }

    // --- UI Logic ---
    togglePlay() {
        if (this.video.paused) {
            this.video.play();
            this.showFeedback('play');
        } else {
            this.video.pause();
            this.showFeedback('pause');
        }
    }

    showFeedback(type) {
        this.ui.centerFeedback.classList.remove('animate');
        void this.ui.centerFeedback.offsetWidth;

        this.ui.centerPlay.style.display = type === 'play' ? 'block' : 'none';
        this.ui.centerPause.style.display = type === 'pause' ? 'block' : 'none';

        this.ui.centerFeedback.classList.add('animate');
    }

    showToast(text, iconPath, type = 'info') {
        this.toastText.innerText = text;
        this.toastIcon.innerHTML = `<svg viewBox="0 0 24 24"><path d="${iconPath}"/></svg>`;

        // State CSS Classes
        this.toast.className = `player-container__toast active ${type}`;

        clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => this.toast.classList.remove('active'), 2500);
    }

    showSpinner(show) {
        if (show) {
            this.ui.spinner.style.display = 'flex';
            this.ui.spinner.setAttribute('aria-hidden', 'false');
        } else {
            this.ui.spinner.style.display = 'none';
            this.ui.spinner.setAttribute('aria-hidden', 'true');
        }
    }

    // --- Event Setup ---
    setupEventListeners() {
        // Playback & Loading
        this.playPauseBtn.addEventListener('click', () => this.togglePlay());
        this.video.addEventListener('click', () => this.togglePlay());

        this.video.addEventListener('play', () => {
            this.ui.playIcon.style.display = 'none';
            this.ui.pauseIcon.style.display = 'block';
            this.startAutoHideControls();
        });

        this.video.addEventListener('pause', () => {
            this.ui.playIcon.style.display = 'block';
            this.ui.pauseIcon.style.display = 'none';
            this.stopAutoHideControls();
        });

        this.video.addEventListener('waiting', () => this.showSpinner(true));
        this.video.addEventListener('playing', () => this.showSpinner(false));
        this.video.addEventListener('canplay', () => this.showSpinner(false));
        this.video.addEventListener('stalled', () => this.showSpinner(true));

        // Advanced Gestures (Double-Click Fullscreen)
        this.video.addEventListener('dblclick', () => this.toggleFullscreen());

        // Volume
        this.volumeSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            this.video.volume = val;
            this.video.muted = val == 0;
            this.updateVolumeUI();
            this.showToast(`Volume: ${Math.round(val * 100)}%`, this.icons.volume);
        });

        this.muteBtn.addEventListener('click', () => {
            this.video.muted = !this.video.muted;
            this.updateVolumeUI();
            this.showToast(this.video.muted ? "Mudo Ativado" : "Mudo Desativado", this.icons.volume, 'info');
        });

        // Progress
        this.video.addEventListener('timeupdate', () => this.updateCurrentProgress());
        this.progressArea.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.scrub(e);
        });
        document.addEventListener('mousemove', (e) => this.isDragging && this.scrub(e));
        document.addEventListener('mouseup', () => this.isDragging = false);

        // Settings
        this.settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = this.settingsPanel.classList.toggle('active');
            this.settingsBtn.setAttribute('aria-expanded', isActive);
            if (!isActive) this.closeAllSubmenus();
        });

        document.querySelectorAll('.settings-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const menuName = item.dataset.menu;
                const submenu = document.getElementById(`${menuName}-submenu`);

                // Switch Views
                document.querySelector('.settings-panel__list').classList.add('hidden');
                submenu.classList.add('active');
                submenu.setAttribute('aria-hidden', 'false');
            });
        });

        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const submenu = btn.closest('.settings-submenu');

                // Switch Views
                submenu.classList.remove('active');
                submenu.setAttribute('aria-hidden', 'true');
                document.querySelector('.settings-panel__list').classList.remove('hidden');
            });
        });

        // Speed
        this.speedSubmenu.forEach(item => {
            item.addEventListener('click', () => {
                const speed = parseFloat(item.dataset.speed);
                this.changeSpeed(speed);
                this.closeAllMenus();
            });
        });

        // Misc Interaction
        document.addEventListener('click', (e) => {
            if (this.container && !this.container.contains(e.target)) {
                this.closeAllMenus();
            }
        });

        this.container.addEventListener('contextmenu', (e) => this.handleContextMenu(e));
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        document.getElementById('fullscreen-btn').addEventListener('click', () => this.toggleFullscreen());
        document.addEventListener('fullscreenchange', () => this.updateFullscreenUI());
        document.getElementById('theater-btn').addEventListener('click', () => this.toggleTheater());
        document.getElementById('pip-btn').addEventListener('click', () => this.togglePiP());
        document.getElementById('share-btn').addEventListener('click', () => this.copyURL());
        document.getElementById('menu-copy').addEventListener('click', () => this.copyURL());
        document.getElementById('menu-copy-time').addEventListener('click', () => this.copyURL(true));
        document.getElementById('menu-loop').addEventListener('click', () => this.toggleLoop());
        document.getElementById('menu-help').addEventListener('click', () => this.toggleHelp());
        document.querySelector('.close-help').addEventListener('click', () => this.toggleHelp());

        this.container.addEventListener('wheel', (e) => {
            if (e.target.closest('.settings-panel')) return; // Ignore wheel on menus

            if (Math.abs(e.deltaY) > 5) {
                e.preventDefault();
                this.adjustVolume(e.deltaY > 0 ? -0.05 : 0.05);
            }
        }, { passive: false });

        this.container.addEventListener('mousemove', () => this.resetAutoHide());
    }

    // --- Actions ---
    toggleFullscreen() {
        if (!document.fullscreenElement) this.container.requestFullscreen();
        else document.exitFullscreen();
    }

    updateFullscreenUI() {
        const isFS = !!document.fullscreenElement;
        this.ui.fullscreenEnter.style.display = isFS ? 'none' : 'block';
        this.ui.fullscreenExit.style.display = isFS ? 'block' : 'none';
        this.showToast(isFS ? "Tela Cheia" : "Sair da Tela Cheia", this.icons.quality);
    }

    toggleTheater() {
        const isTheater = this.container.classList.toggle('theater');
        localStorage.setItem('starlight-theater', isTheater);
    }

    togglePiP() {
        if (document.pictureInPictureElement) document.exitPictureInPicture();
        else if (document.pictureInPictureEnabled) this.video.requestPictureInPicture();
    }

    toggleLoop() {
        this.video.loop = !this.video.loop;
        this.showToast(this.video.loop ? "Loop Ativado" : "Loop Desativado", this.icons.quality);
    }

    toggleHelp() {
        document.getElementById('help-overlay').classList.toggle('active');
    }

    copyURL(withTime = false) {
        let url = window.location.href.split('?')[0];
        if (withTime) url += `?t=${Math.floor(this.video.currentTime)}`;
        navigator.clipboard.writeText(url);
        this.showToast(withTime ? "Link com tempo copiado!" : "Link copiado!", this.icons.quality);
    }

    closeAllMenus() {
        this.settingsPanel.classList.remove('active');
        this.settingsBtn.setAttribute('aria-expanded', 'false');
        this.closeAllSubmenus();
        const ctxMenu = document.getElementById('context-menu');
        if (ctxMenu) ctxMenu.style.display = 'none';

        // Reset View
        document.querySelector('.settings-panel__list').classList.remove('hidden');
    }

    closeAllSubmenus() {
        document.querySelectorAll('.settings-submenu').forEach(sub => {
            sub.classList.remove('active');
            sub.setAttribute('aria-hidden', 'true');
        });
    }

    // --- Handlers ---
    handleContextMenu(e) {
        e.preventDefault();
        const menu = document.getElementById('context-menu');
        if (!menu) return;
        menu.style.left = `${e.clientX}px`;
        menu.style.top = `${e.clientY}px`;
        menu.style.display = 'block';
        menu.setAttribute('aria-hidden', 'false');

        this.ui.menuLoop.innerText = `Loop ${this.video.loop ? '✓' : ''}`;
    }

    handleKeyboardShortcuts(e) {
        if (document.activeElement.tagName === 'INPUT') return;
        // Only trigger if player is visible (check if container has offsetHeight > 0 or similar)
        if (this.container.offsetParent === null) return;

        switch (e.key.toLowerCase()) {
            case ' ':
            case 'k': e.preventDefault(); this.togglePlay(); break;
            case 'f': this.toggleFullscreen(); break;
            case 'm': this.video.muted = !this.video.muted; this.updateVolumeUI(); break;
            case 't': this.toggleTheater(); break;
            case 'p': this.togglePiP(); break;
            case 'arrowright': this.video.currentTime += 5; break;
            case 'arrowleft': this.video.currentTime -= 5; break;
            case 'arrowup': e.preventDefault(); this.adjustVolume(0.1); break;
            case 'arrowdown': e.preventDefault(); this.adjustVolume(-0.1); break;
            case '[': this.adjustSpeed(-0.25); break;
            case ']': this.adjustSpeed(0.25); break;
            case '?': this.toggleHelp(); break;
        }
    }

    adjustVolume(delta) {
        // Fix floating point precision issues (e.g., 0.1 + 0.2 != 0.3)
        let newVol = Math.round((this.video.volume + delta) * 100) / 100;
        this.video.volume = Math.max(0, Math.min(1, newVol));
        this.updateVolumeUI();
        this.showToast(`Volume: ${Math.round(this.video.volume * 100)}%`, this.icons.volume);
    }

    adjustSpeed(delta) {
        const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
        let idx = speeds.indexOf(this.video.playbackRate);
        if (idx === -1) idx = 2;
        const newIdx = Math.max(0, Math.min(speeds.length - 1, idx + (delta > 0 ? 1 : -1)));
        this.changeSpeed(speeds[newIdx]);
    }

    handleWheelQuality(e) {
        if (!this.hls) return;
        const now = Date.now();
        if (now - this.lastScrollTime < 300) return;

        e.preventDefault();
        this.lastScrollTime = now;

        const levels = this.hls.levels;
        let current = this.hls.currentLevel;

        if (e.deltaY < 0) { // Scroll Up
            if (current < levels.length - 1) this.changeQuality(current + 1);
        } else { // Scroll Down
            if (current > -1) this.changeQuality(current - 1);
        }
    }

    // --- Engine ---
    updateCurrentProgress() {
        if (this.isDragging) return;
        const { currentTime, duration } = this.video;
        const percent = (currentTime / duration) * 100 || 0;
        this.progressBar.style.width = `${percent}%`;

        this.ui.timeCurrent.innerText = this.formatTime(currentTime);
        this.ui.timeTotal.innerText = this.formatTime(duration);

        if (this.video.buffered.length > 0) {
            const bufferedEnd = this.video.buffered.end(this.video.buffered.length - 1);
            const bufPercent = (bufferedEnd / duration) * 100;
            this.bufferBar.style.width = `${bufPercent}%`;
        }
    }

    scrub(e) {
        const rect = this.progressArea.getBoundingClientRect();
        let pos = (e.clientX - rect.left) / rect.width;
        pos = Math.max(0, Math.min(1, pos));
        this.video.currentTime = pos * (this.video.duration || 0);
        this.progressBar.style.width = `${pos * 100}%`;
    }

    formatTime(time) {
        if (isNaN(time)) return "00:00";
        let seconds = Math.floor(time % 60);
        let minutes = Math.floor(time / 60) % 60;
        let hours = Math.floor(time / 3600);
        const pad = (num) => num < 10 ? `0${num}` : num;
        return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
    }

    changeSpeed(speed) {
        this.video.playbackRate = speed;
        this.ui.speedLabel.innerText = speed === 1 ? 'Normal' : `${speed}x`;
        localStorage.setItem('starlight-speed', speed);
        this.showToast(`Velocidade: ${speed}x`, this.icons.speed);

        document.querySelectorAll('#speed-submenu .submenu-item').forEach(item => {
            item.classList.toggle('selected', parseFloat(item.dataset.speed) === speed);
        });
    }

    setupQualityOptions() {
        if (!this.hls) return;
        this.qualityList.innerHTML = '';

        // --- Option: Automática (YouTube-style) ---
        const autoItem = document.createElement('div');
        autoItem.className = `submenu-item ${this.hls.loadLevel === -1 ? 'selected' : ''}`;
        autoItem.dataset.quality = '-1';
        autoItem.setAttribute('role', 'menuitem');
        autoItem.innerText = 'Automática';
        autoItem.onclick = (e) => {
            e.stopPropagation();
            this.changeQuality(-1);
        };
        this.qualityList.appendChild(autoItem);

        // --- Quality Levels (Descending Order) ---
        const levelsIndices = this.hls.levels.map((_, idx) => idx).reverse();

        levelsIndices.forEach(index => {
            const level = this.hls.levels[index];
            const div = document.createElement('div');
            div.className = `submenu-item ${this.hls.loadLevel === index ? 'selected' : ''}`;
            div.dataset.quality = index;
            div.setAttribute('role', 'menuitem');

            // Label
            const labelSpan = document.createElement('span');
            labelSpan.innerText = `${level.height}p`;
            div.appendChild(labelSpan);

            // HD Badge
            if (level.height >= 720) {
                const badge = document.createElement('span');
                badge.className = 'quality-badge';
                badge.innerText = level.height >= 2160 ? '4K' : 'HD';
                div.appendChild(badge);
            }

            div.onclick = (e) => {
                e.stopPropagation();
                this.changeQuality(index);
            };
            this.qualityList.appendChild(div);
        });
    }

    changeQuality(index, notify = true) {
        if (!this.hls) return;
        this.hls.currentLevel = index;

        // Update selected class in visual menu
        document.querySelectorAll('#quality-list .submenu-item').forEach(item => {
            item.classList.toggle('selected', parseInt(item.dataset.quality) === index);
        });

        // Simplified logic: Label will be updated by LEVEL_SWITCHED event
        localStorage.setItem('starlight-quality', index);

        if (notify) {
            const label = index === -1 ? 'Automática' : `${this.hls.levels[index].height}p`;
            this.showToast(`Qualidade: ${label}`, this.icons.quality);
        }

        this.closeAllMenus();
    }

    updateVolumeUI() {
        const isMuted = this.video.muted || this.video.volume == 0;
        this.ui.volumeHigh.style.display = isMuted ? 'none' : 'block';
        this.ui.volumeMuted.style.display = isMuted ? 'block' : 'none';
        this.volumeSlider.value = isMuted ? 0 : this.video.volume;
        localStorage.setItem('starlight-volume', this.video.volume);
    }

    // --- Persistence ---
    loadPersistence() {
        // Volume
        const vol = localStorage.getItem('starlight-volume');
        if (vol !== null) { this.video.volume = vol; this.updateVolumeUI(); }

        // Speed
        const speed = localStorage.getItem('starlight-speed');
        if (speed) this.changeSpeed(parseFloat(speed));

        // Theater
        const theater = localStorage.getItem('starlight-theater') === 'true';
        if (theater) this.container.classList.add('theater');

        // Playback Position (Resume)
        const savedTime = localStorage.getItem('starlight-time');
        if (savedTime) {
            this.video.currentTime = parseFloat(savedTime);
            this.showToast("Continuando de onde parou", this.icons.quality);
        }

        // Start Auto-Save Interval
        setInterval(() => {
            if (!this.video.paused) {
                localStorage.setItem('starlight-time', this.video.currentTime);
            }
        }, 5000);
    }

    applySavedQuality() {
        const qual = localStorage.getItem('starlight-quality');
        if (qual !== null) {
            this.changeQuality(parseInt(qual), false);
        } else {
            // Ensure label is "Automática" even if no saved quality
            this.ui.qualityLabel.innerText = 'Automática';
        }
    }

    // --- Auto-hide ---
    resetAutoHide() {
        this.container.classList.remove('hide-controls');
        this.container.classList.add('show-controls');
        this.startAutoHideControls();
    }

    startAutoHideControls() {
        clearTimeout(this.hideTimeout);
        if (!this.video.paused) {
            this.hideTimeout = setTimeout(() => {
                this.container.classList.add('hide-controls');
                this.container.classList.remove('show-controls');
            }, 3000);
        }
    }

    stopAutoHideControls() {
        clearTimeout(this.hideTimeout);
        this.container.classList.add('show-controls');
    }

    destroy() {
        if (this.hls) this.hls.destroy();
    }
}
