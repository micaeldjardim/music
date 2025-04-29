import { carregarMusicas, renderMusicList, mostrarTelaInicial, encontrarMusicaPorId, setHomeNavigation } from "./services/musicService.js";
import { exibirYoutubePlayer } from "./components/player.js";
import { voltar5s } from "./components/player.js";
import { playpause } from "./components/player.js";
import { 
  exibirLetraDrag,
  dragWord,
  allowDrop,
  dropWord,
  checkAnswersDrag
} from "./components/dragAndDrop.js";
import { closeModal } from "./components/modal.js";
import * as routerService from "./services/routerService.js";

const { extrairMusicaIdDaURL, navegarParaMusica, navegarParaHome } = routerService;
let currentMusic = null;
let currentIndex = 0;  // Declare apenas uma vez no escopo global

function carregarMusica(musica) {
  currentMusic = musica;
  document.getElementById("screen-home").style.display = "none";
  document.querySelector('.hero-section').style.display = "none";
  document.getElementById("screen-drag").style.display = "block";
  document.getElementById("music-title-game").textContent = musica.titulo;
  document.getElementById("music-artist-game").textContent = musica.artist;
  
  // Preenchendo os badges
  preencherBadges(musica);
  
  exibirLetraDrag(musica);
  exibirYoutubePlayer(musica);
}

// Nova função para preencher os badges
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
    countryBadge.style.display = "block";
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
    styleBadge.style.display = "block";
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
    levelBadge.style.display = "block";
  } else {
    levelBadge.style.display = "none";
  }
  
  // Badge de gramática
  const grammarBadge = document.getElementById("music-grammar-badge");
  grammarBadge.innerHTML = '';
  
  if (musica.grammar) {
    const grammarArray = Array.isArray(musica.grammar) ? musica.grammar : [musica.grammar];
    
    if (grammarArray.length > 0) {
      const grammarText = document.createElement("span");
      grammarText.textContent = grammarArray[0]; // Mostra apenas a primeira gramática
      grammarText.title = grammarArray.join(', ');
      grammarBadge.appendChild(grammarText);
      
      // Se houver mais de uma gramática, mostrar contador
      if (grammarArray.length > 1) {
        const counter = document.createElement("span");
        counter.className = "grammar-count";
        counter.textContent = `+${grammarArray.length - 1}`;
        grammarBadge.appendChild(counter);
      }
      
      grammarBadge.style.display = "block";
    } else {
      grammarBadge.style.display = "none";
    }
  } else {
    grammarBadge.style.display = "none";
  }
}

window.navegarParaMusica = navegarParaMusica;
setHomeNavigation(navegarParaHome);

document.getElementById("search-input")?.addEventListener("input", () => {
  renderMusicList(carregarMusica);
});

carregarMusicas(carregarMusica).then(() => {
  const musicaId = extrairMusicaIdDaURL();
  if (musicaId) {
    const musica = encontrarMusicaPorId(musicaId);
    if (musica) {
      carregarMusica(musica);
    }
  }
});

window.dragWord = dragWord;
window.allowDrop = allowDrop;
window.dropWord = dropWord;
window.checkAnswersDrag = checkAnswersDrag;
window.goBack = goBack;
window.tryAgain = tryAgain;
window.closeModal = closeModal;
window.voltar5seg = voltar5seg;
window.playPause = playPause;

export function goBack() {
  mostrarTelaInicial();
  document.querySelector('.hero-section').style.display = "block";
  navegarParaHome();
}

export function voltar5seg() {
  if (currentMusic) {
    voltar5s();
  } else {
    console.error("Nenhuma música atual definida.");
  }
}

export function playPause() {
  if (currentMusic) {
    playpause();
  }
  else {
    console.error("Nenhuma música atual definida.");
  }
}

window.addEventListener('popstate', (event) => {
  if (event.state && event.state.screen === 'drag' && event.state.musicaId) {
    const musica = encontrarMusicaPorId(event.state.musicaId);
    if (musica) {
      carregarMusica(musica);
    } else {
      mostrarTelaInicial(); // Chama a função que já lida com a exibição da tela inicial
      renderMusicList(carregarMusica); // Adicione esta linha para recarregar a lista
    }
  } else {
    // A função mostrarTelaInicial já restaura a visibilidade da hero-section corretamente
    mostrarTelaInicial(); 
    renderMusicList(carregarMusica); // Adicione esta linha para recarregar a lista
    
    // Não é mais necessário definir estilos inline aqui, pois mostrarTelaInicial já faz isso.
  }
});

function tryAgain() {
  if (!currentMusic) {
    console.error("Nenhuma música atual definida.");
    return;
  }
  closeModal();
  exibirLetraDrag(currentMusic);
}

document.addEventListener('DOMContentLoaded', () => {
  const backButton = document.querySelector('.nav-buttons .btn:first-child');
  if (backButton) {
    backButton.onclick = goBack;
  }

  // Verificar se devemos navegar para a próxima música
  const navegarParaProxima = localStorage.getItem('navegarParaProxima');
  if (navegarParaProxima === 'true') {
    // Limpar a flag
    localStorage.removeItem('navegarParaProxima');
    
    // Buscar a próxima música na lista
    buscarProximaMusica();
  }

  // Configurar toggle dos filtros
  const toggleButton = document.getElementById('toggle-filtros-btn');
  const filtrosContent = document.getElementById('filtros-content');
  
  // Iniciar com os filtros escondidos
  filtrosContent.classList.add('hidden');
  
  // Adicionar evento de clique para mostrar/esconder os filtros
  toggleButton.addEventListener('click', (event) => {
    // Evitar que o clique no botão afete o campo de busca
    event.preventDefault();
    event.stopPropagation();
    
    filtrosContent.classList.toggle('hidden');
    toggleButton.classList.toggle('active');
    
    // O SVG será rotacionado automaticamente via CSS quando .active for adicionado
  });
  
  // Evitar que clicar no campo de busca afete o botão
  document.getElementById('search-input').addEventListener('click', (event) => {
    event.stopPropagation();
  });

  // Nova implementação do carrossel
  const welcomeItems = document.querySelectorAll('.welcome-item');
  let welcomeIndex = 0;
  
  function rotateWelcomeItems() {
    // Remove a classe active de todos os itens
    welcomeItems.forEach(item => item.classList.remove('active'));
    
    // Adiciona a classe active apenas no item atual
    welcomeItems[welcomeIndex].classList.add('active');
    
    // Incrementa o índice e reinicia se necessário
    welcomeIndex = (welcomeIndex + 1) % welcomeItems.length;
  }
  
  // Inicia o carrossel com o primeiro item
  if (welcomeItems.length > 0) {
    rotateWelcomeItems();
    // Define o intervalo para troca automática (4 segundos)
    setInterval(rotateWelcomeItems, 4000);
  }
  
  // Efeito de scroll suave para o botão "Começar Agora"
  const startButton = document.querySelector('a[href="#music-list"]');
  if (startButton) {
    startButton.addEventListener('click', function(e) {
      e.preventDefault();
      
      const target = document.getElementById('music-list');
      if (target) {
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    });
  }
});

// Função para buscar a próxima música
function buscarProximaMusica() {
  // Recuperar a lista de músicas do localStorage ou do banco de dados
  const musicaAtual = JSON.parse(localStorage.getItem('musicaAtual') || '{}');
  const idAtual = musicaAtual.id;
  
  // Aqui você precisa implementar a lógica para selecionar a próxima música
  // Por exemplo, você pode ter uma lista ordenada de IDs de músicas
  // e selecionar a música que vem depois da atual
  
  // Exemplo simplificado:
  const todasMusicas = JSON.parse(localStorage.getItem('musicList') || '[]');
  if (todasMusicas.length > 0) {
    let indexAtual = -1;
    
    // Encontrar o índice da música atual na lista
    if (idAtual) {
      indexAtual = todasMusicas.findIndex(musica => musica.id === idAtual);
    }
    
    // Calcular o índice da próxima música
    const proximoIndex = (indexAtual + 1) % todasMusicas.length;
    const proximaMusica = todasMusicas[proximoIndex];
    
    // Navegar para a próxima música
    if (proximaMusica && proximaMusica.id) {
      window.location.href = `jogo.html?id=${proximaMusica.id}`;
    }
  }
}
