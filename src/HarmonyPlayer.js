class HarmonyPlayer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.youtubePlayer = null;
    this.currentTimeInterval = null;
    this.isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    this.mediaElement = null;

    // Шаблон компонента с оригинальным дизайном
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
          font-family: Arial, sans-serif;
        }
        
        .player-row {
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
        
        .youtube-container {
          aspect-ratio: 16/9;
        }
      </style>

      <div class="player-container">
        <div class="media-container">
          <div class="youtube-container"></div>
          <video></video>
        </div>
        
        <div class="player-row">
          <button class="play-button" id="playButton">
            <svg viewBox="0 0 24 24" id="playIcon">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
          
          <div class="progress-container">
            <input type="range" class="progress-bar" id="progressBar" min="0" max="100" value="0">
            <div class="time-info">
              <span id="currentTime">0:00</span>
              <span id="duration">0:00</span>
            </div>
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

    // Получаем элементы
    this.playButton = this.shadowRoot.getElementById('playButton');
    this.playIcon = this.shadowRoot.getElementById('playIcon');
    this.progressBar = this.shadowRoot.getElementById('progressBar');
    this.volumeSlider = this.shadowRoot.getElementById('volumeSlider');
    this.currentTimeEl = this.shadowRoot.getElementById('currentTime');
    this.durationEl = this.shadowRoot.getElementById('duration');
    this.youtubeContainer = this.shadowRoot.querySelector('.youtube-container');
    this.videoElement = this.shadowRoot.querySelector('video');
  }

  connectedCallback() {
    const type = this.getAttribute('type') || 'audio';
    const src = this.getAttribute('src');
    const videoId = this.getAttribute('video-id');

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

    if (this.isMobile) {
      // Для мобильных потребуется дополнительная обработка
      console.log("YouTube на мобильных требует отдельной реализации");
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

    this.youtubeContainer.innerHTML = '';
    this.videoElement.style.display = 'block';
    this.videoElement.src = src;
    this.videoElement.controls = false;
    this.mediaElement = this.videoElement;
  }

  initAudio(src) {
    if (!src) return;

    this.youtubeContainer.innerHTML = '';
    this.videoElement.style.display = 'none';
    const audio = new Audio(src);
    audio.style.display = 'none';
    this.shadowRoot.appendChild(audio);
    this.mediaElement = audio;
  }

  setupEvents() {
    this.playButton.addEventListener('click', () => this.togglePlay());
    this.progressBar.addEventListener('input', () => this.seek());
    this.volumeSlider.addEventListener('input', () => this.setVolume());

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
    const volume = this.volumeSlider.value / 100;
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

    this.currentTimeEl.textContent = this.formatTime(currentTime);
    this.durationEl.textContent = this.formatTime(duration);
    this.progressBar.value = (currentTime / duration) * 100;
  }

  updateDuration() {
    if (!this.mediaElement) return;
    this.durationEl.textContent = this.formatTime(this.mediaElement.duration);
  }

  updateYouTubeDuration() {
    if (!this.youtubePlayer) return;
    this.durationEl.textContent = this.formatTime(this.youtubePlayer.getDuration());
  }

  formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
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
