class HarmonyPlayer extends HTMLElement {
    constructor() {
        super();
        
        // Создаём Shadow DOM для изоляции
        this.attachShadow({ mode: 'open' });
        
        // Шаблон компонента
        this.shadowRoot.innerHTML = `
            <style>
                .player {
                    background: #f5f5f5;
                    border-radius: 15px;
                    padding: 15px;
                    max-width: 500px;
                }
                /* Ваши стили из предыдущего примера */
            </style>
            <div class="player">
                <button class="play-btn">►</button>
                <input type="range" class="progress-bar">
                <span class="time">--:-- / --:--</span>
                <!-- Аудио/видео будет добавляться динамически -->
            </div>
        `;
    }

    // Сюда добавьте логику плеера (play/pause, громкость и т.д.)
}

// Регистрируем компонент
customElements.define('harmony-player', HarmonyPlayer);
