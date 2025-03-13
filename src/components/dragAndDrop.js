import { showResultPopup } from "./modal.js";

/**
 * Prepara o componente de drag and drop com as palavras da música
 * @param {Object} musica - Objeto da música contendo "letra" e "palavras"
 */
export function exibirLetraDrag(musica) {
  const lyricsContainer = document.getElementById("lyricsDrag");
  const wordBank = document.getElementById("word-bank");
  const frasesDisponiveis = musica.palavras.map(p => p.toLowerCase());
  
  // Criar mapa de contagem de palavras
  const wordCount = createWordCountMap(musica, frasesDisponiveis);
  
  // Substituir palavras por espaços em branco
  let letra = substituirPalavrasPorEspacos(musica.letra, frasesDisponiveis);
  lyricsContainer.innerHTML = letra;
  
  // Adicionar event listeners aos droppables
  const droppables = document.querySelectorAll('.droppable');
  droppables.forEach(droppable => {
    droppable.addEventListener('dragover', allowDrop);
    droppable.addEventListener('drop', dropWord);
  });
  
  // Popular o banco de palavras
  preencherBancoPalavras(wordBank, wordCount);
}

/**
 * Cria um mapa de contagem de palavras
 * @param {Object} musica - Objeto da música
 * @param {Array} frases - Lista de frases disponíveis
 * @returns {Object} Mapa de contagem de palavras
 */
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

/**
 * Escapa caracteres especiais para uso em regex
 * @param {string} string - String a ser escapada
 * @returns {string} String escapada
 */
function escapeRegExp(string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

/**
 * Substitui palavras por espaços em branco
 * @param {string} texto - Texto original
 * @param {Array} frases - Frases a serem substituídas
 * @returns {string} Texto com espaços em branco
 */
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

/**
 * Preenche o banco de palavras com as palavras disponíveis
 * @param {HTMLElement} wordBank - Elemento do banco de palavras
 * @param {Object} wordCount - Mapa de contagem de palavras
 */
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
  
  // Embaralhar os elementos usando o algoritmo Fisher-Yates
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


/**
 * Inicia o drag de uma palavra.
 * @param {DragEvent} event 
 */
export function dragWord(event) {
  event.dataTransfer.setData("application/my-word", event.target.dataset.word);
  event.dataTransfer.effectAllowed = "move";
  // Adicionar classe para efeito visual durante o drag
  event.target.classList.add('dragging');
  setTimeout(() => {
    event.target.classList.remove('dragging');
  }, 0);
}

/**
 * Permite que o elemento receba o drop.
 * @param {DragEvent} event 
 */
export function allowDrop(event) {
  event.preventDefault();
  // Opcional: adicionar classe de highlight ao passar sobre o alvo
  event.currentTarget.classList.add('drag-hover');
}

/**
 * Remove o highlight quando o drag sai da área
 * @param {DragEvent} event 
 */
export function dragLeave(event) {
  event.currentTarget.classList.remove('drag-hover');
}

/**
 * Trata o drop da palavra no espaço (blank) correspondente.
 * @param {DragEvent} event 
 */
export function dropWord(event) {
  event.preventDefault();
  const dropTarget = event.currentTarget;
  dropTarget.classList.remove('drag-hover');
  
  const word = event.dataTransfer.getData("application/my-word");
  if (!word) return;
  
  handleWordDrop(dropTarget, word);
}

/**
 * Manipula o drop de uma palavra
 * @param {HTMLElement} dropTarget - Elemento alvo
 * @param {string} word - Palavra a ser colocada
 */
function handleWordDrop(dropTarget, word) {
  const existing = dropTarget.querySelector('.dropped-word');
  if (existing) {
    if (existing.textContent.trim() !== word) {
      // Devolver palavra existente para o banco
      devolverAoBanco(existing);
    } else {
      return; // Mesma palavra, não faz nada
    }
  }
  
  // Remover palavra original do seu local atual
  removerPalavraOrigem(word);
  
  // Criar e adicionar nova palavra ao destino
  const span = criarElementoPalavra(word, dropTarget);
  
  dropTarget.innerHTML = "";
  dropTarget.appendChild(span);
}

/**
 * Devolve uma palavra para o banco de palavras
 * @param {HTMLElement} palavra - Elemento de palavra
 */
function devolverAoBanco(palavra) {
  document.getElementById("word-bank").appendChild(palavra);
}

/**
 * Remove a palavra da sua origem
 * @param {string} word - Palavra a ser removida
 */
function removerPalavraOrigem(word) {
  let origem = document.querySelector(`.draggable[data-word="${word}"]`) ||
               document.querySelector(`.dropped-word[data-word="${word}"]`);
  if (origem && origem.parentNode) {
    origem.parentNode.removeChild(origem);
  }
}

/**
 * Cria um elemento de palavra para ser colocado no destino
 * @param {string} word - Texto da palavra
 * @param {HTMLElement} dropTarget - Alvo do drop
 * @returns {HTMLElement} Elemento span criado
 */
function criarElementoPalavra(word, dropTarget) {
  const span = document.createElement("span");
  span.textContent = word;
  span.className = "dropped-word";
  span.draggable = true;
  span.dataset.word = word;
  span.addEventListener('dragstart', dragWord);
  
  span.addEventListener('dblclick', function() {
    devolverAoBanco(span);
    dropTarget.innerHTML = "";
  });
  
  return span;
}

/**
 * Verifica as respostas preenchidas e exibe o resultado.
 */
export function checkAnswersDrag() {
  const blanks = document.querySelectorAll("#lyricsDrag .blank");
  let correctCount = 0;
  let totalPreenchidos = 0;
  let totalBlanks = blanks.length;
  
  blanks.forEach(blank => {
    const respostaCorreta = blank.dataset.answer;
    const conteudoAtual = blank.textContent.trim();
    
    if (conteudoAtual) {
      totalPreenchidos++;
      
      if (conteudoAtual === respostaCorreta) {
        correctCount++;
        blank.classList.add("correct");
        blank.classList.remove("wrong");
      } else {
        blank.classList.add("wrong");
        blank.classList.remove("correct");
      }
    } else {
      blank.classList.remove("wrong", "correct");
    }
  });
  
  // Calcula completude (quanto do exercício foi tentado)
  const completude = Math.round((totalPreenchidos / totalBlanks) * 100);
  
  // Calcula precisão (quanto do que foi respondido está correto)
  const precisao = totalPreenchidos > 0 ? Math.round((correctCount / totalPreenchidos) * 100) : 0;
  
  // Calcula pontuação final - média ponderada entre completude e precisão
  // Precisão tem peso maior (70%) que completude (30%)
  const pontuacaoFinal = Math.round((precisao * 0.7) + (completude * 0.3));
  
  // Determinar número de estrelas com base na pontuação final
  let stars = 1;
  if (pontuacaoFinal >= 90) {
    stars = 3;
    disparaConfete();
  } else if (pontuacaoFinal >= 70) {
    stars = 2;
  }
  
  // Mostrar popup com resultado
  showResultPopup(pontuacaoFinal, stars, {
    precisao: precisao,
    completude: completude,
    totalCorretas: correctCount,
    totalRespondidas: totalPreenchidos,
    totalQuestoes: totalBlanks
  });
}

function disparaConfete() {
  // Verificar se confetti está disponível
  if (typeof confetti !== 'function') {
    console.warn("Biblioteca confetti não encontrada");
    return;
  }

  // Configuração do confete
  const duracaoConfete = 3000; // duração em milissegundos
  const confeteCompleto = {
    particleCount: 200,
    spread: 160,
    origin: { y: 0.6 },
    colors: ['#FFD700', '#FFC0CB', '#00FFFF', '#FF69B4', '#7FFF00']
  };
  
  // Dispara confete
  confetti(confeteCompleto);
  
  // Adiciona alguns disparos adicionais para um efeito mais impressionante
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
