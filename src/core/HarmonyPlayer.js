connectedCallback() {
    const type = this.getAttribute('type');
    
    if (type === 'youtube') {
        const videoId = this.getAttribute('video-id');
        this.loadYouTube(videoId);
    }
}

loadYouTube(videoId) {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=0`;
    this.shadowRoot.querySelector('.player').appendChild(iframe);
}
