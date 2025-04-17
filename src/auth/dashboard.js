import { auth } from "../auth/firebase2.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Função para criar URLs corretos independente do ambiente
function getAppUrl(path) {
  // Verificar se estamos em desenvolvimento local
  const isLocalhost = window.location.hostname === "localhost" || 
                      window.location.hostname === "127.0.0.1";
  
  if (isLocalhost) {
    return `/src${path}`; // Adiciona /src para desenvolvimento local
  } else {
    return path; // Em produção, usa caminhos relativos à raiz
  }
}

// Verificar estado de autenticação
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Usuário está logado
    document.getElementById("user-email").textContent = user.email;
  } else {
    // Usuário não está logado, redirecionar para login
    window.location.href = getAppUrl("/index.html");
  }
});

// Função de logout
document.getElementById("logout-button").addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = getAppUrl("/index.html");
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    alert("Erro ao fazer logout");
  }
});