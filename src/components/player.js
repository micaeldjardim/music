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
                controls: 1, // 1 para mostrar os controles do player
                rel: 0, // Evita mostrar vídeos relacionados
                showinfo: 0, // Remove informações do vídeo
                cc_load_policy: 0 // Bloqueia legendas
            },
            events: {
                onReady: onPlayerReady,
                onStateChange: onPlayerStateChange,
            },
        });
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