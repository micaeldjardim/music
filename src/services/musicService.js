import { getMusicas } from "./firebase.js";
import { extrairVideoId } from "../components/player.js";

let allMusicas = [];
let navegarParaHomeFunction = null;

export function setHomeNavigation(fn) {
  navegarParaHomeFunction = fn;
}

// Modifique a função carregarMusicas para configurar os botões de país existentes
export async function carregarMusicas(callbackSelectMusic) {
  allMusicas = await getMusicas();
  window.allMusicas = allMusicas;
  
  // Renderiza a lista de músicas
  renderMusicList(callbackSelectMusic);
  
  // Configura os filtros de país
  configurarBotoesCountry(callbackSelectMusic);
  
  return allMusicas;
}

// Adicione esta nova função para configurar os botões de país existentes
function configurarBotoesCountry(callbackSelectMusic) {
  const botoesPais = document.querySelectorAll(".country-btn");
  
  if (botoesPais.length === 0) return;
  
  // Mapeamento de textos alt para códigos de país na base de dados
  const mapeamentoPaises = {
    "EUA": "USA",
    "CAN": "Canada",
    "UK": "UK", 
    "AU": "Australia"
  };
  
  // Adicione botão "Todos" que já deve estar representado pelo botão "outros"
  const botaoTodos = Array.from(botoesPais).find(btn => btn.querySelector('img').alt === "outros");
  if (botaoTodos) {
    botaoTodos.addEventListener("click", () => {
      // Remove classe ativa de todos os botões
      botoesPais.forEach(btn => btn.classList.remove("active"));
      // Adiciona classe ativa a este botão
      botaoTodos.classList.add("active");
      // Renderiza todas as músicas
      renderMusicList(callbackSelectMusic);
    });
  }
  
  // Configurar os outros botões para filtrar por país
  botoesPais.forEach(botao => {
    const img = botao.querySelector("img");
    if (!img) return;
    
    const paisAlt = img.alt;
    const paisCodigo = mapeamentoPaises[paisAlt];
    
    if (!paisCodigo || paisAlt === "outros") return; // Pula o botão "outros" que já configuramos
    
    botao.addEventListener("click", () => {
      // Remove classe ativa de todos os botões
      botoesPais.forEach(btn => btn.classList.remove("active"));
      // Adiciona classe ativa a este botão
      botao.classList.add("active");
      // Renderiza apenas músicas deste país
      renderMusicList(callbackSelectMusic, paisCodigo);
    });
  });
  
  // Adiciona a classe active ao botão "Todos" inicialmente
  if (botaoTodos) {
    botaoTodos.classList.add("active");
  }
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

export function renderMusicList(callbackSelectMusic, countryFilter = null) {
  const container = document.getElementById("music-list");
  if (!container) return;
  
  // Debug para verificar dados das músicas
  console.log("Todas as músicas:", allMusicas);
  // Verificação específica da propriedade artista em cada música
  allMusicas.forEach(m => {
    console.log(`Música: ${m.titulo}, Artista: [${m.artista}], País: [${m.country}], Tipo: ${typeof m.artista}`);
  });
  
  const searchInput = document.getElementById("search-input");
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
  
  // Aplicar filtro por país e pesquisa
  const filtered = allMusicas.filter(musica => {
    const matchesSearch = musica.titulo.toLowerCase().includes(searchTerm);
    const matchesCountry = countryFilter ? musica.country === countryFilter : true;
    return matchesSearch && matchesCountry;
  });
  
  if (filtered.length === 0) {
    container.innerHTML = '<div class="no-results">Nenhuma música encontrada</div>';
    return;
  }
  
  container.innerHTML = ''; // Limpar conteúdo existente
  
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

export function renderCountryFilters(parentElement, callbackSelectMusic) {
  if (!parentElement) return;
  
  // Limpar filtros existentes
  parentElement.innerHTML = '';
  
  // Coletar países únicos das músicas
  const countries = [...new Set(allMusicas.map(musica => musica.country).filter(Boolean))];
  
  // Criar botão "Todos"
  const allButton = document.createElement('button');
  allButton.textContent = 'Todos';
  allButton.className = 'country-filter active';
  allButton.onclick = () => {
    // Remove classe ativa de todos os botões
    document.querySelectorAll('.country-filter').forEach(btn => btn.classList.remove('active'));
    // Adiciona classe ativa a este botão
    allButton.classList.add('active');
    // Renderiza todas as músicas
    renderMusicList(callbackSelectMusic);
  };
  parentElement.appendChild(allButton);
  
  // Criar botão para cada país
  countries.forEach(country => {
    const button = document.createElement('button');
    button.textContent = country;
    button.className = 'country-filter';
    button.onclick = () => {
      // Remove classe ativa de todos os botões
      document.querySelectorAll('.country-filter').forEach(btn => btn.classList.remove('active'));
      // Adiciona classe ativa a este botão
      button.classList.add('active');
      // Renderiza apenas músicas deste país
      renderMusicList(callbackSelectMusic, country);
    };
    parentElement.appendChild(button);
  });
}



