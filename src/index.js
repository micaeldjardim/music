// scripts/index.js
import { carregarMusicas, renderMusicList } from "./services/musicService.js";
import { exibirYoutubePlayer } from "./components/player.js";
import { 
  exibirLetraDrag,
  dragWord,
  allowDrop,
  dropWord,
  checkAnswersDrag
} from "./components/dragAndDrop.js";
import { closeModal } from "./components/modal.js";

let currentMusic = null;

/**
 * Ao selecionar uma música, exibe a tela de drag com a letra e o player.
 * @param {Object} musica - Objeto da música selecionada.
 */
function carregarMusica(musica) {
  currentMusic = musica;
  document.getElementById("music-title").textContent = musica.titulo;
  document.getElementById("screen-home").style.display = "none";
  document.getElementById("screen-drag").style.display = "block";
  exibirLetraDrag(musica);
  exibirYoutubePlayer(musica);
}

// Registra o evento de input para filtrar a lista de músicas.
document.getElementById("search-input")?.addEventListener("input", () => {
  renderMusicList(carregarMusica);
});

// Inicia o carregamento das músicas, passando a callback para seleção.
carregarMusicas(carregarMusica);

// Expor funções globais para os atributos inline no HTML.
window.dragWord = dragWord;
window.allowDrop = allowDrop;
window.dropWord = dropWord;
window.checkAnswersDrag = checkAnswersDrag;
window.goBack = goBack;
window.tryAgain = tryAgain;
window.closeModal = closeModal;

/**
 * Retorna à tela inicial.
 */
export function goBack() {
  // Volta para a tela inicial
  document.getElementById("screen-home").style.display = "block";
  document.getElementById("screen-drag").style.display = "none";
  
  // Atualiza o histórico
  history.pushState({ screen: 'home' }, '', '#home');
}

document.addEventListener('DOMContentLoaded', () => {
  const backButton = document.querySelector('.nav-buttons .btn:first-child');
  if (backButton) {
    backButton.onclick = goBack;
  }
});

window.addEventListener('popstate', (event) => {
  if (event.state && event.state.screen) {
    // Carrega a tela apropriada baseada no estado
    switch (event.state.screen) {
      case 'drag':
        if (event.state.musica) {
          callbackSelectMusic(event.state.musica);
        }
        break;
      default:
        // Retorna para página inicial
        mostrarTelaInicial();
        break;
    }
  } else {
    // Lidar com a navegação direta pela URL
    const hash = window.location.hash;
    if (hash.startsWith('#musica/')) {
      // Extrai o ID da música da URL
      const parts = hash.substring(8).split('/');
      if (parts.length >= 1) {
        const musicaId = parts[0];
        // Busca a música pelo ID
        carregarMusicaPorId(musicaId);
      }
    } else {
      mostrarTelaInicial();
    }
  }
});

/**
 * Reinicia o exercício de drag-and-drop utilizando a música atual.
 */
function tryAgain() {
  if (!currentMusic) {
    console.error("Nenhuma música atual definida!");
    return;
  }
  closeModal();
  exibirLetraDrag(currentMusic);
}

async function carregarMusicaPorId(id) {
  // Importa a função necessária
  const { getMusicas } = await import('./services/firebase.js');
  
  try {
    // Busca todas as músicas se ainda não tiver
    if (!window.allMusicas || window.allMusicas.length === 0) {
      window.allMusicas = await getMusicas();
    }
    
    // Encontra a música pelo ID
    const musica = window.allMusicas.find(m => m.id === id);
    if (musica) {
      // Usa a função de seleção de música
      selecionarMusica(musica);
    } else {
      console.warn("Música não encontrada com ID:", id);
      document.getElementById("screen-home").style.display = "block";
      document.getElementById("screen-drag").style.display = "none";
    }
  } catch (error) {
    console.error("Erro ao carregar música por ID:", error);
    document.getElementById("screen-home").style.display = "block";
    document.getElementById("screen-drag").style.display = "none";
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Verificar se a URL tem um hash ao carregar a página
  const hash = window.location.hash;
  if (hash && hash.startsWith('#musica/')) {
    try {
      // Extrai o ID da música da URL
      const parts = hash.substring(8).split('/');
      if (parts.length >= 1) {
        const musicaId = parts[0];
        // Carrega a música apenas se o ID existir
        if (musicaId) {
          carregarMusicaPorId(musicaId);
        }
      }
    } catch (error) {
      console.error('Erro ao processar URL:', error);
      // Em caso de erro, mostra a tela inicial
      document.getElementById("screen-home").style.display = "block";
      document.getElementById("screen-drag").style.display = "none";
    }
  }
});
