import { criarSlug, gerarIdTemporario } from "./musicService.js";

export function extrairMusicaIdDaURL() {
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
  
  const musicaId = musica.id || gerarIdTemporario(musica);
  let url = `#musica/${musicaId}`;
  
  if (musica.id && !musica.id.includes('-')) {
    const slug = criarSlug(musica.titulo);
    url = `#musica/${musicaId}/${slug}`;
  }
  
  history.pushState({ 
    screen: 'drag', 
    musicaId: musicaId 
  }, '', url);
}

export function navegarParaHome() {
  history.pushState({ screen: 'home' }, '', '#home');
}