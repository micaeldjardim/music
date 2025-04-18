import { getMusicas } from "./firebase.js";
import { extrairVideoId, extrairVideoIdETempo } from "../components/player.js";

let allMusicas = [];
let navegarParaHomeFunction = null;

let filtroCountryAtivo = null;
let filtroExcludeCountriesAtivo = null;
let filtroDificuldadeAtivo = null;
let filtroGrammarAtivo = null; // Nova variável para rastrear o filtro de gramática
let filtroEstiloAtivo = null; // Nova variável para rastrear o filtro de estilo


export function setHomeNavigation(fn) {
  navegarParaHomeFunction = fn;
}

export async function carregarMusicas(callbackSelectMusic) {
  allMusicas = await getMusicas();
  window.allMusicas = allMusicas;
  
  // Verificação dos valores de gramática disponíveis
  const gramaticas = new Set();
  console.log("Verificando gramáticas em cada música:");
  
  // Número de músicas com gramática definida
  let musicasComGramatica = 0;
  
  allMusicas.forEach(musica => {
    if (musica.grammar) {
      // Verifica se a gramática é um array ou uma string
      if (Array.isArray(musica.grammar)) {
        musica.grammar.forEach(g => {
          if (typeof g === 'string' && g.trim() !== '') {
            gramaticas.add(g.toLowerCase());
          }
        });
        console.log(`Música: "${musica.titulo}" - Gramáticas: [${musica.grammar.join(', ')}]`);
      } else if (typeof musica.grammar === 'string' && musica.grammar.trim() !== '') {
        gramaticas.add(musica.grammar.toLowerCase());
        console.log(`Música: "${musica.titulo}" - Gramática: "${musica.grammar}"`);
      }
      musicasComGramatica++;
    } else {
      console.log(`Música: "${musica.titulo}" - Sem gramática definida`);
    }
  });
  
  console.log(`${musicasComGramatica} de ${allMusicas.length} músicas têm gramática definida`);
  console.log("Gramáticas disponíveis:", Array.from(gramaticas));
  
  renderMusicList(callbackSelectMusic);
  configurarBotoesCountry(callbackSelectMusic);
  configurarBotoesDificuldade(callbackSelectMusic);
  configurarBotoesGrammar(callbackSelectMusic, gramaticas);
  configurarBotoesEstilo(callbackSelectMusic); // Nova função para configurar botões de estilo
  
  return allMusicas;
}

function configurarBotoesEstilo(callbackSelectMusic) {
  const botoesEstilo = document.querySelectorAll(".style-btn");
  
  if (botoesEstilo.length === 0) return;
  
  console.log("Configurando botões de estilo:", botoesEstilo.length, "botões encontrados");
  
  // Verificar quais estilos existem nas músicas
  const estilosDisponiveis = new Set();
  allMusicas.forEach(musica => {
    if (musica.style) {
      estilosDisponiveis.add(musica.style.toLowerCase());
    }
  });
  
  console.log("Estilos disponíveis:", Array.from(estilosDisponiveis));
  
  botoesEstilo.forEach(botao => {
    const textoEstilo = botao.textContent.trim();
    const estiloExiste = Array.from(estilosDisponiveis).some(
      estilo => estilo.toLowerCase() === textoEstilo.toLowerCase()
    );
    
    // Marca botões sem músicas correspondentes
    if (!estiloExiste) {
      botao.classList.add("no-matches");
      botao.title = "Não há músicas com este estilo";
    }
    
    botao.addEventListener("click", () => {
      console.log(`Botão de estilo "${textoEstilo}" clicado`);
      
      if (botao.classList.contains("active")) {
        // Desativa o filtro
        botao.classList.remove("active");
        filtroEstiloAtivo = null;
        console.log("Removendo filtro de estilo");
        renderMusicList(callbackSelectMusic, filtroCountryAtivo, filtroExcludeCountriesAtivo, 
                      filtroDificuldadeAtivo, filtroGrammarAtivo);
      } else {
        // Ativa o novo filtro
        botoesEstilo.forEach(btn => btn.classList.remove("active"));
        botao.classList.add("active");
        filtroEstiloAtivo = textoEstilo;
        console.log(`Aplicando filtro de estilo: "${textoEstilo}"`);
        renderMusicList(callbackSelectMusic, filtroCountryAtivo, filtroExcludeCountriesAtivo, 
                      filtroDificuldadeAtivo, filtroGrammarAtivo);
      }
    });
  });
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
  
  const botaoOutros = Array.from(botoesPais).find(btn => btn.querySelector('img')?.alt === "outros");
  if (botaoOutros) {
    botaoOutros.addEventListener("click", () => {
      if (botaoOutros.classList.contains("active")) {
        botaoOutros.classList.remove("active");
        filtroCountryAtivo = null;
        filtroExcludeCountriesAtivo = null;
        renderMusicList(callbackSelectMusic, null, null, filtroDificuldadeAtivo, filtroGrammarAtivo);
      } else {
        botoesPais.forEach(btn => btn.classList.remove("active"));
        botaoOutros.classList.add("active");
        filtroCountryAtivo = null;
        filtroExcludeCountriesAtivo = paisesMapeados;
        renderMusicList(callbackSelectMusic, null, paisesMapeados, filtroDificuldadeAtivo, filtroGrammarAtivo);
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
        filtroCountryAtivo = null;
        renderMusicList(callbackSelectMusic, null, null, filtroDificuldadeAtivo, filtroGrammarAtivo);
      } else {
        botoesPais.forEach(btn => btn.classList.remove("active"));
        botao.classList.add("active");
        filtroCountryAtivo = paisCodigo;
        filtroExcludeCountriesAtivo = null;
        renderMusicList(callbackSelectMusic, paisCodigo, null, filtroDificuldadeAtivo, filtroGrammarAtivo);
      }
    });
  });
}

function configurarBotoesDificuldade(callbackSelectMusic) {
  const botoesDificuldade = document.querySelectorAll(".dificult-btn");
  
  if (botoesDificuldade.length === 0) return;
  
  // Mapeamento dos títulos dos botões para os valores que podem estar no Firebase
  const mapeamentoDificuldades = {
    "Fácil": "Fácil",
    "Médio": "Médio",
    "Difícil": "Difícil",
    "Muito Difícil": "Muito Difícil"
  };
  
  botoesDificuldade.forEach(botao => {
    const tituloDificuldade = botao.getAttribute('title') || '';
    const valorDificuldade = mapeamentoDificuldades[tituloDificuldade] || tituloDificuldade.toLowerCase();
    
    botao.addEventListener("click", () => {
      if (botao.classList.contains("active")) {
        botao.classList.remove("active");
        filtroDificuldadeAtivo = null;
        renderMusicList(callbackSelectMusic, filtroCountryAtivo, filtroExcludeCountriesAtivo, null, filtroGrammarAtivo);
      } else {
        botoesDificuldade.forEach(btn => btn.classList.remove("active"));
        botao.classList.add("active");
        filtroDificuldadeAtivo = valorDificuldade;
        renderMusicList(callbackSelectMusic, filtroCountryAtivo, filtroExcludeCountriesAtivo, valorDificuldade, filtroGrammarAtivo);
      }
    });
  });
}

// Modificar a função para aceitar as gramáticas disponíveis
function configurarBotoesGrammar(callbackSelectMusic, gramaticasDisponiveis) {
  const botoesGrammar = document.querySelectorAll(".grammar-btn");
  
  if (botoesGrammar.length === 0) return;
  
  console.log("Configurando botões de gramática:", botoesGrammar.length, "botões encontrados");

  botoesGrammar.forEach(botao => {
    const textoGrammar = botao.textContent.trim();
    const gramaticaExiste = Array.from(gramaticasDisponiveis || []).some(
      g => g.toLowerCase() === textoGrammar.toLowerCase()
    );
    
    // Adicionar classe visual para botões sem músicas correspondentes
    if (!gramaticaExiste) {
      botao.classList.add("no-matches");
      botao.title = "Não há músicas com esta gramática";
    }
    
    botao.addEventListener("click", () => {
      console.log(`Botão de gramática "${textoGrammar}" clicado`);
      
      if (botao.classList.contains("active")) {
        // Desativar o filtro atual
        botao.classList.remove("active");
        filtroGrammarAtivo = null;
        console.log("Removendo filtro de gramática");
        renderMusicList(callbackSelectMusic, filtroCountryAtivo, filtroExcludeCountriesAtivo, filtroDificuldadeAtivo, null);
      } else {
        // Ativar um novo filtro
        botoesGrammar.forEach(btn => btn.classList.remove("active"));
        botao.classList.add("active");
        filtroGrammarAtivo = textoGrammar;
        console.log(`Aplicando filtro de gramática: "${textoGrammar}"`);
        renderMusicList(callbackSelectMusic, filtroCountryAtivo, filtroExcludeCountriesAtivo, filtroDificuldadeAtivo, textoGrammar);
      }
    });
  });
}

// Função renderMusicList corrigida para lidar com arrays de gramática e filtro de estilo
export function renderMusicList(callbackSelectMusic, countryFilter = null, excludeCountries = null, dificuldadeFilter = null, grammarFilter = null) {
  const container = document.getElementById("music-list");
  if (!container) return;
  
  const searchInput = document.getElementById("search-input");
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
  
  console.log("Filtros aplicados:", { countryFilter, excludeCountries, dificuldadeFilter, grammarFilter, estiloFilter: filtroEstiloAtivo });
  
  const filtered = allMusicas.filter(musica => {
    // Busca por título, estilo musical ou artista
    const matchesSearch = musica.titulo.toLowerCase().includes(searchTerm) || 
                         (musica.style && musica.style.toLowerCase().includes(searchTerm)) ||
                         ((musica.artist || musica.artista || "").toLowerCase().includes(searchTerm));
    
    let matchesCountry = true;
    if (countryFilter) {
      matchesCountry = musica.country === countryFilter;
    } else if (excludeCountries) {
      matchesCountry = !excludeCountries.includes(musica.country);
    }
    
    let matchesDificuldade = true;
    if (dificuldadeFilter) {
      matchesDificuldade = (musica.level || "").toLowerCase() === dificuldadeFilter.toLowerCase();
    }
    
    let matchesGrammar = true;
    if (grammarFilter) {
      const filtroGrammar = typeof grammarFilter === 'string' ? grammarFilter.toLowerCase() : '';
      
      // Verifica se a música tem a gramática no array ou como string
      if (Array.isArray(musica.grammar)) {
        matchesGrammar = musica.grammar.some(g => 
          (typeof g === 'string') && g.toLowerCase().includes(filtroGrammar)
        );
        
        console.log(`Comparando gramática: música=[${musica.grammar.map(g => `"${g}"`).join(', ')}] (${musica.titulo}) com filtro="${filtroGrammar}" = ${matchesGrammar}`);
      } else {
        // Proteção contra undefined ou tipos não-string
        const musicaGrammar = typeof musica.grammar === 'string' ? musica.grammar.toLowerCase() : '';
        matchesGrammar = musicaGrammar.includes(filtroGrammar);
        
        console.log(`Comparando gramática: música="${musicaGrammar}" (${musica.titulo}) com filtro="${filtroGrammar}" = ${matchesGrammar}`);
      }
    }
    
    // Filtro de estilo musical
    let matchesEstilo = true;
    if (filtroEstiloAtivo) {
      matchesEstilo = musica.style && musica.style.toLowerCase() === filtroEstiloAtivo.toLowerCase();
      
      if (matchesEstilo) {
        console.log(`Música "${musica.titulo}" corresponde ao filtro de estilo "${filtroEstiloAtivo}"`);
      }
    }
    
    return matchesSearch && matchesCountry && matchesDificuldade && matchesGrammar && matchesEstilo;
  });
  
  console.log(`Filtro aplicado: ${filtered.length} músicas encontradas de ${allMusicas.length}`);
  
  if (filtered.length === 0) {
    container.innerHTML = '<div class="no-results">Nenhuma música encontrada</div>';
    return;
  }
  
  container.innerHTML = '';
  
  filtered.forEach(musica => {
    // Construir card da música
    const result = extrairVideoId(musica.URL) || extrairVideoIdETempo(musica.URL);
    const videoId = result ? result.videoId : null;

    const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "";
    
    const div = document.createElement("div");
    div.className = "music-thumb";
    
    // Adicionar a bandeira do país (se disponível)
    if (musica.country) {
      const countryDiv = document.createElement("div");
      countryDiv.className = "music-country";
      
      const countryImg = document.createElement("img");
      // Mapeie o país para o caminho da imagem da bandeira
      let countryCode = "world"; // Padrão para países não mapeados
      
      if (musica.country === "USA") countryCode = "EUA";
      else if (musica.country === "Canada") countryCode = "CAN";
      else if (musica.country === "UK") countryCode = "UK";
      else if (musica.country === "Australia") countryCode = "AU";
      
      countryImg.src = `./img/${countryCode}.webp`;
      countryImg.alt = musica.country;
      
      countryDiv.appendChild(countryImg);
      div.appendChild(countryDiv);
    }
    
    // Adicionar badge de estilo musical se existir
    if (musica.style) {
      const styleDiv = document.createElement("div");
      styleDiv.className = "music-style";
      styleDiv.textContent = musica.style;
      div.appendChild(styleDiv);
    }
    
    // Adicionar badge de gramática se existir
    if (musica.grammar) {
      // Se for array, mostrar a primeira gramática
      const grammarText = Array.isArray(musica.grammar) ? 
        (musica.grammar.length > 0 ? musica.grammar[0] : "") : 
        musica.grammar;
    }
    
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
    
    // Mostrar o estilo musical se existir
    if (musica.style) {
      const style = document.createElement("div");
      style.className = "music-style";
      style.textContent = musica.style;
      textContainer.appendChild(style);
    }
    
    // Mostrar o nível de dificuldade com ícone em vez de texto
    if (musica.level) {
      const difficulty = document.createElement("div");
      difficulty.className = "music-difficulty";
      
      // Criar imagem para o nível de dificuldade
      const difficultyImg = document.createElement("img");
      
      // Mapear o nível de dificuldade para o caminho da imagem correspondente
      const levelMapping = {
        "Fácil": "./img/Fácil.webp",
        "Médio": "./img/Médio.webp",
        "Difícil": "./img/Difícil.webp",
        "Muito Difícil": "./img/Muito Difícil.webp"
      };
      
      difficultyImg.src = levelMapping[musica.level] || "./img/Fácil.webp"; // Fallback para Fácil se não encontrar
      difficultyImg.alt = musica.level;
      difficultyImg.title = `Dificuldade: ${musica.level}`;
      
      // Definir tamanho apropriado para o ícone
      difficultyImg.style.width = "20px"; 
      difficultyImg.style.height = "20px";
      
      difficulty.appendChild(difficultyImg);
      textContainer.appendChild(difficulty);
    }
    
    // Mostrar a gramática
    if (musica.grammar) {
      const grammar = document.createElement("div");
      grammar.className = "music-grammar";
      
      // Formatação do texto da gramática
      if (Array.isArray(musica.grammar)) {
        if (musica.grammar.length > 3) {
          // Cria versão limitada com 3 primeiras gramáticas
          const limitedGrammars = musica.grammar.slice(0, 3).join(', ');
          const badgeCount = musica.grammar.length - 3;
          grammar.innerHTML = `${limitedGrammars} <span class="grammar-badge">+${badgeCount}</span>`;
          
          // Adiciona o tooltip com todas as gramáticas
          grammar.title = musica.grammar.join(', ');
          
          // Adiciona evento de mouse over/out para mostrar todas as gramáticas
          grammar.addEventListener('mouseover', function() {
            this.dataset.originalHtml = this.innerHTML;
            this.textContent = musica.grammar.join(', ');
          });
          
          grammar.addEventListener('mouseout', function() {
            this.innerHTML = this.dataset.originalHtml;
          });
        } else {
          // Se tiver 3 ou menos, mostra normalmente
          grammar.textContent = musica.grammar.join(', ');
        }
      } else {
        // Se for string, usa diretamente
        grammar.textContent = musica.grammar;
      }
      
      textContainer.appendChild(grammar);
    }
    
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