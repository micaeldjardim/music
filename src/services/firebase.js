import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

const db = window.firebaseDB;

/**
 * Obtém a lista de músicas do Firestore.
 * @returns {Promise<Array>} - Lista de músicas.
 */
export async function getMusicas() {
  const musicasCol = collection(db, "musicas");
  const musicasSnapshot = await getDocs(musicasCol);
  const musicasList = musicasSnapshot.docs.map(doc => doc.data());
  return musicasList;
}
