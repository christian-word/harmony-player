class HarmonyPlayer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.youtubePlayer = null;
    this.mediaElement = null;

    // Точное повторение вашего оригинального стиля
    this.shadowRoot.innerHTML = `
      <style>
        .player-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 15px;
          background: #f5f5f5;
          border-radius: 15px;
          width: 100%;
          max-width: 500px;
          margin: 20px auto;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .controls-row {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
        }
        
        .play-button {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #007bff;
          color: white;
          cursor: pointer;
          border: none;
          transition: background 0.3s;
        }
        
        .play-button:hover {
          background: #0069d9;
        }
        
        .play-button svg,
        .volume-icon {
          width: 20px;
          height: 20px;
          fill: currentColor;
        }
        
        .progress-container {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        .progress-bar {
          width: 100%;
          height: 4px;
          cursor: pointer;
          -webkit-appearance: none;
          background: #ddd;
          border-radius: 2px;
        }
        
        .progress-bar::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          background: #007bff;
          border-radius: 50%;
        }
        
        .time-info {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #666;
        }
        
        .volume-control {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .volume-slider {
          width: 80px;
          height: 4px;
          -webkit-appearance: none;
          background: #ddd;
          border-radius: 2px;
        }
        
        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          background: #007bff;
          border-radius: 50%;
        }
        
        /* Стили для медиа-контейнера */
        .media-container {
          display: none;
        }
        
        :host([type="video"]) .media-container,
        :host([type="youtube"]) .media-container {
          display: block;
          margin-bottom: 10px;
        }
        
        video, .youtube-container {
          width: 100%;
          border-radius: 8px;
        }
      </style>
      
      <div class="player-container">
        <!-- Медиа-контейнер -->
        <div class="media-container">
          <div class="youtube-container"></div>
          <video></video>
        </div>
        
        <!-- Таймеры (ваш оригинальный вариант сверху) -->
        <div class="time-info">
          <span id="currentTime">0:00</span>
          <span id="duration">0:00</span>
        </div>
        
        <!-- Строка контролов (точное повторение вашего дизайна) -->
        <div class="controls-row">
          <button class="play-button" id="playButton">
            <svg viewBox="0 0 24 24" id="playIcon">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
          
          <div class="progress-container">
            <input type="range" class="progress-bar" id="progressBar" min="0" max="100" value="0">
          </div>
          
          <div class="volume-control">
            <svg class="volume-icon" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
            <input type="range" class="volume-slider" id="volumeSlider" min="0" max="100" value="50">
          </div>
        </div>
      </div>
    `;

    // Инициализация элементов (как в вашем оригинале)
    this.playButton = this.shadowRoot.getElementById('playButton');
    this.playIcon = this.shadowRoot.getElementById('playIcon');
    this.progressBar = this.shadowRoot.getElementById('progressBar');
    this.volumeSlider = this.shadowRoot.getElementById('volumeSlider');
    this.currentTimeEl = this.shadowRoot.getElementById('currentTime');
    this.durationEl = this.shadowRoot.getElementById('duration');
    this.youtubeContainer = this.shadowRoot.querySelector('.youtube-container');
    this.videoElement = this.shadowRoot.querySelector('video');
  }

  // ... (реализация методов остается идентичной предыдущей рабочей версии) ...
}

customElements.define('harmony-player', HarmonyPlayer);
