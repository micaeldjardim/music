console.log("login.js carregado com sucesso!");

import { auth } from "./firebase2.js";
import { 
    signInWithEmailAndPassword, 
    sendPasswordResetEmail, 
    GoogleAuthProvider, 
    FacebookAuthProvider, 
    signInWithPopup, 
    fetchSignInMethodsForEmail 
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Selecionando elementos
const emailInput = document.getElementById("email");
const loginButton = document.getElementById("submit-login");
const recoveryButton = document.getElementById("recovery-password-button");
const loginForm = document.getElementById("login-form");

// Variável global para armazenar o email digitado
window.lastEmailInput = "";

// Função para verificar se o email existe
async function checkEmailExists(email) {
  try {
    await signInWithEmailAndPassword(auth, email, "senha_teste_incorreta");
    // Se não disparar erro (improvável), retorna true
    return true;
  } catch (error) {
    if (error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential") {
      return true; // E-mail existe, mas senha está errada
    } else if (error.code === "auth/user-not-found") {
      return false; // E-mail não cadastrado
    } else {
      console.error("Erro ao verificar e-mail:", error);
      return false;
    }
  }
}

// Habilitar botão de login apenas quando o email estiver preenchido
function toggleLoginButton() {
  loginButton.disabled = !emailInput.value;
}

emailInput.addEventListener("input", toggleLoginButton);

// Evento de submit do formulário
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = emailInput.value;
  window.lastEmailInput = email; // Armazena para possivelmente preencher no registro

  const emailExists = await checkEmailExists(email);
  
  if (!emailExists) {
    alert("Esse e-mail não está registrado. Por favor, registre-se ou verifique o e-mail digitado.");
    return;
  }
  
  // Se o e-mail existe, continua com o processo de login...
  let password = prompt("Digite sua senha:");
  if (!password) {
    alert("Por favor, digite sua senha.");
    return;
  }
  
  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Login realizado com sucesso!");
    closeModal2();
    window.location.reload();
  } catch (error) {
    handleLoginError(error);
  }
});

// Função para tratar erros de login
function handleLoginError(error) {
  let message = "Erro ao fazer login.";

  switch (error.code) {
    case "auth/wrong-password":
      message = "Senha incorreta.";
      break;
    case "auth/user-not-found":
      message = "Usuário não encontrado.";
      break;
    case "auth/invalid-email":
      message = "Email inválido.";
      break;
  }

  alert(message);
}

// Recuperação de senha
recoveryButton.addEventListener("click", async () => {
  const email = emailInput.value;
  
  if (!email) {
    alert("Digite seu e-mail para recuperar a senha.");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    alert("E-mail de recuperação enviado. Verifique sua caixa de entrada.");
  } catch (error) {
    alert("Erro ao enviar e-mail de recuperação. Verifique se o e-mail está correto.");
  }
});

// Login com Google
document.getElementById("google-login-button").addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("Usuário logado com Google:", result.user);
    closeModal2(); // Fechar o modal após login
    window.location.href = "/src/index.html";
  } catch (error) {
    console.error("Erro ao fazer login com Google:", error);
    alert("Erro ao fazer login com Google.");
  }
});

// Login com Facebook
document.getElementById("facebook-login-button").addEventListener("click", async () => {
  const provider = new FacebookAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);

    console.log("Usuário logado com Facebook:", result.user);
    window.location.href = "/src/index.html"; // Caminho absoluto
  } catch (error) {
    console.error("Erro ao fazer login com Facebook:", error);
    alert("Erro ao fazer login com Facebook.");
  }
});
