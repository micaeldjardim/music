console.log("login.js carregado com sucesso!");

import { auth } from "./firebase2.js";
import { signInWithEmailAndPassword, sendPasswordResetEmail, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Selecionando elementos
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("submit-login");
const recoveryButton = document.getElementById("recovery-password-button");

// Habilitar botão de login apenas quando os campos estiverem preenchidos
function toggleLoginButton() {
  loginButton.disabled = !emailInput.value || !passwordInput.value;
}

emailInput.addEventListener("input", toggleLoginButton);
passwordInput.addEventListener("input", toggleLoginButton);

// Evento de login
document.getElementById("login-form").addEventListener("submit", async (event) => {
    event.preventDefault(); // Impede o recarregamento da página
    
    const email = emailInput.value;
    const password = passwordInput.value;
  
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      if (!user.emailVerified) {
        alert("Seu e-mail ainda não foi verificado. Por favor, verifique seu e-mail.");
        return;
      }
  
      alert("Login realizado com sucesso!");
      console.log("Usuário logado:", user);
    } catch (error) {
      handleLoginError(error);
    }
});
  

// Função para tratar erros de login
function handleLoginError(error) {
  let message = "Erro ao fazer login.";

  switch (error.code) {
    case "auth/invalid-email":
      message = "O e-mail fornecido é inválido.";
      break;
    case "auth/user-not-found":
      message = "Usuário não encontrado. Verifique o e-mail digitado.";
      break;
    case "auth/wrong-password":
      message = "Senha incorreta. Tente novamente.";
      break;
    case "auth/too-many-requests":
      message = "Muitas tentativas de login. Tente novamente mais tarde.";
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
    const user = result.user;
    console.log("Usuário logado com Google:", user);
    alert("Login com Google realizado com sucesso!");
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
    const user = result.user;
    console.log("Usuário logado com Facebook:", user);
    alert("Login com Facebook realizado com sucesso!");
  } catch (error) {
    console.error("Erro ao fazer login com Facebook:", error);
    alert("Erro ao fazer login com Facebook.");
  }
});
