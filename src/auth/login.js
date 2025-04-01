console.log("login.js carregado com sucesso!");

import { auth } from "./firebase2.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { validateEmail } from "./validations.js";

// Verifica se os elementos existem antes de adicionar os event listeners
const emailInput = document.getElementById("email");
const loginButton = document.getElementById("login-button");

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

if (loginButton) {
  loginButton.addEventListener("click", () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Validação de e-mail e senha
    if (!validateEmail(email)) {
      alert("Email inválido!");
      return;
    }

    if (!password) {
      alert("Senha é obrigatória!");
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("Login bem-sucedido!", userCredential.user);
        alert("Login realizado com sucesso!");
      })
      .catch((error) => {
        console.error("Erro ao logar:", error.message);
        alert("Erro: " + error.message);
      });
  });
}

document.getElementById("email").addEventListener("change", onChangeEmail);
document.getElementById("password").addEventListener("change", onChangePassword);

function onChangeEmail() {
    toggleButtonsDisable();
    toggleEmailErrors();
}

function onChangePassword() {
    toggleButtonsDisable();
    togglePasswordErrors();
}

function isEmailValid() {
    const email = form.email().value;
    if (!email) {
        return false;
    }
    return validateEmail(email);
}

function toggleEmailErrors() {
    const email = form.email().value;
    form.emailRequiredError().style.display = email ? "none" : "block";
    form.emailInvalidError().style.display = validateEmail(email) ? "none" : "block";
}

function togglePasswordErrors() {
    const password = document.getElementById("password").value;
    form.passwordRequiredError().style.display = password ? "none" : "block";
}

function toggleButtonsDisable() {
    const emailValid = isEmailValid();
    form.recoveryPasswordButton().disabled = !emailValid;

    const passwordValid = isPasswordValid();
    form.loginButton().disabled = !(emailValid && passwordValid);
}

function isPasswordValid() {
    const password = form.password().value;
    if (!password) {
        return false;
    }
    return true;
}

const form = {
    email: () => document.getElementById("email"),
    emailInvalidError: () => document.getElementById("email-invalid-error"),
    emailRequiredError: () => document.getElementById("email-required-error"),
    password: () => document.getElementById("password"),
    passwordRequiredError: () => document.getElementById("password-required-error"),
    loginButton: () => document.getElementById("login-button"),
    recoveryPasswordButton: () => document.getElementById("recovery-password-button")
};