import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDpK_Aw49OFg9mS6aEDz5FjpK2OlV9-wvA",
    authDomain: "fill-the-song.firebaseapp.com",
    projectId: "fill-the-song",
    storageBucket: "fill-the-song.firebasestorage.app",
    messagingSenderId: "597494138856",
    appId: "1:597494138856:web:029accd51127d1f5ab865d",
    measurementId: "G-LWCN77NQV5"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
