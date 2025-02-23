import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

const db = window.firebaseDB;

export async function getMusicas() {
  const musicasRef = collection(db, "musicas");
  const snapshot = await getDocs(musicasRef);
  let listaMusicas = [];
  snapshot.forEach(doc => {
    listaMusicas.push({ id: doc.id, ...doc.data() });
  });
  return listaMusicas;
}
