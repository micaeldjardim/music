import { showResultPopup } from "./modal.js";

/**
 * 
 * 
 * @param {Object} musica - Objeto da música contendo "letra" e "palavras".
 */
export function exibirLetraDrag(musica) {
  let letra = musica.letra;
  const frasesDisponiveis = musica.palavras.map(p => p.toLowerCase());
  
  frasesDisponiveis.forEach(phrase => {
    const escapedPhrase = phrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedPhrase}\\b`, 'gi');
    letra = letra.replace(
      regex,
      `<span class="blank droppable" data-answer="${phrase}" ondragover="allowDrop(event)" ondrop="dropWord(event)"></span>`
    );
  });
  
  document.getElementById("lyricsDrag").innerHTML = letra;
  
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

/**
 * Inicia o drag de uma palavra.
 * @param {DragEvent} event 
 */
export function dragWord(event) {
  event.dataTransfer.setData("application/my-word", event.target.dataset.word);
  event.dataTransfer.effectAllowed = "move";
}

/**
 * Permite que o elemento receba o drop.
 * @param {DragEvent} event 
 */
export function allowDrop(event) {
  event.preventDefault();
}

/**
 * Trata o drop da palavra no espaço (blank) correspondente.
 * @param {DragEvent} event 
 */
export function dropWord(event) {
  event.preventDefault();
  const dropTarget = event.currentTarget;
  const word = event.dataTransfer.getData("application/my-word");
  if (!word) return;
  
  const existing = dropTarget.querySelector('.dropped-word');
  if (existing) {
    if (existing.textContent.trim() !== word) {
      document.getElementById("word-bank").appendChild(existing);
    } else {
      return;
    }
  }
  
  let origem = document.querySelector(`.draggable[data-word="${word}"]`) ||
               document.querySelector(`.dropped-word[data-word="${word}"]`);
  if (origem && origem.parentNode) {
    origem.parentNode.removeChild(origem);
  }
  
  const span = document.createElement("span");
  span.textContent = word;
  span.className = "dropped-word";
  span.setAttribute("draggable", "true");
  span.dataset.word = word;
  span.ondragstart = dragWord;
  
  span.ondblclick = function() {
    document.getElementById("word-bank").appendChild(span);
    dropTarget.innerHTML = "";
  };
  
  dropTarget.innerHTML = "";
  dropTarget.appendChild(span);
}

/**
 * Verifica as respostas preenchidas e exibe o resultado.
 */
export function checkAnswersDrag() {
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
