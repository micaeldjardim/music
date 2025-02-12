// Importa Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAj8tz3-q2J100xpnpuG1c6aHKtSd2NtNU",
  authDomain: "music-7cc5c.firebaseapp.com",
  projectId: "music-7cc5c",
  storageBucket: "music-7cc5c.firebasestorage.app",
  messagingSenderId: "470144799962",
  appId: "1:470144799962:web:7908aa0ef1d88e81ce81e3",
  measurementId: "G-QZ8ZYGCWW0"
};

// Inicializa Firebase e Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Exporta a configuração para ser usada em outros arquivos
export { db };
