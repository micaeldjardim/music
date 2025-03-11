/**
 * Extrai o ID do vídeo do YouTube a partir da URL.
 * @param {string} url - URL do vídeo.
 * @returns {string|null} - ID do vídeo ou null se não encontrado.
 */
export function extrairVideoId(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  }
  
  /**
   * Extrai o ID do vídeo e o tempo de início (se definido) a partir da URL.
   * @param {string} url - URL do vídeo.
   * @returns {Object} - Objeto com videoId e startTime.
   */
  export function extrairVideoIdETempo(url) {
    let videoId = null;
    let startTime = 0;
    let match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    if (match) {
      videoId = match[1];
    }
    let timeMatch = url.match(/[?&]t=(\d+)/);
    if (timeMatch) {
      startTime = parseInt(timeMatch[1], 10);
    }
    return { videoId, startTime };
  }
  
  /**
   * Exibe o player do YouTube no container, utilizando a URL da música.
   * @param {Object} musica - Objeto da música com a propriedade URL.
   */
  export function exibirYoutubePlayer(musica) {
    const playerContainer = document.getElementById("player-container");
    playerContainer.innerHTML = "";
    if (musica.URL) {
      const { videoId, startTime } = extrairVideoIdETempo(musica.URL);
      if (!videoId) {
        console.error("ID do vídeo não encontrado!");
        return;
      }
      const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&start=${startTime}`;
      const iframe = document.createElement("iframe");
      iframe.setAttribute("width", "560");
      iframe.setAttribute("height", "315");
      iframe.setAttribute("src", embedUrl);
      iframe.setAttribute("frameborder", "0");
      iframe.setAttribute("allow", "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture");
      iframe.setAttribute("allowfullscreen", "true");
      playerContainer.appendChild(iframe);
    }
  }
  