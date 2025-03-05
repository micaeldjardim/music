// services/musicService.js
import { getMusicas } from "./firebase.js";
import { extrairVideoId } from "../components/player.js";

let allMusicas = [];

/**
 * Carrega as músicas do Firebase e renderiza a lista, utilizando a callback
 * passada para quando uma música for selecionada.
 * @param {Function} callbackSelectMusic - Função executada ao selecionar uma música.
 */
export async function carregarMusicas(callbackSelectMusic) {
  allMusicas = await getMusicas();
  renderMusicList(callbackSelectMusic);
}

/**
 * Renderiza a lista de músicas filtradas de acordo com o termo pesquisado.
 * @param {Function} callbackSelectMusic - Função executada ao clicar em uma música.
 */
export function renderMusicList(callbackSelectMusic) {
  const container = document.getElementById("music-list");
  container.innerHTML = "";
  const searchTerm = document.getElementById("search-input").value.toLowerCase();
  const filtered = allMusicas.filter(musica =>
    musica.titulo.toLowerCase().includes(searchTerm)
  );
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
    div.onclick = () => callbackSelectMusic(musica);
    container.appendChild(div);
  });
}
