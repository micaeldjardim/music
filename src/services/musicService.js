import { getMusicas } from "./firebase.js";
import { extrairVideoIdETempo } from "../components/player.js";

let allMusicas = [];
let navegarParaHomeFunction = null;

export function setHomeNavigation(fn) {
  navegarParaHomeFunction = fn;
}

export async function carregarMusicas(callbackSelectMusic) {
  allMusicas = await getMusicas();
  window.allMusicas = allMusicas;
  
  renderMusicList(callbackSelectMusic);
  configurarBotoesCountry(callbackSelectMusic);
  
  return allMusicas;
}

function configurarBotoesCountry(callbackSelectMusic) {
  const botoesPais = document.querySelectorAll(".country-btn");
  
  if (botoesPais.length === 0) return;
  
  const mapeamentoPaises = {
    "EUA": "USA",
    "CAN": "Canada",
    "UK": "UK", 
    "AU": "Australia"
  };
  
  const paisesMapeados = Object.values(mapeamentoPaises);
  
  const botaoOutros = Array.from(botoesPais).find(btn => btn.querySelector('img').alt === "outros");
  if (botaoOutros) {
    botaoOutros.addEventListener("click", () => {
      if (botaoOutros.classList.contains("active")) {
        botaoOutros.classList.remove("active");
        renderMusicList(callbackSelectMusic);
      } else {
        botoesPais.forEach(btn => btn.classList.remove("active"));
        botaoOutros.classList.add("active");
        renderMusicList(callbackSelectMusic, null, paisesMapeados);
      }
    });
  }
  
  botoesPais.forEach(botao => {
    const img = botao.querySelector("img");
    if (!img) return;
    
    const paisAlt = img.alt;
    const paisCodigo = mapeamentoPaises[paisAlt];
    
    if (!paisCodigo || paisAlt === "outros") return;
    
    botao.addEventListener("click", () => {
      if (botao.classList.contains("active")) {
        botao.classList.remove("active");
        renderMusicList(callbackSelectMusic);
      } else {
        botoesPais.forEach(btn => btn.classList.remove("active"));
        botao.classList.add("active");
        renderMusicList(callbackSelectMusic, paisCodigo);
      }
    });
  });
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

export function renderMusicList(callbackSelectMusic, countryFilter = null, excludeCountries = null) {
  const container = document.getElementById("music-list");
  if (!container) return;
  
  const searchInput = document.getElementById("search-input");
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
  
  const filtered = allMusicas.filter(musica => {
    const matchesSearch = musica.titulo.toLowerCase().includes(searchTerm);
    
    let matchesCountry = true;
    if (countryFilter) {
      matchesCountry = musica.country === countryFilter;
    } else if (excludeCountries) {
      matchesCountry = !excludeCountries.includes(musica.country);
    }
    
    return matchesSearch && matchesCountry;
  });
  
  if (filtered.length === 0) {
    container.innerHTML = '<div class="no-results">Nenhuma música encontrada</div>';
    return;
  }
  
  container.innerHTML = '';
  
  filtered.forEach(musica => {
    const videoId = extrairVideoIdETempo(musica.URL).videoId;
    const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "";
    const div = document.createElement("div");
    div.className = "music-thumb";
    
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

    const artist = document.createElement("div");
    artist.className = "music-artist-thumb";
    artist.textContent = ((musica.artista || musica.artist || "").trim()) || "Artista Desconhecido";
    textContainer.appendChild(artist);
    
    div.appendChild(textContainer);
    
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
  
  parentElement.innerHTML = '';
  
  const countries = [...new Set(allMusicas.map(musica => musica.country).filter(Boolean))];
  
  const allButton = document.createElement('button');
  allButton.textContent = 'Todos';
  allButton.className = 'country-filter active';
  allButton.onclick = () => {
    document.querySelectorAll('.country-filter').forEach(btn => btn.classList.remove('active'));
    allButton.classList.add('active');
    renderMusicList(callbackSelectMusic);
  };
  parentElement.appendChild(allButton);
  
  countries.forEach(country => {
    const button = document.createElement('button');
    button.textContent = country;
    button.className = 'country-filter';
    button.onclick = () => {
      document.querySelectorAll('.country-filter').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      renderMusicList(callbackSelectMusic, country);
    };
    parentElement.appendChild(button);
  });
}