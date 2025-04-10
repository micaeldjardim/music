console.log("register.js carregado com sucesso!");

import { auth } from "./firebase2.js";

import { createUserWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Selecionando elementos
const registerButton = document.getElementById("register-button");
const emailInput = document.getElementById("email");

// Habilitar botão quando email estiver preenchido
emailInput.addEventListener("input", () => {
  registerButton.disabled = !emailInput.value;
});

// Evento de registro
registerButton.addEventListener("click", async () => {
  const email = emailInput.value;

  console.log("Tentando registrar com:", { email });

  try {
    // Gerar uma senha temporária
    const tempPassword = Math.random().toString(36).slice(-8);

    // Criar usuário
    await createUserWithEmailAndPassword(auth, email, tempPassword);

    // Enviar email de redefinição de senha
    await sendPasswordResetEmail(auth, email);

    alert("Conta criada! Por favor, verifique seu email para definir sua senha.");
    window.location.href = "login.html";

  } catch (error) {
    console.error("Erro ao registrar:", error);
    handleRegisterError(error);
  }
});

// Função para tratar erros de registro
function handleRegisterError(error) {
  let message = "Erro ao criar conta.";

  switch (error.code) {
    case "auth/email-already-in-use":
      message = "Este e-mail já está cadastrado.";
      break;

    case "auth/invalid-email":
      message = "O e-mail fornecido é inválido.";
      break;
  }

  alert(message);
}
