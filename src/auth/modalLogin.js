
import { auth } from "./firebase2.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Exportar funções para uso global
window.loadLoginModal = loadLoginModal;
window.loadRegisterModal = loadRegisterModal;
window.closeModal2 = closeModal2;

// Verificar autenticação ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button');
    const dashboardLink = document.getElementById('dashboard-link');
    const profileLink = document.querySelector("a[href='pages/dashboard.html']");

    // Observar mudanças no estado de autenticação
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Usuário está logado
            if (loginButton) loginButton.style.display = 'none';
            if (profileLink) profileLink.style.display = 'block';
            if (dashboardLink) {
                dashboardLink.href = 'pages/dashboard.html';
            }
            window.isUserLoggedIn = true;
        } else {
            // Usuário não está logado
            if (loginButton) loginButton.style.display = 'block';
            if (profileLink) profileLink.style.display = 'none';
            if (dashboardLink) {
                dashboardLink.href = '#';
                dashboardLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    loadLoginModal();
                });
            }
            window.isUserLoggedIn = false;
        }
    });

    // Evento de clique no botão de login
    if (loginButton) {
        loginButton.addEventListener('click', (event) => {
            event.preventDefault();
            if (!window.isUserLoggedIn) {
                loadLoginModal();
            }
        });
    }
});

// Modificar o window.onload para verificar autenticação
window.onload = () => {
    setTimeout(() => {
        if (!window.isUserLoggedIn) {
            loadLoginModal();
        }
    }, 5000);
};

function loadLoginModal() {
    fetch('./auth/login.html')
      .then(response => response.text())
      .then(html => {
        const modalContainer = document.getElementById('modal-container');
        modalContainer.innerHTML = `
          <div class="modal-overlay">
            <div class="modal-content">
              <span class="close-modal">&times;</span>
              ${html}
            </div>
          </div>
        `;

        // Adiciona o evento de clique para fechar o modal
        const closeModalButton = document.querySelector('.close-modal');
        if (closeModalButton) {
          closeModalButton.addEventListener('click', closeModal2);
        }


        // Configurar eventos do formulário de login
        setupLoginEvents();

      })
      .catch(error => console.error('Erro ao carregar o modal de login:', error));
}


// Nova função para configurar eventos do login
async function setupLoginEvents() {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const loginButton = document.getElementById('submit-login');
    const recoveryButton = document.getElementById('recovery-password-button');
    const googleButton = document.getElementById('google-login-button');
    const facebookButton = document.getElementById('facebook-login-button');

    // Importar funções do Firebase necessárias
    const { 
        signInWithEmailAndPassword, 
        sendPasswordResetEmail,
        GoogleAuthProvider,
        FacebookAuthProvider,
        signInWithPopup 
    } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js");

    // Habilitar botão de login quando email estiver preenchido
    if (emailInput && loginButton) {
        emailInput.addEventListener('input', () => {
            loginButton.disabled = !emailInput.value;
        });
    }

    // Login com email/senha
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = emailInput.value;
            const password = prompt("Digite sua senha:");

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
    }

    // Login com Google
    if (googleButton) {
        googleButton.addEventListener('click', async () => {
            try {
                const provider = new GoogleAuthProvider();
                const result = await signInWithPopup(auth, provider);
                console.log("Usuário logado com Google:", result.user);
                closeModal2();
                window.location.reload();
            } catch (error) {
                console.error("Erro ao fazer login com Google:", error);
                alert("Erro ao fazer login com Google.");
            }
        });
    }

    // Login com Facebook
    if (facebookButton) {
        facebookButton.addEventListener('click', async () => {
            try {
                const provider = new FacebookAuthProvider();
                const result = await signInWithPopup(auth, provider);
                console.log("Usuário logado com Facebook:", result.user);
                closeModal2();
                window.location.reload();
            } catch (error) {
                console.error("Erro ao fazer login com Facebook:", error);
                alert("Erro ao fazer login com Facebook.");
            }
        });
    }

    // Recuperação de senha
    if (recoveryButton && emailInput) {
        recoveryButton.addEventListener('click', async () => {
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
    }
}

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

function loadRegisterModal() {
    fetch('./auth/register.html')
      .then(response => response.text())
      .then(html => {
        const modalContainer = document.getElementById('modal-container');
        modalContainer.innerHTML = `
          <div class="modal-overlay">
            <div class="modal-content">
              <span class="close-modal">&times;</span>
              ${html}
            </div>
          </div>
        `;

        // Adiciona o evento de clique para fechar o modal
        const closeModalButton = document.querySelector('.close-modal');
        if (closeModalButton) {
          closeModalButton.addEventListener('click', closeModal2);
        }

        // Carrega o script register.js dinamicamente
        const script = document.createElement('script');
        script.type = 'module';
        script.src = './auth/register.js';
        document.body.appendChild(script);
      })
      .catch(error => console.error('Erro ao carregar o modal de registro:', error));
}

function closeModal2() {
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
      modalContainer.innerHTML = ''; // Remove o conteúdo do modal
    }
}