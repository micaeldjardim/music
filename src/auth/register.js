console.log("register.js carregado com sucesso!");

import { auth } from "./firebase2.js";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Selecionando elementos
const registerButton = document.getElementById("register-button");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

// Habilitar botão de registro apenas quando os campos estiverem preenchidos
function toggleRegisterButton() {
  registerButton.disabled = !nameInput.value || !emailInput.value || !passwordInput.value;
}

nameInput.addEventListener("input", toggleRegisterButton);
emailInput.addEventListener("input", toggleRegisterButton);
passwordInput.addEventListener("input", toggleRegisterButton);

// Evento de registro
registerButton.addEventListener("click", async () => {
  const name = nameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;

  console.log("Tentando registrar com:", { name, email, password });

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log("Usuário criado:", user);

    await updateProfile(user, { displayName: name });
    await sendEmailVerification(user);

    alert("Conta criada com sucesso! Verifique seu e-mail antes de fazer login.");
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
    case "auth/weak-password":
      message = "A senha deve ter pelo menos 6 caracteres.";
      break;
    case "auth/invalid-email":
      message = "O e-mail fornecido é inválido.";
      break;
  }

  alert(message);
}
