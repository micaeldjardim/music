import { db } from "./firebase.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Elementos do formulário
const titleInput = document.getElementById("title");
const videoUrlInput = document.getElementById("videoUrl");
const lyricsInput = document.getElementById("lyrics");
const addSongButton = document.getElementById("addSong");

// Adiciona a música ao Firestore
addSongButton.addEventListener("click", async () => {
    const title = titleInput.value.trim();
    const videoUrl = videoUrlInput.value.trim();
    const lyrics = lyricsInput.value.trim();

    if (!title || !videoUrl || !lyrics) {
        alert("Preencha todos os campos!");
        return;
    }

    try {
        await addDoc(collection(db, "songs"), {
            title: title,
            videoUrl: videoUrl,
            lyrics: lyrics
        });

        alert("Música adicionada com sucesso!");
        titleInput.value = "";
        videoUrlInput.value = "";
        lyricsInput.value = "";
    } catch (error) {
        console.error("Erro ao adicionar música:", error);
    }
});
