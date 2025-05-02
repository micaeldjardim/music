import { encontrarMusicaPorId } from "./services/musicService.js";
import { extrairMusicaIdDaURL } from "./services/routerService.js";
import { exibirLetraDrag } from "./components/dragAndDrop.js";
import { exibirYoutubePlayer, voltar5s, playpause } from "./components/player.js";

// Variáveis globais
let currentMusic = null;

// Expor funções para os buttons da UI
window.voltar5seg = function() {
  if (currentMusic) {
    voltar5s();
  } else {
    console.error("Nenhuma música atual definida.");
  }
};

window.playPause = function() {
  if (currentMusic) {
    playpause();
  } else {
    console.error("Nenhuma música atual definida.");
  }
};

window.proximaMusica = function() {
  console.log("Função próxima música");
  // Implementação da próxima música
};

document.addEventListener('DOMContentLoaded', async () => {
  console.log("Página drag.html carregada");
  
  // Obter o ID da música da URL
  const musicaId = extrairMusicaIdDaURL();
  console.log("ID da música:", musicaId);
  
  if (!musicaId) {
    console.error("Nenhum ID de música fornecido na URL");
    alert("ID da música não encontrado. Voltando para a página inicial.");
    window.location.href = "index.html";
    return;
  }
  
  // Verificar se a música está no localStorage - casos especiais
  const musicaFromStorage = localStorage.getItem('musicaAtual');
  if (musicaFromStorage) {
    try {
      const musica = JSON.parse(musicaFromStorage);
      if (musica && (musica.id === musicaId || !musica.id)) {
        // Se a música atual no localStorage corresponder ao ID ou não tiver ID
        carregarMusica(musica);
        return;
      }
    } catch (e) {
      console.warn("Erro ao parsear música do localStorage:", e);
    }
  }
  
  // Buscar a música pelo ID
  const musica = encontrarMusicaPorId(musicaId);
  
  if (musica) {
    carregarMusica(musica);
  } else {
    // Tentar buscar do Firebase de forma assíncrona
    try {
      console.log("Tentando buscar música diretamente do Firebase...");
      // Você pode implementar a busca direta aqui ou confiar na implementação em encontrarMusicaPorId
      
      // Definir um timeout para redirecionamento caso nada seja encontrado
      setTimeout(() => {
        const verificarNovamente = encontrarMusicaPorId(musicaId);
        if (!verificarNovamente) {
          console.error("Música não encontrada após tentativas. Redirecionando...");
          alert("Música não encontrada. Voltando para a página inicial.");
          window.location.href = "index.html";
        }
      }, 5000); // 5 segundos para tentar buscar
    } catch (error) {
      console.error("Erro ao buscar música:", error);
      alert("Erro ao buscar música. Voltando para a página inicial.");
      window.location.href = "index.html";
    }
  }
});

// Função para preencher os badges com informações da música
function preencherBadges(musica) {
  // Badge de país
  const countryBadge = document.getElementById("music-country-badge");
  countryBadge.innerHTML = '';
  
  if (musica.country) {
    let countryCode = "world"; // Padrão para países não mapeados
    const countryNormalized = musica.country.toLowerCase().trim();
    
    if (countryNormalized === "usa") countryCode = "EUA";
    else if (countryNormalized === "canada") countryCode = "CAN";
    else if (countryNormalized === "uk") countryCode = "UK";
    else if (countryNormalized === "australia") countryCode = "AU";
    
    const countryImg = document.createElement("img");
    countryImg.src = `./img/${countryCode}.webp`;
    countryImg.alt = musica.country;
    countryImg.title = `País: ${musica.country}`;
    countryBadge.appendChild(countryImg);
    countryBadge.style.display = "flex";
  } else {
    countryBadge.style.display = "none";
  }
  
  // Badge de estilo
  const styleBadge = document.getElementById("music-style-badge");
  styleBadge.innerHTML = '';
  
  if (musica.style) {
    const styleNormalized = musica.style.toLowerCase().trim();
    const styleImg = document.createElement("img");
    
    // Mapeamento para imagens de estilos
    const styleImgMap = {
      "pop": "./img/icons_style/pop.webp",
      "rock": "./img/icons_style/rock.webp",
      "rap and hip-hop": "./img/icons_style/rap.webp",
      "country": "./img/icons_style/country.webp",
      "metal and punk": "./img/icons_style/metal.webp",
      "gospel": "./img/icons_style/gospel.webp",
      "reggae": "./img/icons_style/reggae.webp"
    };
    
    styleImg.src = styleImgMap[styleNormalized] || "./img/icons_style/pop.webp";
    styleImg.alt = musica.style;
    styleImg.title = `Estilo: ${musica.style}`;
    styleBadge.appendChild(styleImg);
    styleBadge.style.display = "flex";
  } else {
    styleBadge.style.display = "none";
  }
  
  // Badge de nível de dificuldade
  const levelBadge = document.getElementById("music-level-badge");
  levelBadge.innerHTML = '';
  
  if (musica.level) {
    const levelImg = document.createElement("img");
    const levelNormalized = musica.level.toLowerCase().trim();
    
    const levelMapping = {
      "facil": "./img/Fácil.webp",
      "fácil": "./img/Fácil.webp",
      "medio": "./img/Médio.webp",
      "médio": "./img/Médio.webp",
      "dificil": "./img/Difícil.webp",
      "difícil": "./img/Difícil.webp",
      "muito dificil": "./img/Muito Difícil.webp",
      "muito difícil": "./img/Muito Difícil.webp"
    };
    
    levelImg.src = levelMapping[levelNormalized] || "./img/Fácil.webp";
    levelImg.alt = musica.level;
    levelImg.title = `Dificuldade: ${musica.level}`;
    levelBadge.appendChild(levelImg);
    levelBadge.style.display = "flex";
  } else {
    levelBadge.style.display = "none";
  }
  
  // Badge de gramática
  const grammarBadge = document.getElementById("music-grammar-badge");
  grammarBadge.innerHTML = '';

  if (musica.grammar) {
    const grammarArray = Array.isArray(musica.grammar) ? musica.grammar : [musica.grammar];
    
    if (grammarArray.length > 0) {
      // Criar um elemento para cada gramática
      grammarArray.forEach((grammar, index) => {
        const grammarText = document.createElement("span");
        grammarText.textContent = grammar;
        grammarText.className = "grammar-item";
        grammarText.title = grammar;
        
        // Adicionar vírgula entre os itens (exceto o último)
        if (index < grammarArray.length - 1) {
          grammarText.textContent += ", ";
        }
        
        grammarBadge.appendChild(grammarText);
      });
      
      grammarBadge.style.display = "flex";
    } else {
      grammarBadge.style.display = "none";
    }
  } else {
    grammarBadge.style.display = "none";
  }
}

// Função para carregar música
function carregarMusica(musica) {
  if (!musica) {
    console.error("Tentativa de carregar música inválida");
    return;
  }
  
  // Configurar a música atual
  currentMusic = musica;
  
  // Atualizar o título e artista
  const musicTitleElement = document.getElementById("music-title-game");
  const musicArtistElement = document.getElementById("music-artist-game");
  
  if (musicTitleElement) {
    musicTitleElement.textContent = musica.titulo || "Música sem título";
  }
  
  if (musicArtistElement) {
    musicArtistElement.textContent = (musica.artista || musica.artist || "Artista Desconhecido");
  }
  
  // Preencher os badges com informações da música
  preencherBadges(musica);
  
  try {
    // Carregar a letra e o player
    exibirLetraDrag(musica);
    exibirYoutubePlayer(musica);
    
    // Salvar no localStorage para recuperação futura
    localStorage.setItem('musicaAtual', JSON.stringify(musica));
    
    console.log("Música carregada com sucesso:", musica.titulo || musica.id);
  } catch (error) {
    console.error("Erro ao carregar componentes da música:", error);
  }
}

// Configurar botão submit quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  const btnSubmit = document.getElementById('btn-submit');
  if (btnSubmit) {
    btnSubmit.addEventListener('click', () => {
      // Importar dinamicamente a função para evitar erros de escopo
      import('./components/dragAndDrop.js').then(module => {
        module.checkAnswersDrag();
      });
    });
  }
});