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