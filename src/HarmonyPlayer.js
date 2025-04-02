class HarmonyPlayer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.media = null;
    this.isPlaying = false;

    this.shadowRoot.innerHTML = `
      <style>
        /* Минимальные стили для работы */
        .player { width: 100%; }
        video, audio { width: 100%; }
        .youtube-container {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          overflow: hidden;
        }
        .youtube-iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 0;
        }
      </style>
      <div class="player">
        <video></video>
        <audio></audio>
        <div class="youtube-container">
          <iframe class="youtube-iframe" allowfullscreen></iframe>
        </div>
      </div>
    `;

    this.video = this.shadowRoot.querySelector('video');
    this.audio = this.shadowRoot.querySelector('audio');
    this.iframe = this.shadowRoot.querySelector('.youtube-iframe');
  }

  connectedCallback() {
    const type = this.getAttribute('type');
    const src = this.getAttribute('src');
    const videoId = this.getAttribute('video-id');

    if (type === 'youtube' && videoId) {
      this.initYouTube(videoId);
    } else if (type === 'video' && src) {
      this.initVideo(src);
    } else if (type === 'audio' && src) {
      this.initAudio(src);
    }
  }

  initYouTube(videoId) {
    this.iframe.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1`;
    this.media = this.iframe;
    
    window.onYouTubeIframeAPIReady = () => {
      this.ytPlayer = new YT.Player(this.iframe, {
        events: {
          'onStateChange': (e) => {
            if (e.data === YT.PlayerState.ENDED) {
              this.dispatchEvent(new Event('ended'));
            }
          }
        }
      });
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
  }

  initVideo(src) {
    this.video.src = src;
    this.media = this.video;
    this.video.addEventListener('ended', () => this.dispatchEvent(new Event('ended')));
  }

  initAudio(src) {
    this.audio.src = src;
    this.media = this.audio;
    this.audio.addEventListener('ended', () => this.dispatchEvent(new Event('ended')));
  }

  play() {
    if (this.media === this.iframe && this.ytPlayer) {
      this.ytPlayer.playVideo();
    } else if (this.media) {
      this.media.play().catch(e => console.error('Play error:', e));
    }
  }
}

customElements.define('harmony-player', HarmonyPlayer);
