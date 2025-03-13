import { getMusicas } from "./firebase.js";
import { extrairVideoId } from "../components/player.js";

let allMusicas = [];
let navegarParaHomeFunction = null;

export function setHomeNavigation(fn) {
  navegarParaHomeFunction = fn;
}

export async function carregarMusicas(callbackSelectMusic) {
  allMusicas = await getMusicas();
  window.allMusicas = allMusicas;
  renderMusicList(callbackSelectMusic);
  return allMusicas;
}

export function encontrarMusicaPorId(id) {
  if (!id) return null;
  
  return allMusicas.find(m => 
    m.id === id || 
    (id.includes('-') && id.startsWith(criarSlug(m.titulo)))
  );
}

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

function configurarNavegacaoHistorico(callbackSelectMusic) {
  window.addEventListener('popstate', (event) => {
    if (event.state && event.state.screen) {
      switch (event.state.screen) {
        case 'drag':
          if (event.state.musicaId) {
            const musica = allMusicas.find(m => 
              m.id === event.state.musicaId ||
              event.state.musicaId.startsWith(criarSlug(m.titulo))
            );
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
  
  if (!window.location.hash || window.location.hash === '#' || window.location.hash === '#home') {
    const initialState = { screen: 'home' };
    history.replaceState(initialState, '', '#home');
  }
}

export function mostrarTelaInicial() {
  document.getElementById("screen-home").style.display = "block";
  document.getElementById("screen-drag").style.display = "none";
  
  const playerContainer = document.getElementById("player-container");
  if (playerContainer) {
    playerContainer.innerHTML = "";
  }
  
  if (window.location.hash !== '#home' && navegarParaHomeFunction) {
    navegarParaHomeFunction();
  }
}

export function renderMusicList(callbackSelectMusic) {
  const container = document.getElementById("music-list");
  if (!container) return;
  
  // Debug para verificar dados das músicas
  console.log("Todas as músicas:", allMusicas);
  // Verificação específica da propriedade artista em cada música
  allMusicas.forEach(m => {
    console.log(`Música: ${m.titulo}, Artista: [${m.artista}], Tipo: ${typeof m.artista}`);
  });
  
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
    
    // Container específico para conteúdo de texto
    const textContainer = document.createElement("div");
    textContainer.className = "text-container";
    
    if (thumbUrl) {
      const img = document.createElement("img");
      img.src = thumbUrl;
      img.alt = musica.titulo;
      div.appendChild(img);
    }
    
    const title = document.createElement("div");
    title.className = "music-title-thumb";
    title.textContent = musica.titulo;
    textContainer.appendChild(title);

    // Verifica se artista existe e não é uma string vazia
    const artist = document.createElement("div");
    artist.className = "music-artist-thumb";
    artist.textContent = ((musica.artista || musica.artist || "").trim()) || "Artista Desconhecido";
    textContainer.appendChild(artist);
    
    // Adicione o container de texto ao div principal
    div.appendChild(textContainer);
    
    console.log("Musica sendo renderizada:", musica.titulo, "Artista:", musica.artista);
    
    div.onclick = () => {
      callbackSelectMusic(musica);
      
      if (window.navegarParaMusica) {
        window.navegarParaMusica(musica);
      }
    };
    
    container.appendChild(div);
  });
}

export function gerarIdTemporario(musica) {
  const slug = criarSlug(musica.titulo);
  const uniqueId = Date.now().toString(36).slice(-4);
  return `${slug}-${uniqueId}`;
}

export function criarSlug(texto) {
  if (!texto || typeof texto !== 'string') {
    return 'musica';
  }
  
  return texto
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .substring(0, 50);
}



