let player; // Variável global para armazenar o player

/**
 * Função chamada quando a API do YouTube está pronta.
 * Cria um novo player e gerencia eventos.
 * @param {string} videoId - ID do vídeo do YouTube.
 * @param {number} startTime - Tempo de início do vídeo (em segundos).
 */
function criarPlayer(videoId, startTime = 0) {
    if (player) {
        player.loadVideoById({ videoId, startSeconds: startTime });
    } else {
        player = new YT.Player("player-container", {
            height: "360",
            width: "640",
            videoId: videoId,
            playerVars: {
                autoplay: 1,
                start: startTime,
                controls: 0, // 1 para mostrar os controles do player
                rel: 0, // Evita mostrar vídeos relacionados
                showinfo: 0, // Remove informações do vídeo
                cc_load_policy: 0, // Bloqueia legendas
                modestbranding: 0, // Remove logo do YouTube
                disablekb: 1 // Desabilita o controle de teclado
            },
            events: {
                onReady: onPlayerReady,
                onStateChange: onPlayerStateChange,
            },
        });
        
        // Adiciona listener para o evento de navegação do histórico (botão voltar)
        window.addEventListener('popstate', pararPlayerAoVoltar);
    }
}

/**
 * Para a reprodução do vídeo quando o usuário navega para trás.
 */
function pararPlayerAoVoltar() {
    if (player && typeof player.pauseVideo === 'function') {
        player.pauseVideo();
        console.log("Vídeo pausado devido à navegação para trás");
    }
}

/**
 * Chamada quando o player está pronto.
 */
function onPlayerReady(event) {
    event.target.playVideo(); // Inicia a reprodução automática
}

/**
 * Monitora mudanças no estado do player.
 */
function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.ENDED) {
        console.log("O vídeo terminou!");
    }
}

 export function voltar5s() {
    if (player && typeof player.getCurrentTime === 'function') {
        let currentTime = player.getCurrentTime();
        player.seekTo(currentTime - 5, true);
    }
}
export function playpause() {
    if (player && typeof player.getPlayerState === 'function') {
        let state = player.getPlayerState();
        if (state === YT.PlayerState.PLAYING) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    }
}


/**
 * Extrai o ID do vídeo e o tempo de início da URL do YouTube.
 * @param {string} url - URL do vídeo.
 * @returns {Object} - Objeto com videoId e startTime.
 */
export function extrairVideoIdETempo(url) {
    let videoId = null;
    let startTime = 0;

    // Expressão regular para capturar o ID do vídeo
    let match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/v\/|.*\/embed\/|.*\/shorts\/))([0-9A-Za-z_-]{11})/);
    if (match) {
        videoId = match[1];
    }

    // Captura tempo de início no formato 't=60' ou 't=1h2m3s'
    let timeMatch = url.match(/[?&]t=(\d+h)?(\d+m)?(\d+s?)?/);
    if (timeMatch) {
        let horas = timeMatch[1] ? parseInt(timeMatch[1]) * 3600 : 0;
        let minutos = timeMatch[2] ? parseInt(timeMatch[2]) * 60 : 0;
        let segundos = timeMatch[3] ? parseInt(timeMatch[3]) : 0;
        startTime = horas + minutos + segundos;
    }

    return { videoId, startTime };
}

/**
 * Extrai apenas o ID do vídeo da URL do YouTube.
 * @param {string} url - URL do vídeo do YouTube.
 * @returns {Object|null} - Objeto com videoId ou null se não encontrado.
 */
export function extrairVideoId(url) {
    if (!url) return null;
    
    // Expressão regular para capturar o ID do vídeo
    let match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/v\/|.*\/embed\/|.*\/shorts\/))([0-9A-Za-z_-]{11})/);
    if (match) {
        return { videoId: match[1] };
    }
    return null;
}

/**
 * Exibe o player do YouTube no container, utilizando a API do YouTube.
 * @param {Object} musica - Objeto da música com a propriedade URL.
 */
export function exibirYoutubePlayer(musica) {
    if (musica.URL) {
        const { videoId, startTime } = extrairVideoIdETempo(musica.URL);
        if (!videoId) {
            console.error("ID do vídeo não encontrado!");
            return;
        }
        criarPlayer(videoId, startTime);
    }

}

/**
 * Limpa o player e remove os event listeners.
 * Deve ser chamado quando o componente que usa o player for desmontado.
 */
export function limparPlayer() {
    window.removeEventListener('popstate', pararPlayerAoVoltar);
    
    if (player && typeof player.destroy === 'function') {
        player.destroy();
        player = null;
    }
}