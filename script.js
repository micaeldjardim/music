import { db } from "./firebase.js";
import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Elementos HTML
const songList = document.getElementById("songList");
const gameArea = document.getElementById("gameArea");
const videoPlayer = document.getElementById("videoPlayer");
const lyricsDisplay = document.getElementById("lyricsDisplay");
const songTitle = document.getElementById("songTitle");
const userInput = document.getElementById("userInput");
const submitButton = document.getElementById("submitAnswer");
const scoreDisplay = document.getElementById("score");

// Variáveis globais
let missingWords = [];
let formattedLyrics = "";
let score = 0;

// Função para carregar a lista de músicas
async function carregarListaMusicas() {
    const querySnapshot = await getDocs(collection(db, "songs"));
    songList.innerHTML = ""; // Limpa a lista antes de carregar

    querySnapshot.forEach((doc) => {
        const songData = doc.data();
        const button = document.createElement("button");
        button.textContent = songData.title;
        button.classList.add("song-button");
        button.onclick = () => carregarMusica(doc.id); // Carrega a música ao clicar
        songList.appendChild(button);
    });
}

// Função para carregar uma música específica
async function carregarMusica(songId) {
    const docRef = doc(db, "songs", songId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();

        // Atualiza o título da música e o vídeo
        songTitle.textContent = data.title;
        const videoId = new URL(data.videoUrl).searchParams.get("v");
        videoPlayer.src = `https://www.youtube.com/embed/${videoId}`;

        // Salva palavras para preenchimento
        missingWords = data.missing;

        // Exibe a letra com lacunas
        formattedLyrics = data.lyrics;
        lyricsDisplay.innerHTML = formattedLyrics.replace(/____/g, '<span class="missing-word">____</span>');

        // Reinicia a pontuação
        score = 0;
        scoreDisplay.textContent = `Pontuação: ${score}`;

        // Exibir a área do jogo
        gameArea.style.display = "block";
    } else {
        console.error("Música não encontrada!");
    }
}

// Verifica a resposta do usuário
submitButton.addEventListener("click", () => {
    const userAnswer = userInput.value.trim().toUpperCase();
    
    if (missingWords.includes(userAnswer)) {
        // Substitui o primeiro espaço vazio encontrado pela resposta correta
        formattedLyrics = formattedLyrics.replace("____", userAnswer);
        lyricsDisplay.innerHTML = formattedLyrics.replace(/____/g, '<span class="missing-word">____</span>');

        // Remove a palavra encontrada da lista
        missingWords = missingWords.filter(word => word !== userAnswer);

        // Aumenta a pontuação
        score += 10;
        scoreDisplay.textContent = `Pontuação: ${score}`;

        // Mensagem de acerto
        alert("Correto!");
    } else {
        alert("Errado! Tente novamente.");
    }

    userInput.value = ""; // Limpa o campo
});

// Carregar a lista de músicas ao iniciar
carregarListaMusicas();
