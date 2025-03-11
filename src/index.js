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
function goBack() {
  document.getElementById("screen-home").style.display = "block";
  document.getElementById("screen-drag").style.display = "none";
}

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
