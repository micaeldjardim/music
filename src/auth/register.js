import { auth } from "./firebase2.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { validateEmail } from "./validations.js";

console.log("register.js carregado com sucesso!");

// Verifica se os elementos existem antes de adicionar os event listeners
const emailInput = document.getElementById("email");
const registerButton = document.getElementById("register-button");

if (emailInput) {
  emailInput.addEventListener("change", () => {
    const email = emailInput.value;
    const emailInvalidError = document.getElementById("email-invalid-error");

    if (!validateEmail(email)) {
      emailInvalidError.style.display = "block";
    } else {
      emailInvalidError.style.display = "none";
    }
  });
}

if (registerButton) {
  registerButton.addEventListener("click", () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const emailInvalidError = document.getElementById("email-invalid-error");

    if (!validateEmail(email)) {
      emailInvalidError.style.display = "block";
      return;
    } else {
      emailInvalidError.style.display = "none";
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("Usuário registrado com sucesso!", userCredential.user);
        alert("Registro realizado com sucesso!");
      })
      .catch((error) => {
        console.error("Erro ao registrar:", error.message);
        alert("Erro: " + error.message);
      });
  });
}
