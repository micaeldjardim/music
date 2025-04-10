import { showResultPopup } from "./modal.js";

export function exibirLetraDrag(musica) {
  // Armazenar o tempo de início e dados da música
  localStorage.setItem('startTime', Date.now());
  localStorage.setItem('musicaAtual', JSON.stringify({
    id: musica.id || '', // Adicionar o ID da música
    nivel: musica.nivel || 'medio',
    duracao: musica.duracao || 180,
    titulo: musica.titulo || 'Música'
  }));
  
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
  
  const startTime = Number(localStorage.getItem('startTime') || Date.now());
  const tempoUsado = (Date.now() - startTime) / 1000; // tempo em segundos

  
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
  

  // Obter dados da música atual
  const musicaAtual = JSON.parse(localStorage.getItem('musicaAtual') || '{}');
  const nivel = musicaAtual.nivel || 'medio';
  const duracaoVideo = musicaAtual.duracao || 180; // Valor padrão de 3 minutos
  
  // Usar o novo sistema de cálculo de pontuação
  const resultado = calcularPontuacaoEEstrelas({
    acertos: correctCount,
    totalPalavras: totalBlanks,
    tempoUsado: tempoUsado,
    duracaoVideo: duracaoVideo,
    nivel: nivel
  });
  
  // Dispara confete para 3 estrelas
  if (resultado.estrelas === 3) {
    disparaConfete();
  }
  
  // Mostrar popup com resultado
  showResultPopup(resultado.percentual, resultado.estrelas, {
    precisao: Math.round((correctCount / totalPreenchidos) * 100) || 0,
    completude: Math.round((totalPreenchidos / totalBlanks) * 100),
    totalCorretas: correctCount,
    totalRespondidas: totalPreenchidos,


    totalQuestoes: totalBlanks,
    pontuacao: resultado.pontuacao,
    fatorTempo: resultado.fatorTempo
  });
}

/**
 * Calcula a pontuação e estrelas com base nos parâmetros fornecidos
 */
function calcularPontuacaoEEstrelas({ acertos, totalPalavras, tempoUsado, duracaoVideo, nivel }) {
  const pontosPorNivel = {
    facil: 10,
    medio: 15,
    dificil: 20,
    muito_dificil: 25
  };

  const percentual = acertos / totalPalavras;
  const tempoIdeal = duracaoVideo * 0.5;
  const fatorTempo = tempoUsado / tempoIdeal;

  let multiplicadorTempo = 1.0;
  if (fatorTempo <= 1.0) {
    multiplicadorTempo = 1.2;
  } else if (fatorTempo > 1.5) {
    multiplicadorTempo = 0.8;
  }

  const pontosBase = pontosPorNivel[nivel] || 10;
  const pontuacao = Math.round(acertos * pontosBase * multiplicadorTempo);

  let estrelas = 0;
  if (percentual >= 0.9 && fatorTempo <= 1.0) {
    estrelas = 3;
  } else if (percentual >= 0.9 || percentual >= 0.7) {
    estrelas = 2;
  } else if (percentual >= 0.5) {
    estrelas = 1;
  }

  return {
    pontuacao,
    estrelas,
    percentual: Math.round(percentual * 100),
    fatorTempo: parseFloat(fatorTempo.toFixed(2))
  };
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