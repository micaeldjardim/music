import { auth } from "../auth/firebase2.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Verificar estado de autenticação
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Usuário está logado
    document.getElementById("user-email").textContent = user.email;
  } else {
    // Usuário não está logado, redirecionar para login
    window.location.href = "../auth/login.html";
  }
});

// Função de logout
document.getElementById("logout-button").addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "/src/index.html";
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    alert("Erro ao fazer logout");
  }
});