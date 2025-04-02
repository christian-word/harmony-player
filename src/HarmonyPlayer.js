class HarmonyPlayer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.youtubePlayer = null;
    this.mediaElement = null;
    this.isPlaying = false;

    this.shadowRoot.innerHTML = `
      <style>
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
        
        .player-controls {
          display: flex;
          align-items: center;
          gap: 8px;
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
          flex-shrink: 0;
        }
        
        .play-button:hover {
          background: #0069d9;
        }
        
        .play-button svg {
          width: 20px;
          height: 20px;
          fill: currentColor;
        }
        
        .progress-container {
          flex-grow: 1;
        }
        
        .progress-bar {
          width: 100%;
          height: 4px;
          cursor: pointer;
          accent-color: #007bff;
        }
        
        .time-info {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #666;
          margin-top: 3px;
        }
        
        .volume-control {
          display: flex;
          align-items: center;
          gap: 5px;
          flex-shrink: 0;
        }
        
        .volume-icon {
          width: 20px;
          height: 20px;
        }
        
        .volume-slider {
          width: 80px;
          height: 4px;
          accent-color: #007bff;
          cursor: pointer;
        }
        
        .media-container {
          display: none;
          margin-bottom: 10px;
          border-radius: 8px;
          overflow: hidden;
        }
        
        :host([type="video"]) .media-container,
        :host([type="youtube"]) .media-container {
          display: block;
        }
        
        video, .youtube-iframe {
          width: 100%;
          display: block;
        }
      </style>
      
      <div class="player-container">
        <div class="media-container">
          <video></video>
          <div class="youtube-iframe"></div>
        </div>
        
        <div class="player-controls">
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
            <input type="range" class="volume-slider" id="volumeSlider" min="0" max="100" value="70">
          </div>
        </div>
      </div>
    `;

    this.playButton = this.shadowRoot.getElementById('playButton');
    this.playIcon = this.shadowRoot.getElementById('playIcon');
    this.progressBar = this.shadowRoot.getElementById('progressBar');
    this.volumeSlider = this.shadowRoot.getElementById('volumeSlider');
    this.currentTimeEl = this.shadowRoot.getElementById('currentTime');
    this.durationEl = this.shadowRoot.getElementById('duration');
    this.videoElement = this.shadowRoot.querySelector('video');
    this.youtubeContainer = this.shadowRoot.querySelector('.youtube-iframe');
  }

  connectedCallback() {
    const type = this.getAttribute('type') || 'audio';
    const src = this.getAttribute('src');
    const videoId = this.getAttribute('video-id');

    if (type === 'youtube') {
      this.initYouTube(videoId);
    } else if (type === 'video') {
      this.initVideo(src);
    } else {
      this.initAudio(src);
    }

    this.setupEvents();
  }

  initYouTube(videoId) {
    if (!videoId) return;

    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allow', 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture');
    this.youtubeContainer.appendChild(iframe);

    iframe.onload = () => {
      this.forcePlay();
    };
  }

  initVideo(src) {
    if (!src) return;
    this.videoElement.src = src;
    this.mediaElement = this.videoElement;
  }

  initAudio(src) {
    if (!src) return;
    const audio = new Audio(src);
    this.shadowRoot.appendChild(audio);
    this.mediaElement = audio;
  }

  setupEvents() {
    this.playButton.addEventListener('click', () => this.togglePlay());
    this.progressBar.addEventListener('input', () => this.seek());
    this.volumeSlider.addEventListener('input', () => {
      if (this.mediaElement) {
        this.mediaElement.volume = this.volumeSlider.value / 100;
      }
    });

    if (this.mediaElement) {
      this.mediaElement.addEventListener('timeupdate', () => this.updateTime());
      this.mediaElement.addEventListener('loadedmetadata', () => {
        this.durationEl.textContent = this.formatTime(this.mediaElement.duration);
      });
      this.mediaElement.addEventListener('ended', () => {
        this.dispatchEvent(new CustomEvent('track-ended', { bubbles: true, composed: true }));
      });
    }
  }

  forcePlay() {
    if (this.mediaElement) {
      this.mediaElement.play().catch(e => console.error('Playback failed:', e));
    } else if (this.youtubeContainer.firstChild) {
      this.youtubeContainer.firstChild.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: 'playVideo'
      }), '*');
    }
  }

  togglePlay() {
    if (this.mediaElement) {
      if (this.mediaElement.paused) {
        this.mediaElement.play();
        this.playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
      } else {
        this.mediaElement.pause();
        this.playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
      }
    }
  }

  seek() {
    if (this.mediaElement) {
      this.mediaElement.currentTime = (this.progressBar.value / 100) * this.mediaElement.duration;
    }
  }

  updateTime() {
    if (this.mediaElement) {
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
