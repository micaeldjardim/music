// services/musicService.js
import { getMusicas } from "./firebase.js";
import { extrairVideoId } from "../components/player.js";

let allMusicas = [];

/**
 * Carrega as músicas do Firebase e renderiza a lista, utilizando a callback
 * passada para quando uma música for selecionada.
 * @param {Function} callbackSelectMusic - Função executada ao selecionar uma música.
 */
export async function carregarMusicas(callbackSelectMusic) {
  allMusicas = await getMusicas();
  renderMusicList(callbackSelectMusic);
  
  // Configuração da navegação
  configurarNavegacaoHistorico(callbackSelectMusic);
  
  // Verifica se há música na URL inicial
  verificarURLInicial(callbackSelectMusic);
}

/**
 * Verifica se a URL inicial contém referência a uma música
 * @param {Function} callbackSelectMusic - Função para seleção de música
 */
function verificarURLInicial(callbackSelectMusic) {
  const hash = window.location.hash;
  if (hash && hash.startsWith('#musica/')) {
    try {
      const musicaId = hash.substring(8).split('/')[0];
      if (musicaId) {
        const musica = allMusicas.find(m => m.id === musicaId || 
                                       musicaId.startsWith(criarSlug(m.titulo)));
        if (musica) {
          callbackSelectMusic(musica);
        }
      }
    } catch (error) {
      console.error("Erro ao processar URL inicial:", error);
    }
  }
}

/**
 * Configura listeners para navegação do histórico (voltar/avançar)
 * @param {Function} callbackSelectMusic - Função para seleção de música
 */
function configurarNavegacaoHistorico(callbackSelectMusic) {
  // Adiciona evento de popstate para tratar botão voltar/avançar
  window.addEventListener('popstate', (event) => {
    if (event.state && event.state.screen) {
      // Carrega a tela apropriada baseada no estado
      switch (event.state.screen) {
        case 'drag':
          if (event.state.musicaId) {
            // Busca a música pelo ID
            const musica = allMusicas.find(m => m.id === event.state.musicaId ||
                                          event.state.musicaId.startsWith(criarSlug(m.titulo)));
            if (musica) {
              callbackSelectMusic(musica);
            } else {
              console.warn("Música não encontrada na navegação:", event.state.musicaId);
              mostrarTelaInicial();
            }
          } else {
            mostrarTelaInicial();
          }
          break;
        case 'home':
        default:
          mostrarTelaInicial();
          break;
      }
    } else {
      mostrarTelaInicial();
    }
  });
  
  // Definir o estado inicial da página se não houver hash
  if (!window.location.hash || window.location.hash === '#' || window.location.hash === '#home') {
    const initialState = { screen: 'home' };
    history.replaceState(initialState, '', '#home');
  }
}

/**
 * Mostra a tela inicial
 */
function mostrarTelaInicial() {
  document.getElementById("screen-home").style.display = "block";
  document.getElementById("screen-drag").style.display = "none";
}

/**
 * Renderiza a lista de músicas filtradas de acordo com o termo pesquisado.
 * @param {Function} callbackSelectMusic - Função executada ao clicar em uma música.
 */
export function renderMusicList(callbackSelectMusic) {
  const container = document.getElementById("music-list");
  if (!container) return;
  
  container.innerHTML = "";
  const searchInput = document.getElementById("search-input");
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
  
  const filtered = allMusicas.filter(musica =>
    musica.titulo.toLowerCase().includes(searchTerm)
  );
  
  if (filtered.length === 0) {
    container.innerHTML = '<div class="no-results">Nenhuma música encontrada</div>';
    return;
  }
  
  filtered.forEach(musica => {
    const videoId = extrairVideoId(musica.URL);
    const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "";
    const div = document.createElement("div");
    div.className = "music-thumb";
    const title = document.createElement("div");
    title.className = "music-title-thumb";
    title.textContent = musica.titulo;
    div.appendChild(title);
    if (thumbUrl) {
      const img = document.createElement("img");
      img.src = thumbUrl;
      img.alt = musica.titulo;
      div.appendChild(img);
    }
    div.onclick = () => {
      callbackSelectMusic(musica);
      
      // Verifica se o ID existe antes de usar
      const musicaId = musica.id || gerarIdTemporario(musica);
      
      // Se for um ID do Firebase, adiciona o slug para SEO
      // Se for um ID gerado, o próprio ID já é baseado no slug
      if (musica.id && !musica.id.includes('-')) {
        const slug = criarSlug(musica.titulo);
        history.pushState({ screen: 'drag', musicaId: musicaId }, '', `#musica/${musicaId}/${slug}`);
      } else {
        history.pushState({ screen: 'drag', musicaId: musicaId }, '', `#musica/${musicaId}`);
      }
    };
    container.appendChild(div);
  });
}

/**
 * Gera um ID temporário para músicas sem ID
 * @param {Object} musica - Objeto da música
 * @returns {string} ID gerado
 */
function gerarIdTemporario(musica) {
  // Usa apenas o slug do título sem prefixos complexos
  const slug = criarSlug(musica.titulo);
  // Adiciona um identificador curto baseado no timestamp, apenas para torná-lo único
  const uniqueId = Date.now().toString(36).slice(-4);
  return `${slug}-${uniqueId}`;
}

/**
 * Converte um texto em um slug para URL (texto sem acentos, espaços, etc.)
 * @param {string} texto - Texto a ser convertido em slug
 * @returns {string} Slug para URL
 */
function criarSlug(texto) {
  if (!texto || typeof texto !== 'string') {
    return 'musica'; // Valor padrão se o título não existir
  }
  
  return texto
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/--+/g, '-') // Remove hífens duplicados
    .substring(0, 50); // Limita o tamanho
}



