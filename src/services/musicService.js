import { getMusicas } from "./firebase.js";
import { extrairVideoId, extrairVideoIdETempo } from "../components/player.js";

let allMusicas = [];
let navegarParaHomeFunction = null;

// Variáveis para rastrear filtros ativos
let filtroCountryAtivo = null;
let filtroExcludeCountriesAtivo = null;
let filtroDificuldadeAtivo = null;
let filtroGrammarAtivo = null;
let filtroEstiloAtivo = null;
let filtroTextoAtivo = "";

// Função auxiliar para normalizar texto (remover acentos e converter para minúsculas)
function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';
  return text.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')  // Remove acentos
            .toLowerCase()
            .trim();
}

export function setHomeNavigation(fn) {
  navegarParaHomeFunction = fn;
}

export async function carregarMusicas(callbackSelectMusic) {
  allMusicas = await getMusicas();
  window.allMusicas = allMusicas;

  // 🛠 Garante que todas as músicas tenham ID
  allMusicas = allMusicas.map(musica => {
    if (!musica.id) {
      musica.id = gerarIdTemporario(musica);
    }
    return musica;
  });
  
  // Verificação dos valores de gramática disponíveis
  const gramaticas = new Set();
  const niveis = new Set();
  
  console.log("Verificando gramáticas e níveis disponíveis:");
  
  // Número de músicas com gramática definida
  let musicasComGramatica = 0;
  
  allMusicas.forEach(musica => {
    // Coleta gramáticas
    if (musica.grammar) {
      if (Array.isArray(musica.grammar)) {
        musica.grammar.forEach(g => {
          if (typeof g === 'string' && g.trim() !== '') {
            gramaticas.add(normalizeText(g));
          }
        });
      } else if (typeof musica.grammar === 'string' && musica.grammar.trim() !== '') {
        gramaticas.add(normalizeText(musica.grammar));
      }
      musicasComGramatica++;
    }
    
    // Coleta níveis
    if (musica.level && typeof musica.level === 'string' && musica.level.trim() !== '') {
      niveis.add(normalizeText(musica.level));
    }
  });
  
  console.log(`${musicasComGramatica} de ${allMusicas.length} músicas têm gramática definida`);
  console.log("Gramáticas disponíveis:", Array.from(gramaticas));
  console.log("Níveis disponíveis:", Array.from(niveis));
  
  // Configura a busca por texto
  configurarCampoBusca(callbackSelectMusic);
  
  // Configura os filtros
  renderMusicList(callbackSelectMusic);
  configurarBotoesCountry(callbackSelectMusic);
  configurarBotoesDificuldade(callbackSelectMusic);
  configurarBotoesGrammar(callbackSelectMusic, gramaticas);
  configurarBotoesEstilo(callbackSelectMusic);

  
  return allMusicas;
}


function configurarCampoBusca(callbackSelectMusic) {
  const searchInput = document.getElementById("search-input");
  if (!searchInput) return;
  
  // Adiciona event listener para detectar mudanças no campo de busca com normalização
  searchInput.addEventListener("input", function() {
    filtroTextoAtivo = normalizeText(this.value);
    renderMusicList(callbackSelectMusic);
  });
}


function configurarBotoesEstilo(callbackSelectMusic) {
  const botoesEstilo = document.querySelectorAll(".style-btn");
  
  if (botoesEstilo.length === 0) return;
  
  // Verificar quais estilos existem nas músicas
  const estilosDisponiveis = new Set();
  allMusicas.forEach(musica => {
    if (musica.style && typeof musica.style === 'string' && musica.style.trim() !== '') {
      estilosDisponiveis.add(normalizeText(musica.style));
    }
  });
  
  botoesEstilo.forEach(botao => {
    const textoEstilo = botao.getAttribute('title') || '';
    const estiloExiste = Array.from(estilosDisponiveis).some(
      estilo => estilo === normalizeText(textoEstilo)

    );
    
    // Marca botões sem músicas correspondentes
    if (!estiloExiste) {
      botao.classList.add("no-matches");
      botao.title = "Não há músicas com este estilo";
    }
    
    botao.addEventListener("click", () => {

      if (botao.classList.contains("active")) {
        // Desativa o filtro
        botao.classList.remove("active");
        filtroEstiloAtivo = null;
        renderMusicList(callbackSelectMusic);

      } else {
        // Ativa o novo filtro
        botoesEstilo.forEach(btn => btn.classList.remove("active"));
        botao.classList.add("active");
        filtroEstiloAtivo = textoEstilo;
        renderMusicList(callbackSelectMusic);

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
        renderMusicList(callbackSelectMusic);
      } else {
        botoesPais.forEach(btn => btn.classList.remove("active"));
        botaoOutros.classList.add("active");
        filtroCountryAtivo = null;
        filtroExcludeCountriesAtivo = paisesMapeados;
        renderMusicList(callbackSelectMusic);
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
        renderMusicList(callbackSelectMusic);
      } else {
        botoesPais.forEach(btn => btn.classList.remove("active"));
        botao.classList.add("active");
        filtroCountryAtivo = paisCodigo;
        filtroExcludeCountriesAtivo = null;
        renderMusicList(callbackSelectMusic);
      }
    });
  });
}

function configurarBotoesDificuldade(callbackSelectMusic) {
  const botoesDificuldade = document.querySelectorAll(".dificult-btn");
  
  if (botoesDificuldade.length === 0) return;
  
  const mapeamentoDificuldades = {
    "Fácil": "Fácil",
    "Médio": "Médio",
    "Difícil": "Difícil",
    "Muito Difícil": "Muito Difícil"
  };
  
  botoesDificuldade.forEach(botao => {
    const tituloDificuldade = botao.getAttribute('title') || '';
    const valorDificuldade = mapeamentoDificuldades[tituloDificuldade] || tituloDificuldade;

    
    botao.addEventListener("click", () => {
      if (botao.classList.contains("active")) {
        botao.classList.remove("active");
        filtroDificuldadeAtivo = null;
        renderMusicList(callbackSelectMusic);
      } else {
        botoesDificuldade.forEach(btn => btn.classList.remove("active"));
        botao.classList.add("active");
        filtroDificuldadeAtivo = valorDificuldade;
        renderMusicList(callbackSelectMusic);
      }
    });
  });
}

function configurarBotoesGrammar(callbackSelectMusic, gramaticasDisponiveis) {
  const botoesGrammar = document.querySelectorAll(".grammar-btn");
  
  if (botoesGrammar.length === 0) return;
  
  botoesGrammar.forEach(botao => {
    const textoGrammar = botao.textContent.trim();
    const gramaticaExiste = Array.from(gramaticasDisponiveis || []).some(
      g => g === normalizeText(textoGrammar)
    );
    
    // Adicionar classe visual para botões sem músicas correspondentes
    if (!gramaticaExiste) {
      botao.classList.add("no-matches");
      botao.title = "Não há músicas com esta gramática";
    }
    
    botao.addEventListener("click", () => {
      if (botao.classList.contains("active")) {
        // Desativar o filtro atual
        botao.classList.remove("active");
        filtroGrammarAtivo = null;
        renderMusicList(callbackSelectMusic);
      } else {
        // Ativar um novo filtro
        botoesGrammar.forEach(btn => btn.classList.remove("active"));
        botao.classList.add("active");
        filtroGrammarAtivo = textoGrammar;
        renderMusicList(callbackSelectMusic);
      }
    });
  });
}


// Função para aplicar todos os filtros simultâneamente
export function renderMusicList(callbackCarregarMusica) {
  const container = document.getElementById("music-list");
  if (!container) return;
  
  // Aplica todos os filtros
  const filtered = allMusicas.filter(musica => {
    // Filtro de texto na busca (case insensitive e sem acentos)
    const searchTerm = normalizeText(filtroTextoAtivo);
    
    // Verifica se o termo de busca corresponde ao título, artista, estilo, gramática ou nível
    const matchesTitulo = normalizeText(musica.titulo || "").includes(searchTerm);
    const matchesArtista = normalizeText(musica.artist || musica.artista || "").includes(searchTerm);
    const matchesEstilo = normalizeText(musica.style || "").includes(searchTerm);
    
    // Busca em gramáticas (pode ser array ou string) - com case insensitive e sem acentos
    let matchesGrammarSearch = false;
    if (searchTerm && musica.grammar) {
      if (Array.isArray(musica.grammar)) {
        matchesGrammarSearch = musica.grammar.some(g => 
          typeof g === 'string' && normalizeText(g).includes(searchTerm)
        );
      } else if (typeof musica.grammar === 'string') {
        matchesGrammarSearch = normalizeText(musica.grammar).includes(searchTerm);
      }
    }
    
    // Busca no nível de dificuldade - com case insensitive e sem acentos
    const matchesLevel = searchTerm && normalizeText(musica.level || "").includes(searchTerm);
    
    // Combina todos os critérios de busca por texto
    const matchesSearch = !searchTerm || matchesTitulo || matchesArtista || matchesEstilo || 
                          matchesGrammarSearch || matchesLevel;
    
    // Filtro de país - com case insensitive e sem acentos
    let matchesCountry = true;
    if (filtroCountryAtivo) {
      matchesCountry = normalizeText(musica.country || "") === normalizeText(filtroCountryAtivo);
    } else if (filtroExcludeCountriesAtivo) {
      matchesCountry = !filtroExcludeCountriesAtivo.some(pais => 
        normalizeText(musica.country || "") === normalizeText(pais)
      );
    }
    

    // Filtro de dificuldade - com case insensitive e sem acentos
    let matchesDificuldade = true;
    if (filtroDificuldadeAtivo) {
      matchesDificuldade = normalizeText(musica.level || "") === normalizeText(filtroDificuldadeAtivo);
    }
    
    // Filtro de gramática específico (botões) - com case insensitive e sem acentos
    let matchesGrammarFilter = true;
    if (filtroGrammarAtivo) {
      const filtroGrammar = normalizeText(filtroGrammarAtivo);
      
      if (Array.isArray(musica.grammar)) {
        matchesGrammarFilter = musica.grammar.some(g => 
          (typeof g === 'string') && normalizeText(g).includes(filtroGrammar)
        );
      } else {
        const musicaGrammar = typeof musica.grammar === 'string' ? 
                             normalizeText(musica.grammar) : '';
        matchesGrammarFilter = musicaGrammar.includes(filtroGrammar);
      }
    }
    
    // Filtro de estilo musical - com case insensitive e sem acentos
    let matchesEstiloFilter = true;
    if (filtroEstiloAtivo) {
      matchesEstiloFilter = normalizeText(musica.style || "") === normalizeText(filtroEstiloAtivo);
    }
    
    // Combina todos os filtros
    return matchesSearch && matchesCountry && matchesDificuldade && 
           matchesGrammarFilter && matchesEstiloFilter;
  });
  
  // Adicionar informação sobre filtros ativos quando houver pouco ou nenhum resultado
  if (filtered.length <= 5) {
    const filtrosAtivos = [];
    if (filtroTextoAtivo) filtrosAtivos.push(`Texto: "${filtroTextoAtivo}"`);
    if (filtroCountryAtivo) filtrosAtivos.push(`País: ${filtroCountryAtivo}`);
    if (filtroDificuldadeAtivo) filtrosAtivos.push(`Dificuldade: ${filtroDificuldadeAtivo}`);
    if (filtroGrammarAtivo) filtrosAtivos.push(`Gramática: ${filtroGrammarAtivo}`);
    if (filtroEstiloAtivo) filtrosAtivos.push(`Estilo: ${filtroEstiloAtivo}`);
    
    if (filtrosAtivos.length > 0) {
      console.log(`Filtros ativos: ${filtrosAtivos.join(', ')}`);
    }
  }
  
  console.log(`Filtro aplicado: ${filtered.length} músicas encontradas de ${allMusicas.length}`);
  
  if (filtered.length === 0) {
    container.innerHTML = '<div class="no-results">Nenhuma música encontrada com os filtros atuais</div>';
    return;
  }
  
  container.innerHTML = '';
  
  filtered.forEach(musica => {
    const musicElement = document.createElement('div');
    musicElement.className = 'music-item';
    
    musicElement.onclick = () => {
      navegarParaMusica(musica); // Usar diretamente a função de navegação
    };
    
    renderMusicCard(musica, container, callbackCarregarMusica);
  });
}

// Função para renderizar o card de uma música
function renderMusicCard(musica, container, callbackSelectMusic) {
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
    let countryCode = "world"; // Padrão para países não mapeados
    
    const countryNormalized = normalizeText(musica.country);
    if (countryNormalized === "usa") countryCode = "EUA";
    else if (countryNormalized === "canada") countryCode = "CAN";
    else if (countryNormalized === "uk") countryCode = "UK";
    else if (countryNormalized === "australia") countryCode = "AU";

    
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
  
  const textContainer = document.createElement("div");
  textContainer.className = "text-container";
  
  if (thumbUrl) {
    const img = document.createElement("img");
    img.src = thumbUrl;
    img.alt = musica.titulo;
    img.loading = "lazy"; // Carregamento de imagem otimizado
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
  
  // Mostrar o nível de dificuldade com ícone
  if (musica.level) {
    const difficulty = document.createElement("div");
    difficulty.className = "music-difficulty";
    
    const difficultyImg = document.createElement("img");
    const levelMapping = {
      "facil": "./img/Fácil.webp",
      "medio": "./img/Médio.webp",
      "dificil": "./img/Difícil.webp",
      "muito dificil": "./img/Muito Difícil.webp"
    };
    
    // Usa a versão normalizada para comparação
    const levelKey = normalizeText(musica.level);
    difficultyImg.src = levelMapping[levelKey] || "./img/Fácil.webp";
    difficultyImg.alt = musica.level;
    difficultyImg.title = `Dificuldade: ${musica.level}`;
    difficultyImg.style.width = "30px"; 
    difficultyImg.style.height = "30px";
    difficultyImg.loading = "lazy";
    
    difficulty.appendChild(difficultyImg);
    textContainer.appendChild(difficulty);
  }
  
  // Mostrar a gramática
  if (musica.grammar) {
    const grammar = document.createElement("div");
    grammar.className = "music-grammar";
    
    if (Array.isArray(musica.grammar)) {
      if (musica.grammar.length > 3) {
        // Cria versão limitada com 3 primeiras gramáticas
        const limitedGrammars = musica.grammar.slice(0, 3).join(', ');
        const badgeCount = musica.grammar.length - 3;
        grammar.innerHTML = `${limitedGrammars} <span class="grammar-badge">+${badgeCount}</span>`;
        grammar.title = musica.grammar.join(', ');
        
        // Eventos para expandir/contrair informação
        grammar.addEventListener('mouseover', function() {
          this.dataset.originalHtml = this.innerHTML;
          this.textContent = musica.grammar.join(', ');
          this.classList.add('expanded');
        });
        
        grammar.addEventListener('mouseout', function() {
          this.innerHTML = this.dataset.originalHtml;
          this.classList.remove('expanded');
        });
      } else {
        grammar.textContent = musica.grammar.join(', ');
      }
    } else {
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
}

// Melhoria na função para buscar músicas de múltiplas fontes
export function encontrarMusicaPorId(id) {
  // Log para depuração
  console.log("Buscando música com ID:", id);
  
  // Tentativa 1: Buscar no estado da aplicação (memória)
  try {
    const musicasEmMemoria = window.musicasList || [];
    const musicaMemoria = musicasEmMemoria.find(m => m.id === id);
    if (musicaMemoria) {
      console.log("Música encontrada em memória:", musicaMemoria.titulo);
      return musicaMemoria;
    }
  } catch (error) {
    console.warn("Erro ao buscar em memória:", error);
  }

  // Tentativa 2: Buscar no localStorage
  try {
    // Verificar música única
    const musicaArmazenada = localStorage.getItem(`musica_${id}`);
    if (musicaArmazenada) {
      const musica = JSON.parse(musicaArmazenada);
      console.log("Música encontrada no localStorage (item único):", musica.titulo);
      return musica;
    }
    
    // Verificar na lista completa
    const musicListStr = localStorage.getItem('musicList');
    if (musicListStr) {
      const musicList = JSON.parse(musicListStr);
      const musica = musicList.find(m => m.id === id);
      if (musica) {
        console.log("Música encontrada no localStorage (lista):", musica.titulo);
        return musica;
      }
    }
  } catch (error) {
    console.warn("Erro ao buscar no localStorage:", error);
  }

  // Tentativa 3: Buscar no sessionStorage (caso seja usado)
  try {
    const sessionData = sessionStorage.getItem(`musica_${id}`);
    if (sessionData) {
      const musica = JSON.parse(sessionData);
      console.log("Música encontrada no sessionStorage:", musica.titulo);
      return musica;
    }
  } catch (error) {
    console.warn("Erro ao buscar no sessionStorage:", error);
  }

  // Se nada foi encontrado, tente uma busca assíncrona no Firestore
  buscarMusicaFirestore(id);
  
  console.error("Música não encontrada em nenhuma fonte de dados local:", id);
  return null;
}

// Função para buscar músicas no Firestore
async function buscarMusicaFirestore(id) {
  try {
    // Verificar se temos acesso ao Firebase
    if (!window.firebaseDB) {
      console.error("Firebase não está inicializado");
      return null;
    }

    const { collection, query, where, getDocs } = await import("https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js");
    
    // Busca na coleção de músicas
    const musicasRef = collection(window.firebaseDB, "musicas");
    const q = query(musicasRef, where("id", "==", id));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const musicaDoc = querySnapshot.docs[0];
      const musicaData = musicaDoc.data();
      console.log("Música encontrada no Firestore:", musicaData.titulo);
      
      // Salvar localmente para futuras consultas
      localStorage.setItem(`musica_${id}`, JSON.stringify(musicaData));
      
      // Redirecionar ou chamar função de carregamento
      window.location.reload(); // Recarrega a página para usar a música recém-encontrada
      return musicaData;
    }
    
    console.log("Música não encontrada no Firestore");
    return null;
  } catch (error) {
    console.error("Erro ao buscar no Firestore:", error);
    return null;
  }
}

export function mostrarTelaInicial() {
  document.getElementById("screen-home").style.display = "block";
  document.getElementById("screen-drag").style.display = "none";
  
  // Restaurar a visibilidade da hero-section
  const heroSection = document.querySelector('.hero-section');
  if (heroSection) {
    heroSection.style.display = "flex"; // Usa flex em vez de block para manter o layout correto
    
    // Remove qualquer estilo inline que possa estar causando problemas
    heroSection.style.textAlign = "";
    heroSection.style.justifyContent = "";
    heroSection.style.alignItems = "";
    heroSection.style.margin = "";
    heroSection.style.position = "";
    heroSection.style.width = "";
  }
  
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