/**
 * Harmony Player - универсальный медиаплеер (Web Component)
 * Поддержка: аудио, видео, YouTube
 * Лицензия: MIT
 */

class HarmonyPlayer extends HTMLElement {
  constructor() {
    super();
    
    // Инициализация Shadow DOM
    this.attachShadow({ mode: 'open' });
    
    // Основной HTML-шаблон
    this.shadowRoot.innerHTML = `
      <style>
        /* Основные стили плеера */
        .player-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 15px;
          background: #f5f5f5;
          border-radius: 15px;
          max-width: 500px;
          margin: 0 auto;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          font-family: Arial, sans-serif;
        }
        
        .controls-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .play-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #007bff;
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s;
        }
        
        .play-btn:hover {
          background: #0069d9;
        }
        
        .progress-container {
          flex-grow: 1;
        }
        
        .progress-bar {
          width: 100%;
          cursor: pointer;
        }
        
        .time-display {
          font-size: 12px;
          color: #666;
          white-space: nowrap;
          margin: 0 10px;
        }
        
        .volume-control {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        svg {
          width: 20px;
          height: 20px;
          fill: currentColor;
        }
        
        .media-container {
          display: none; /* Показывается только для видео/YouTube */
        }
        
        /* Стили для видео-режима */
        :host([type="video"]) .media-container,
        :host([type="youtube"]) .media-container {
          display: block;
          margin-top: 10px;
        }
        
        :host([type="video"]) video,
        :host([type="youtube"]) iframe {
          width: 100%;
          border-radius: 8px;
        }
      </style>
      
      <div class="player-container">
        <!-- Контейнер для медиа (аудио/видео/YouTube) -->
        <div class="media-container"></div>
        
        <!-- Панель управления -->
        <div class="controls-row">
          <button class="play-btn" id="playBtn">
            <svg viewBox="0 0 24 24" id="playIcon">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
          
          <div class="progress-container">
            <input type="range" class="progress-bar" id="progressBar" min="0" max="100" value="0">
          </div>
          
          <span class="time-display" id="timeDisplay">--:-- / --:--</span>
          
          <div class="volume-control">
            <svg viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
            <input type="range" class="volume-bar" id="volumeBar" min="0" max="100" value="70">
          </div>
        </div>
      </div>
    `;
    
    // Элементы управления
    this.playBtn = this.shadowRoot.getElementById('playBtn');
    this.playIcon = this.shadowRoot.getElementById('playIcon');
    this.progressBar = this.shadowRoot.getElementById('progressBar');
    this.volumeBar = this.shadowRoot.getElementById('volumeBar');
    this.timeDisplay = this.shadowRoot.getElementById('timeDisplay');
    this.mediaContainer = this.shadowRoot.querySelector('.media-container');
    
    // Медиа-элемент (создаётся динамически)
    this.mediaElement = null;
  }

  // Вызывается при подключении компонента к странице
  connectedCallback() {
    // Инициализация медиа в зависимости от типа
    const type = this.getAttribute('type') || 'audio';
    const src = this.getAttribute('src');
    const videoId = this.getAttribute('video-id');
    
    if (type === 'youtube') {
      this.initYouTube(videoId);
    } else {
      this.initMedia(type, src);
    }
    
    // Настройка событий
    this.setupEvents();
  }

  // Инициализация аудио/видео
  initMedia(type, src) {
    this.mediaElement = document.createElement(type);
    this.mediaElement.src = src;
    this.mediaContainer.appendChild(this.mediaElement);
    
    // Для видео показываем контейнер
    if (type === 'video') {
      this.mediaElement.controls = false;
      this.mediaElement.style.width = '100%';
    }
  }

  // Инициализация YouTube
  initYouTube(videoId) {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
    iframe.allowFullscreen = true;
    this.mediaElement = iframe;
    this.mediaContainer.appendChild(iframe);
    
    // Загрузка YouTube API
    this.loadYouTubeAPI();
  }

  // Загрузка YouTube IFrame API
  loadYouTubeAPI() {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
  }

  // Настройка обработчиков событий
  setupEvents() {
    // Кнопка воспроизведения
    this.playBtn.addEventListener('click', () => this.togglePlay());
    
    // Прогресс-бар
    this.progressBar.addEventListener('input', () => this.seek());
    
    // Громкость
    this.volumeBar.addEventListener('input', () => {
      if (this.mediaElement) {
        this.mediaElement.volume = this.volumeBar.value / 100;
      }
    });
    
    // Обновление времени
    if (this.mediaElement && this.mediaElement.tagName !== 'IFRAME') {
      this.mediaElement.addEventListener('timeupdate', () => this.updateTime());
    }
  }

  // Воспроизведение/пауза
  togglePlay() {
    if (!this.mediaElement) return;
    
    if (this.mediaElement.paused) {
      this.mediaElement.play()
        .then(() => {
          this.playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
        })
        .catch(error => {
          console.error("Ошибка воспроизведения:", error);
        });
    } else {
      this.mediaElement.pause();
      this.playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
    }
  }

  // Перемотка
  seek() {
    if (!this.mediaElement) return;
    const duration = this.mediaElement.duration || 0;
    this.mediaElement.currentTime = (this.progressBar.value / 100) * duration;
  }

  // Обновление времени
  updateTime() {
    if (!this.mediaElement) return;
    
    const currentTime = this.mediaElement.currentTime;
    const duration = this.mediaElement.duration || 0;
    this.timeDisplay.textContent = 
      `${this.formatTime(currentTime)} / ${this.formatTime(duration)}`;
    
    // Обновление прогресс-бара
    if (duration > 0) {
      this.progressBar.value = (currentTime / duration) * 100;
    }
  }

  // Форматирование времени (мм:сс)
  formatTime(seconds) {
    if (isNaN(seconds)) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  // Отслеживание изменений атрибутов
  static get observedAttributes() {
    return ['src', 'type', 'video-id'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'src' && this.mediaElement && this.mediaElement.tagName !== 'IFRAME') {
      this.mediaElement.src = newValue;
    }
  }
}

// Регистрация компонента
customElements.define('harmony-player', HarmonyPlayer);
