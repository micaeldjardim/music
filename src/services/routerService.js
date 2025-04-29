import { criarSlug, gerarIdTemporario } from "./musicService.js";

export function extrairMusicaIdDaURL() {
  // Verificar se há um parâmetro musicaId na URL
  const urlParams = new URLSearchParams(window.location.search);
  const musicaId = urlParams.get('musicaId');
  if (musicaId) {
    return musicaId;
  }
  
  // Verificar se há um hash no formato antigo
  const hash = window.location.hash;
  if (hash && hash.startsWith('#musica/')) {
    try {
      const parts = hash.substring(8).split('/');
      if (parts.length >= 1) {
        return parts[0];
      }
    } catch (error) {
      console.error('Erro ao extrair ID da URL:', error);
    }
  }
  return null;
}

export function navegarParaMusica(musica) {
  if (!musica) return;

  // Se não tiver ID, gera um id temporário
  const musicaId = musica.id || gerarIdTemporario(musica);

  // Navegar para drag.html com o ID da música como parâmetro
  window.location.href = `drag.html?musicaId=${encodeURIComponent(musicaId)}`;
}

export function navegarParaHome() {
  window.location.href = 'index.html';
}
