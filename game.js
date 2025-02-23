import { getMusicas } from "./firebase.js";

let allMusicas = [];

async function carregarMusicas() {
  allMusicas = await getMusicas();
  renderMusicList();
}

function renderMusicList() {
  const container = document.getElementById("music-list");
  container.innerHTML = "";
  const searchTerm = document.getElementById("search-input").value.toLowerCase();
  const filtered = allMusicas.filter(musica => musica.titulo.toLowerCase().includes(searchTerm));
  filtered.forEach(musica => {
    const videoId = extrairVideoId(musica.URL);
    const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "";
    const div = document.createElement("div");
    div.className = "music-thumb";
    const title = document.createElement("div");
    title.className = "music-title-thumb";
    title.textContent = musica.titulo;
    div.appendChild(title);
    if (thumbUrl) {
      const img = document.createElement("img");
      img.src = thumbUrl;
      img.alt = musica.titulo;
      div.appendChild(img);
    }
    div.onclick = () => carregarMusica(musica);
    container.appendChild(div);
  });
}

document.getElementById("search-input").addEventListener("input", renderMusicList);

let currentMusic = null;
function carregarMusica(musica) {
  currentMusic = musica;
  document.getElementById("music-title").textContent = musica.titulo;
  document.getElementById("screen-home").style.display = "none";
  document.getElementById("screen-drag").style.display = "block";
  exibirLetraDrag(musica);
  exibirYoutubePlayer(musica);
}

// Função modificada para suportar frases (várias palavras consecutivas)
function exibirLetraDrag(musica) {
  let letra = musica.letra;
  // Considera cada frase disponível (pode conter múltiplas palavras) como uma resposta
  const frasesDisponiveis = musica.palavras.map(p => p.toLowerCase());
  
  // Para cada frase, substitui todas as ocorrências na letra por um span de blank
  frasesDisponiveis.forEach(phrase => {
    const escapedPhrase = phrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedPhrase}\\b`, 'gi');
    letra = letra.replace(regex, `<span class="blank droppable" data-answer="${phrase}" ondragover="allowDrop(event)" ondrop="dropWord(event)"></span>`);
  });
  
  document.getElementById("lyricsDrag").innerHTML = letra;
  
  // Cria o word bank baseado na contagem de ocorrências de cada frase na letra
  const wordCount = {};
  frasesDisponiveis.forEach(phrase => {
    const escapedPhrase = phrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedPhrase}\\b`, 'gi');
    const matches = musica.letra.match(regex);
    if (matches) {
      wordCount[phrase] = matches.length;
    }
  });
  
  const wordBank = document.getElementById("word-bank");
  wordBank.innerHTML = "";
  for (let phrase in wordCount) {
    for (let i = 0; i < wordCount[phrase]; i++) {
      wordBank.innerHTML += `<span class="draggable" draggable="true" data-word="${phrase}" ondragstart="dragWord(event)">${phrase}</span>`;
    }
  }
}

function extrairVideoId(url) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

function exibirYoutubePlayer(musica) {
  const playerContainer = document.getElementById("player-container");
  playerContainer.innerHTML = "";
  if (musica.URL) {
    const videoId = extrairVideoId(musica.URL);
    if (!videoId) {
      console.error("ID do vídeo não encontrado!");
      return;
    }
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    const iframe = document.createElement("iframe");
    iframe.setAttribute("width", "560");
    iframe.setAttribute("height", "315");
    iframe.setAttribute("src", embedUrl);
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("allow", "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture");
    iframe.setAttribute("allowfullscreen", "true");
    playerContainer.appendChild(iframe);
  }
}

function dragWord(event) {
  event.dataTransfer.setData("application/my-word", event.target.dataset.word);
  event.dataTransfer.effectAllowed = "move";
}

function allowDrop(event) {
  event.preventDefault();
}

function dropWord(event) {
  event.preventDefault();
  const dropTarget = event.currentTarget;
  const word = event.dataTransfer.getData("application/my-word");
  if (!word) return;
  const current = dropTarget.querySelector('.dropped-word');
  if (current) {
    const wordBank = document.getElementById("word-bank");
    wordBank.appendChild(current);
    dropTarget.innerHTML = "";
  }
  let origem = document.querySelector(`.draggable[data-word="${word}"]`) || document.querySelector(`.dropped-word[data-word="${word}"]`);
  if (origem) {
    origem.parentNode.removeChild(origem);
  }
  const span = document.createElement("span");
  span.textContent = word;
  span.className = "dropped-word";
  span.setAttribute("draggable", "true");
  span.dataset.word = word;
  span.ondragstart = dragWord;
  dropTarget.innerHTML = "";
  dropTarget.appendChild(span);
}

function checkAnswersDrag() {
  const blanks = document.querySelectorAll("#lyricsDrag .blank");
  let correctCount = 0;
  blanks.forEach(blank => {
    const respostaCorreta = blank.dataset.answer;
    if (blank.textContent.trim() === respostaCorreta) {
      correctCount++;
      blank.classList.remove("wrong");
    } else {
      blank.classList.add("wrong");
    }
  });
  const total = blanks.length;
  const percentage = Math.round((correctCount / total) * 100);
  let stars = 1;
  if (percentage === 100) {
    stars = 3;
  } else if (percentage >= 70) {
    stars = 2;
  }
  showResultPopup(percentage, stars);
}

function showResultPopup(percentage, stars) {
  const modal = document.getElementById("resultModal");
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close" onclick="closeModal()">&times;</span>
      <h2>Resultado</h2>
      <p>Você acertou ${percentage}%.</p>
      <p>${stars === 3 ? "Excelente!" : stars === 2 ? "Bom trabalho!" : "Continue tentando!"}</p>
      <div class="stars">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</div>
    </div>
  `;
  modal.style.display = "block";
  modal.onclick = function(event) {
    if (event.target === modal) closeModal();
  };
}

function closeModal() {
  const modal = document.getElementById("resultModal");
  modal.style.display = "none";
}

function tryAgain() {
  if (!currentMusic) {
    console.error("Nenhuma música atual definida!");
    return;
  }
  closeModal();
  exibirLetraDrag(currentMusic);
}

function goBack() {
  document.getElementById("screen-home").style.display = "block";
  document.getElementById("screen-drag").style.display = "none";
}

carregarMusicas();

window.dragWord = dragWord;
window.allowDrop = allowDrop;
window.dropWord = dropWord;
window.checkAnswersDrag = checkAnswersDrag;
window.goBack = goBack;
window.tryAgain = tryAgain;
window.closeModal = closeModal;