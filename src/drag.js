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

// Função para carregar música
function carregarMusica(musica) {
  if (!musica) {
    console.error("Tentativa de carregar música inválida");
    return;
  }
  
  // Configurar a música atual
  currentMusic = musica;
  
  // Atualizar o título
  const musicTitleElement = document.getElementById("music-title");
  if (musicTitleElement) {
    musicTitleElement.textContent = musica.titulo || "Música sem título";
  }
  
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