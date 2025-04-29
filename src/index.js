import { carregarMusicas, renderMusicList, mostrarTelaInicial, encontrarMusicaPorId, setHomeNavigation } from "./services/musicService.js";
import * as routerService from "./services/routerService.js";

const { extrairMusicaIdDaURL, navegarParaMusica, navegarParaHome } = routerService;

function carregarMusica(musica) {
  if (!musica) {
    console.error("Tentativa de carregar música inválida");
    return;
  }
  
  // Salvar a música atual no localStorage antes de navegar
  localStorage.setItem('musicaAtual', JSON.stringify(musica));
  
  // Se tivermos uma lista global de músicas, salvá-la também
  if (window.musicasList && Array.isArray(window.musicasList)) {
    localStorage.setItem('musicList', JSON.stringify(window.musicasList));
  }
  
  // Redirecionar para a página drag.html
  navegarParaMusica(musica);
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

window.addEventListener('popstate', () => {
  mostrarTelaInicial();
  const heroSection = document.querySelector('.hero-section');
  if (heroSection) {
    heroSection.style.display = "block";
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // Configurar toggle dos filtros
  const toggleButton = document.getElementById('toggle-filtros-btn');
  const filtrosContent = document.getElementById('filtros-content');
  
  if (toggleButton && filtrosContent) {
    // Iniciar com os filtros escondidos
    filtrosContent.classList.add('hidden');
    
    // Adicionar evento de clique para mostrar/esconder os filtros
    toggleButton.addEventListener('click', (event) => {
      // Evitar que o clique no botão afete o campo de busca
      event.preventDefault();
      event.stopPropagation();
      
      filtrosContent.classList.toggle('hidden');
      toggleButton.classList.toggle('active');
    });
  }
  
  // Evitar que clicar no campo de busca afete o botão
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('click', (event) => {
      event.stopPropagation();
    });
  }

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