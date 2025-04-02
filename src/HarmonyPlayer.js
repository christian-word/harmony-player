class HarmonyPlayer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.youtubePlayer = null;
    this.mediaElement = null;
    this.isPlaying = false;

    this.shadowRoot.innerHTML = `
      <style>
        /* Все стили остаются без изменений */
        .player-container {
          display: flex;
          flex-direction: column;
          gap: 5px;
          padding: 15px;
          background: #f5f5f5;
          border-radius: 15px;
          width: 100%;
          max-width: 500px;
          margin: 20px auto;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          font-family: Arial, sans-serif;
        }
        /* ... остальные стили ... */
      </style>
      
      <div class="player-container">
        <div class="media-container">
          <video></video>
          <div class="youtube-iframe"></div>
          <div class="mobile-overlay">
            <button class="play-button" style="margin-bottom: 10px;">
              <svg viewBox="0 0 24 24" width="30" height="30">
                <path d="M8 5v14l11-7z" fill="white"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="loading-indicator">
          <div class="spinner">Загрузка...</div>
        </div>
        
        <div class="player-controls">
          <!-- Все элементы управления остаются без изменений -->
        </div>
      </div>
    `;

    // Инициализация элементов
    this.playButton = this.shadowRoot.getElementById('playButton');
    this.playIcon = this.shadowRoot.getElementById('playIcon');
    this.progressBar = this.shadowRoot.getElementById('progressBar');
    this.volumeSlider = this.shadowRoot.getElementById('volumeSlider');
    this.currentTimeEl = this.shadowRoot.getElementById('currentTime');
    this.durationEl = this.shadowRoot.getElementById('duration');
    this.videoElement = this.shadowRoot.querySelector('video');
    this.youtubeContainer = this.shadowRoot.querySelector('.youtube-iframe');
    this.mobileOverlay = this.shadowRoot.querySelector('.mobile-overlay');
    this.loadingIndicator = this.shadowRoot.querySelector('.loading-indicator');
  }

  connectedCallback() {
    const type = this.getAttribute('type') || 'audio';
    const src = this.getAttribute('src');
    const videoId = this.getAttribute('video-id');
    const autoplay = this.hasAttribute('autoplay');

    if (type === 'youtube') {
      this.initYouTube(videoId);
    } else if (type === 'video') {
      this.initVideo(src);
    } else {
      this.initAudio(src);
    }

    this.setupEvents();

    if (autoplay) {
      setTimeout(() => this.togglePlay(), 100);
    }
  }

  disconnectedCallback() {
    if (this.youtubePlayer) {
      this.youtubePlayer.destroy();
    }
  }

  initYouTube(videoId) {
    if (!videoId) return;

    if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
      const mobilePlayBtn = this.mobileOverlay.querySelector('.play-button');
      mobilePlayBtn.addEventListener('click', () => {
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
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        modestbranding: 1,
        rel: 0,
        enablejsapi: 1
      },
      events: {
        'onReady': () => this.onYouTubeReady(),
        'onStateChange': (e) => this.onYouTubeStateChange(e)
      }
    });
  }

  initVideo(src) {
    if (!src) return;
    this.showLoading();
    this.videoElement.src = src;
    this.videoElement.controls = false;
    this.mediaElement = this.videoElement;
    this.videoElement.addEventListener('loadeddata', () => this.hideLoading());
    this.videoElement.addEventListener('error', () => this.hideLoading());
  }

  initAudio(src) {
    if (!src) return;
    this.showLoading();
    const audio = new Audio(src);
    this.shadowRoot.appendChild(audio);
    this.mediaElement = audio;
    audio.addEventListener('loadeddata', () => this.hideLoading());
    audio.addEventListener('error', () => this.hideLoading());
  }

  showLoading() {
    this.loadingIndicator.style.display = 'block';
  }

  hideLoading() {
    this.loadingIndicator.style.display = 'none';
  }

  setupEvents() {
    this.playButton.addEventListener('click', () => this.togglePlay());
    this.progressBar.addEventListener('input', () => this.seek());
    this.volumeSlider.addEventListener('input', () => {
      if (this.youtubePlayer) {
        this.youtubePlayer.setVolume(this.volumeSlider.value);
      } else if (this.mediaElement) {
        this.mediaElement.volume = this.volumeSlider.value / 100;
      }
    });

    if (this.mediaElement) {
      this.mediaElement.addEventListener('timeupdate', () => this.updateTime());
      this.mediaElement.addEventListener('loadedmetadata', () => {
        this.durationEl.textContent = this.formatTime(this.mediaElement.duration);
      });
      this.mediaElement.addEventListener('ended', () => {
        this.dispatchEvent(new CustomEvent('track-ended', { 
          bubbles: true,
          composed: true
        }));
      });
    }
  }

  onYouTubeReady() {
    this.durationEl.textContent = this.formatTime(this.youtubePlayer.getDuration());
    this.youtubePlayer.setVolume(this.volumeSlider.value);
    this.hideLoading();
  }

  onYouTubeStateChange(event) {
    switch(event.data) {
      case YT.PlayerState.PLAYING:
        this.playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
        this.isPlaying = true;
        break;
      case YT.PlayerState.PAUSED:
        this.playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
        this.isPlaying = false;
        break;
      case YT.PlayerState.ENDED:
        this.playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
        this.isPlaying = false;
        this.dispatchEvent(new CustomEvent('track-ended', { 
          bubbles: true,
          composed: true
        }));
        break;
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
            this.isPlaying = true;
          });
      } else {
        this.mediaElement.pause();
        this.playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
        this.isPlaying = false;
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

  updateTime() {
    if (this.youtubePlayer) {
      const currentTime = this.youtubePlayer.getCurrentTime();
      const duration = this.youtubePlayer.getDuration();
      this.currentTimeEl.textContent = this.formatTime(currentTime);
      this.durationEl.textContent = this.formatTime(duration);
      this.progressBar.value = (currentTime / duration) * 100;
    } else if (this.mediaElement) {
      this.currentTimeEl.textContent = this.formatTime(this.mediaElement.currentTime);
      this.progressBar.value = (this.mediaElement.currentTime / this.mediaElement.duration) * 100;
    }
  }

  formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
}

customElements.define('harmony-player', HarmonyPlayer);
