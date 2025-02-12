import { db } from "./firebase.js";
import { collection, doc, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Elementos HTML
const videoPlayer = document.getElementById("videoPlayer");
const lyricsContainer = document.getElementById("lyrics");
const songList = document.getElementById("songList");

// Carregar todas as músicas da coleção "songs"
async function carregarMusicas() {
    const querySnapshot = await getDocs(collection(db, "songs"));
    
    songList.innerHTML = ""; // Limpa a lista antes de adicionar as músicas
    querySnapshot.forEach((doc) => {
        const song = doc.data();
        const li = document.createElement("li");
        li.textContent = song.title;
        li.addEventListener("click", () => tocarMusica(doc.id)); // Ao clicar, toca a música
        songList.appendChild(li);
    });
}

// Tocar a música selecionada
function tocarMusica(songId) {
    const docRef = doc(db, "songs", songId);
    onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            const videoId = new URL(data.videoUrl).searchParams.get("v");
            videoPlayer.src = `https://www.youtube.com/embed/${videoId}`;
            lyricsContainer.textContent = data.lyrics;
        } else {
            console.error("Música não encontrada!");
        }
    });
}

// Carrega as músicas ao iniciar
carregarMusicas();
