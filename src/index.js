import { carregarMusicas, renderMusicList, mostrarTelaInicial, encontrarMusicaPorId, setHomeNavigation } from "./services/musicService.js";
import { exibirYoutubePlayer } from "./components/player.js";
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

function carregarMusica(musica) {
  currentMusic = musica;
  document.getElementById("music-title").textContent = musica.titulo;
  document.getElementById("screen-home").style.display = "none";
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

export function goBack() {
  mostrarTelaInicial();
  navegarParaHome();
}

window.addEventListener('popstate', (event) => {
  if (event.state && event.state.screen === 'drag' && event.state.musicaId) {
    const musica = encontrarMusicaPorId(event.state.musicaId);
    if (musica) {
      carregarMusica(musica);
    } else {
      mostrarTelaInicial();

    }
  } else {
    mostrarTelaInicial();
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

});