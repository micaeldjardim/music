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
  document.getElementById("music-title").textContent = musica.titulo;
  // Oculta a home e a seção com o vídeo
  document.getElementById("screen-home").style.display = "none";
  document.querySelector('.hero-section').style.display = "none";
  // Mostra a tela do jogo
  document.getElementById("screen-drag").style.display = "block";
  exibirLetraDrag(musica);
  exibirYoutubePlayer(musica);
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
      mostrarTelaInicial();
      const heroSection = document.querySelector('.hero-section');
      // Aplicar os mesmos estilos que na função goBack
      heroSection.style.display = "block";
      heroSection.style.textAlign = "center";
      heroSection.style.width = "100%";
      heroSection.style.margin = "0 auto";
      heroSection.style.position = "relative";
      
      // Garantir que o vídeo também seja centralizado
      const videoPresentation = document.querySelector('.video-presentation');
      if (videoPresentation) {
        videoPresentation.style.margin = "0 auto";
        videoPresentation.style.textAlign = "center";
      }
    }
  } else {
    mostrarTelaInicial();
    const heroSection = document.querySelector('.hero-section');
    // Aplicar os mesmos estilos que na função goBack
    heroSection.style.display = "block";
    heroSection.style.textAlign = "center";
    heroSection.style.width = "100%";
    heroSection.style.margin = "0 auto";
    heroSection.style.position = "relative";
    
    // Garantir que o vídeo também seja centralizado
    const videoPresentation = document.querySelector('.video-presentation');
    if (videoPresentation) {
      videoPresentation.style.margin = "0 auto";
      videoPresentation.style.textAlign = "center";
    }
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
