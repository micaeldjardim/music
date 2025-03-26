import { showResultPopup } from "./modal.js";

export function exibirLetraDrag(musica) {
  const lyricsContainer = document.getElementById("lyricsDrag");
  const wordBank = document.getElementById("word-bank");
  const frasesDisponiveis = musica.palavras.map(p => p.toLowerCase());
  
  const wordCount = createWordCountMap(musica, frasesDisponiveis);
  let letra = substituirPalavrasPorEspacos(musica.letra, frasesDisponiveis);
  lyricsContainer.innerHTML = letra;
  
  const droppables = document.querySelectorAll('.droppable');
  droppables.forEach(droppable => {
    droppable.addEventListener('dragover', allowDrop);
    droppable.addEventListener('drop', dropWord);
    droppable.addEventListener('dragleave', dragLeave);
  });
  
  preencherBancoPalavras(wordBank, wordCount);
}

function createWordCountMap(musica, frases) {
  const wordCount = {};
  frases.forEach(phrase => {
    const escapedPhrase = escapeRegExp(phrase);
    const regex = new RegExp(`\\b${escapedPhrase}\\b`, 'gi');
    const matches = musica.letra.match(regex);
    if (matches) {
      wordCount[phrase] = matches.length;
    }
  });
  return wordCount;
}

function escapeRegExp(string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function substituirPalavrasPorEspacos(texto, frases) {
  let resultado = texto;
  frases.forEach(phrase => {
    const escapedPhrase = escapeRegExp(phrase);
    const regex = new RegExp(`\\b${escapedPhrase}\\b`, 'gi');
    resultado = resultado.replace(
      regex,
      `<span class="blank droppable" data-answer="${phrase}"></span>`
    );
  });
  return resultado;
}

function preencherBancoPalavras(wordBank, wordCount) {
  wordBank.innerHTML = "";
  const elementos = [];
  
  for (let phrase in wordCount) {
    for (let i = 0; i < wordCount[phrase]; i++) {
      const span = document.createElement("span");
      span.className = "draggable";
      span.draggable = true;
      span.dataset.word = phrase;
      span.textContent = phrase;
      span.addEventListener('dragstart', dragWord);
      elementos.push(span);
    }
  }
  
  shuffleArray(elementos);
  
  const fragment = document.createDocumentFragment();
  elementos.forEach(el => fragment.appendChild(el));
  wordBank.appendChild(fragment);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export function dragWord(event) {
  const elementId = 'drag-' + Date.now();
  event.target.id = elementId;
  
  event.dataTransfer.setData("application/my-word", event.target.dataset.word);
  event.dataTransfer.setData("application/element-id", elementId);
  event.dataTransfer.effectAllowed = "move";
  
  event.target.classList.add('dragging');
  setTimeout(() => {
    event.target.classList.remove('dragging');
  }, 0);
}

export function allowDrop(event) {
  event.preventDefault();
  event.currentTarget.classList.add('drag-hover');
}

export function dragLeave(event) {
  event.currentTarget.classList.remove('drag-hover');
}

export function dropWord(event) {
  event.preventDefault();
  const dropTarget = event.currentTarget;
  dropTarget.classList.remove('drag-hover');
  
  const word = event.dataTransfer.getData("application/my-word");
  const elementId = event.dataTransfer.getData("application/element-id");
  if (!word) return;
  
  handleWordDrop(dropTarget, word, elementId);
}

function handleWordDrop(dropTarget, word, elementId) {
  const existing = dropTarget.querySelector('.dropped-word');
  
  if (existing) {
    if (existing.textContent.trim() !== word) {
      devolverAoBanco(existing);
    } else {
      return;
    }
  }
  
  const elementoArrastado = document.getElementById(elementId);
  
  if (elementoArrastado) {
    if (elementoArrastado.classList.contains('dropped-word')) {
      if (elementoArrastado.parentNode && elementoArrastado.parentNode.classList.contains('droppable')) {
        elementoArrastado.parentNode.innerHTML = "";
      }
      
      dropTarget.innerHTML = "";
      dropTarget.appendChild(elementoArrastado);
      
      verificarPalavraCorreta(dropTarget);
      verificarBancoVazio();
      
      return;
    } else {
      if (elementoArrastado.parentNode) {
        elementoArrastado.parentNode.removeChild(elementoArrastado);
      }
      
      elementoArrastado.className = "dropped-word";
      
      elementoArrastado.addEventListener('dblclick', function() {
        devolverAoBanco(elementoArrastado);
        dropTarget.classList.remove('correct', 'wrong');
        verificarBancoVazio();
      });
      
      dropTarget.innerHTML = "";
      dropTarget.appendChild(elementoArrastado);
      
      verificarPalavraCorreta(dropTarget);
      verificarBancoVazio();
      
      return;
    }
  }
  
  const span = criarElementoPalavra(word, dropTarget);
  
  dropTarget.innerHTML = "";
  dropTarget.appendChild(span);
  
  verificarPalavraCorreta(dropTarget);
  verificarBancoVazio();
}

function verificarPalavraCorreta(dropTarget) {
  const respostaCorreta = dropTarget.dataset.answer;
  const conteudoAtual = dropTarget.textContent.trim();
  
  if (conteudoAtual) {
    if (conteudoAtual === respostaCorreta) {
      dropTarget.classList.add("correct");
      dropTarget.classList.remove("wrong");
    } else {
      dropTarget.classList.add("wrong");
      dropTarget.classList.remove("correct");
    }
  } else {
    dropTarget.classList.remove('wrong', 'correct');
  }
}

function verificarBancoVazio() {
  const wordBank = document.getElementById("word-bank");
  if (wordBank.children.length === 0) {
    setTimeout(() => {
      checkAnswersDrag();
    }, 300);
  }
}

function devolverAoBanco(palavra) {
  const wordBank = document.getElementById("word-bank");
  
  const newWord = document.createElement("span");
  newWord.className = "draggable";
  newWord.draggable = true;
  newWord.dataset.word = palavra.dataset.word;
  newWord.textContent = palavra.dataset.word;
  newWord.addEventListener('dragstart', dragWord);
  
  wordBank.appendChild(newWord);
  
  if (palavra.parentNode) {
    const parent = palavra.parentNode;
    palavra.parentNode.removeChild(palavra);
    
    if (parent.classList.contains('droppable')) {
      parent.classList.remove('correct', 'wrong');
    }
  }
}

function criarElementoPalavra(word, dropTarget) {
  const span = document.createElement("span");
  span.textContent = word;
  span.className = "dropped-word";
  span.draggable = true;
  span.dataset.word = word;
  
  span.addEventListener('dragstart', function(event) {
    event.dataTransfer.setData("application/my-word", word);
    event.dataTransfer.effectAllowed = "move";
    span.classList.add('dragging');
    setTimeout(() => {
      span.classList.remove('dragging');
    }, 0);
  });
  
  span.addEventListener('dblclick', function() {
    devolverAoBanco(span);
  });
  
  return span;
}

export function checkAnswersDrag() {
  const blanks = document.querySelectorAll("#lyricsDrag .blank");
  let correctCount = 0;
  let totalPreenchidos = 0;
  const totalBlanks = blanks.length;
  
  blanks.forEach(blank => {
    const respostaCorreta = blank.dataset.answer;
    const conteudoAtual = blank.textContent.trim();
    
    if (conteudoAtual) {
      totalPreenchidos++;
      
      if (conteudoAtual === respostaCorreta) {
        correctCount++;
        blank.classList.add("correct");
        blank.classList.remove("wrong");
        
        const palavraElement = blank.querySelector('.dropped-word');
        if (palavraElement) {
          palavraElement.classList.add('word-correct');
          palavraElement.classList.remove('word-wrong');
        }
      } else {
        blank.classList.add("wrong");
        blank.classList.remove("correct");
        
        const palavraElement = blank.querySelector('.dropped-word');
        if (palavraElement) {
          palavraElement.classList.add('word-wrong');
          palavraElement.classList.remove('word-correct');
        }
      }
    } else {
      blank.classList.remove('wrong', 'correct');
    }
  });
  
  // Sistema de pontuação simplificado
  // A pontuação é calculada com base na proporção de respostas corretas
  const pontuacao = Math.round((correctCount / totalBlanks) * 100);
  
  // Determinar número de estrelas com base na pontuação
  let stars = 1;
  if (pontuacao >= 90) {
    stars = 3;
    disparaConfete();
  } else if (pontuacao >= 70) {
    stars = 2;
  }
  
  // Mostrar popup com resultado
  showResultPopup(pontuacao, stars, {
    precisao: Math.round((correctCount / totalPreenchidos) * 100) || 0,
    completude: Math.round((totalPreenchidos / totalBlanks) * 100),
    totalCorretas: correctCount,
    totalRespondidas: totalPreenchidos,
    totalQuestoes: totalBlanks
  });
}

function disparaConfete() {
  if (typeof confetti !== 'function') {
    console.warn("Biblioteca confetti não encontrada");
    return;
  }

  confetti({
    particleCount: 200,
    spread: 160,
    origin: { y: 0.6 },
    colors: ['#FFD700', '#FFC0CB', '#00FFFF', '#FF69B4', '#7FFF00']
  });
  
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 80,
      origin: { x: 0 }
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 80,
      origin: { x: 1 }
    });
  }, 750);
}