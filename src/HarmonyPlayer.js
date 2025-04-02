/**
 * Harmony Player v1.0
 * Универсальный медиаплеер (Web Component)
 * Поддержка: аудио, видео, YouTube
 * Лицензия: MIT
 */

class HarmonyPlayer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.youtubePlayer = null;
    this.currentTimeInterval = null;
    this.isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);

    // Шаблон компонента
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          --primary-color: #007bff;
          --progress-color: #007bff;
          --volume-color: #007bff;
        }

        .player-container {
          background: #f5f5f5;
          border-radius: 15px;
          padding: 15px;
          max-width: 500px;
          margin: 0 auto;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          font-family: Arial, sans-serif;
        }

        .media-container {
          position: relative;
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
          display: block;
        }

        .youtube-container {
          aspect-ratio: 16/9;
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
          background: var(--primary-color);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .play-btn:disabled {
          opacity: 0.5;
        }

        .progress-container {
          flex-grow: 1;
          min-width: 50px;
        }

        .progress-bar {
          width: 100%;
          height: 4px;
          cursor: pointer;
          accent-color: var(--progress-color);
        }

        .time-display {
          font-size: 12px;
          color: #666;
          white-space: nowrap;
          margin: 0 5px;
          min-width: 100px;
          text-align: center;
        }

        .volume-control {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .volume-bar {
          width: 80px;
          accent-color: var(--volume-color);
        }

        svg {
          width: 20px;
          height: 20px;
          fill: currentColor;
        }

        .mobile-overlay {
          display: none;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          color: white;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
        }

        .mobile-play-btn {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 20px;
          cursor: pointer;
          margin-top: 10px;
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
            <p>YouTube видео</p>
            <button class="mobile-play-btn">▶️ Воспроизвести</button>
          </div>
        </div>

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

    // Получаем элементы
    this.playBtn = this.shadowRoot.getElementById('playBtn');
    this.playIcon = this.shadowRoot.getElementById('playIcon');
    this.progressBar = this.shadowRoot.getElementById('progressBar');
    this.volumeBar = this.shadowRoot.getElementById('volumeBar');
    this.timeDisplay = this.shadowRoot.getElementById('timeDisplay');
    this.youtubeContainer = this.shadowRoot.querySelector('.youtube-container');
    this.videoElement = this.shadowRoot.querySelector('video');
    this.mobileOverlay = this.shadowRoot.querySelector('.mobile-overlay');
    this.mobilePlayBtn = this.shadowRoot.querySelector('.mobile-play-btn');
  }

  connectedCallback() {
    const type = this.getAttribute('type') || 'audio';
    const src = this.getAttribute('src');
    const videoId = this.getAttribute('video-id');

    // Инициализация в зависимости от типа
    switch(type) {
      case 'youtube':
        this.initYouTube(videoId);
        break;
      case 'video':
        this.initVideo(src);
        break;
      default:
        this.initAudio(src);
    }

    this.setupEvents();
  }

  initYouTube(videoId) {
    if (!videoId) return;

    // Для мобильных показываем оверлей
    if (this.isMobile) {
      this.mobilePlayBtn.addEventListener('click', () => {
        this.mobileOverlay.style.display = 'none';
        this.loadYouTubeAPI(videoId);
      });
      return;
    }

    this.loadYouTubeAPI(videoId);
  }

  loadYouTubeAPI(videoId) {
    if (window.YT) {
      this.createYouTubePlayer(videoId);
      return;
    }

    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      this.createYouTubePlayer(videoId);
    };
  }

  createYouTubePlayer(videoId) {
    this.youtubePlayer = new YT.Player(this.youtubeContainer, {
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        modestbranding: 1
      },
      events: {
        'onReady': () => this.onYouTubeReady(),
        'onStateChange': (e) => this.onYouTubeStateChange(e)
      }
    });
  }

  onYouTubeReady() {
    this.updateYouTubeDuration();
    this.playBtn.disabled = false;
  }

  onYouTubeStateChange(event) {
    switch(event.data) {
      case YT.PlayerState.PLAYING:
        this.startTimeUpdate();
        this.playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
        break;
      case YT.PlayerState.PAUSED:
      case YT.PlayerState.ENDED:
        clearInterval(this.currentTimeInterval);
        this.playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
        break;
    }
  }

  initVideo(src) {
    if (!src) return;
    this.videoElement.src = src;
    this.videoElement.style.display = 'block';
  }

  initAudio(src) {
    if (!src) return;
    const audio = new Audio(src);
    audio.style.display = 'none';
    this.shadowRoot.appendChild(audio);
    this.mediaElement = audio;
  }

  setupEvents() {
    this.playBtn.addEventListener('click', () => this.togglePlay());
    this.progressBar.addEventListener('input', () => this.seek());
    this.volumeBar.addEventListener('input', () => this.setVolume());

    if (this.mediaElement) {
      this.mediaElement.addEventListener('timeupdate', () => this.updateTime());
      this.mediaElement.addEventListener('loadedmetadata', () => this.updateDuration());
    }
  }

  togglePlay() {
    if (this.youtubePlayer) {
      const state = this.youtubePlayer.getPlayerState();
      if (state === YT.PlayerState.PLAYING) {
        this.youtubePlayer.pauseVideo();
      } else {
        this.youtubePlayer.playVideo();
      }
    } else if (this.mediaElement) {
      if (this.mediaElement.paused) {
        this.mediaElement.play()
          .then(() => {
            this.playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
          });
      } else {
        this.mediaElement.pause();
        this.playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
      }
    }
  }

  seek() {
    if (this.youtubePlayer) {
      const duration = this.youtubePlayer.getDuration();
      const seekTo = (this.progressBar.value / 100) * duration;
      this.youtubePlayer.seekTo(seekTo, true);
    } else if (this.mediaElement) {
      this.mediaElement.currentTime = (this.progressBar.value / 100) * this.mediaElement.duration;
    }
  }

  setVolume() {
    const volume = this.volumeBar.value / 100;
    if (this.youtubePlayer) {
      this.youtubePlayer.setVolume(volume * 100);
    } else if (this.mediaElement) {
      this.mediaElement.volume = volume;
    }
  }

  startTimeUpdate() {
    clearInterval(this.currentTimeInterval);
    this.currentTimeInterval = setInterval(() => {
      this.updateTime();
    }, 1000);
  }

  updateTime() {
    let currentTime, duration;

    if (this.youtubePlayer) {
      currentTime = this.youtubePlayer.getCurrentTime();
      duration = this.youtubePlayer.getDuration();
    } else if (this.mediaElement) {
      currentTime = this.mediaElement.currentTime;
      duration = this.mediaElement.duration;
    } else {
      return;
    }

    this.timeDisplay.textContent = `${this.formatTime(currentTime)} / ${this.formatTime(duration)}`;
    this.progressBar.value = (currentTime / duration) * 100;
  }

  updateDuration() {
    if (!this.mediaElement) return;
    this.timeDisplay.textContent = `0:00 / ${this.formatTime(this.mediaElement.duration)}`;
  }

  updateYouTubeDuration() {
    if (!this.youtubePlayer) return;
    this.timeDisplay.textContent = `0:00 / ${this.formatTime(this.youtubePlayer.getDuration())}`;
  }

  formatTime(seconds) {
    if (isNaN(seconds)) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  static get observedAttributes() {
    return ['src', 'type', 'video-id'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'src' && this.mediaElement) {
      this.mediaElement.src = newValue;
    }
  }
}

customElements.define('harmony-player', HarmonyPlayer);
