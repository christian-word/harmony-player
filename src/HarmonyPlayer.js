class HarmonyPlayer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.youtubePlayer = null;
    this.currentTimeInterval = null;
    this.isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    this.mediaElement = null;

    // Компактный шаблон (как в вашем оригинале)
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          --primary-color: #007bff;
        }

        .player-container {
          display: flex;
          flex-direction: column;
          gap: 5px;
          padding: 12px;
          background: #f5f5f5;
          border-radius: 10px;
          max-width: 500px;
          margin: 0 auto;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          font-family: Arial, sans-serif;
        }

        .controls-row {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
        }

        .play-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--primary-color);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .progress-container {
          flex-grow: 1;
        }

        /* Единый стиль для всех ползунков */
        input[type="range"] {
          -webkit-appearance: none;
          height: 4px;
          background: #ddd;
          border-radius: 2px;
          cursor: pointer;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          background: var(--primary-color);
          border-radius: 50%;
        }

        .progress-bar {
          width: 100%;
        }

        .time-display {
          font-size: 12px;
          color: #666;
          white-space: nowrap;
          min-width: 85px;
          text-align: center;
        }

        .volume-control {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .volume-bar {
          width: 70px;
        }

        svg {
          width: 18px;
          height: 18px;
          fill: currentColor;
        }

        /* Стили для медиа-контейнеров */
        .media-container {
          display: none;
          margin-bottom: 8px;
        }

        :host([type="video"]) .media-container,
        :host([type="youtube"]) .media-container {
          display: block;
        }

        video, .youtube-container {
          width: 100%;
          border-radius: 6px;
        }

        .youtube-container {
          aspect-ratio: 16/9;
        }

        /* Мобильный оверлей для YouTube */
        .mobile-overlay {
          display: none;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          color: white;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
        }

        :host([type="youtube"]) .mobile-overlay {
          display: ${this.isMobile ? 'flex' : 'none'};
        }
      </style>

      <div class="player-container">
        <div class="media-container">
          <div class="youtube-container"></div>
          <video></video>
          <div class="mobile-overlay">
            <button class="play-btn">►</button>
          </div>
        </div>

        <!-- Компактная строка контролов -->
        <div class="controls-row">
          <button class="play-btn" id="playBtn">
            <svg viewBox="0 0 24 24" id="playIcon">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
          
          <div class="progress-container">
            <input type="range" class="progress-bar" id="progressBar" min="0" max="100" value="0">
          </div>
          
          <span class="time-display" id="timeDisplay">0:00 / 0:00</span>
          
          <div class="volume-control">
            <svg viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
            <input type="range" class="volume-bar" id="volumeBar" min="0" max="100" value="70">
          </div>
        </div>
      </div>
    `;

    // Инициализация элементов управления (как в предыдущей версии)
    this.playBtn = this.shadowRoot.getElementById('playBtn');
    this.playIcon = this.shadowRoot.getElementById('playIcon');
    this.progressBar = this.shadowRoot.getElementById('progressBar');
    this.volumeBar = this.shadowRoot.getElementById('volumeBar');
    this.timeDisplay = this.shadowRoot.getElementById('timeDisplay');
    this.youtubeContainer = this.shadowRoot.querySelector('.youtube-container');
    this.videoElement = this.shadowRoot.querySelector('video');
    this.mobileOverlay = this.shadowRoot.querySelector('.mobile-overlay');
  }

  // ... (остальные методы остаются без изменений из предыдущей рабочей версии) ...
}

customElements.define('harmony-player', HarmonyPlayer);
