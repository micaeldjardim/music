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
                // Remover qualquer listener anterior para evitar duplicação
                dashboardLink.removeEventListener('click', handleDashboardClick);
                // Adicionar o evento de clique
                dashboardLink.addEventListener('click', handleDashboardClick);
            }
            window.isUserLoggedIn = false;
        }
    });

    // Função para lidar com o clique no ícone de dashboard quando não logado
    function handleDashboardClick(e) {
        e.preventDefault();
        loadLoginModal();
    }

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
    // Primeiro, certificamos que o login.css está carregado
    if (!document.querySelector('link[href$="/styles/login.css"]')) {
        const styleLink = document.createElement('link');
        styleLink.rel = 'stylesheet';
        styleLink.type = 'text/css';
        styleLink.href = './styles/login.css';
        document.head.appendChild(styleLink);
    }

    // Carregamos também o Font Awesome se necessário
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const faLink = document.createElement('link');
        faLink.rel = 'stylesheet';
        faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
        document.head.appendChild(faLink);
    }

    fetch('./auth/login.html')
      .then(response => response.text())
      .then(html => {
        // Criar um DOM temporário com o HTML carregado
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Obter o conteúdo do container-login
        const loginContainer = doc.querySelector('.container-login');
        
        // Modificar o HTML para incluir no auth-modal-content
        const modalContainer = document.getElementById('modal-container');
        modalContainer.innerHTML = `
          <div class="auth-modal">
            <div class="auth-modal-content">
              <span class="auth-modal-close">&times;</span>
              ${loginContainer.innerHTML}
            </div>
          </div>
        `;

        // Adiciona o evento de clique para fechar o modal com o X
        const closeModalButton = document.querySelector('.auth-modal-close');
        if (closeModalButton) {
          closeModalButton.addEventListener('click', closeModal2);
        }

        // Adiciona o evento para fechar o modal ao clicar fora dele
        const modal = document.querySelector('.auth-modal');
        if (modal) {
          modal.addEventListener('click', (event) => {
            // Verifica se o clique foi no background (fora do conteúdo do modal)
            if (event.target === modal) {
              closeModal2();
            }
          });
        }

        // Exibe o modal
        document.querySelector('.auth-modal').style.display = 'block';

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
    // Certificar que o login.css está carregado
    if (!document.querySelector('link[href$="/styles/login.css"]')) {
        const styleLink = document.createElement('link');
        styleLink.rel = 'stylesheet';
        styleLink.type = 'text/css';
        styleLink.href = './styles/login.css';
        document.head.appendChild(styleLink);
    }

    // Carregamos também o Font Awesome se necessário
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const faLink = document.createElement('link');
        faLink.rel = 'stylesheet';
        faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
        document.head.appendChild(faLink);
    }
    
    fetch('./auth/register.html')
      .then(response => response.text())
      .then(html => {
        // Criar um DOM temporário com o HTML carregado
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Obter o conteúdo do container-login
        const registerContainer = doc.querySelector('.container-login');
        
        // Modificar o HTML para incluir no auth-modal-content
        const modalContainer = document.getElementById('modal-container');
        modalContainer.innerHTML = `
          <div class="auth-modal">
            <div class="auth-modal-content">
              <span class="auth-modal-close">&times;</span>
              ${registerContainer.innerHTML}
            </div>
          </div>
        `;

        // Adiciona o evento de clique para fechar o modal
        const closeModalButton = document.querySelector('.auth-modal-close');
        if (closeModalButton) {
          closeModalButton.addEventListener('click', closeModal2);
        }

        // Adiciona o evento para fechar o modal ao clicar fora dele
        const modal = document.querySelector('.auth-modal');
        if (modal) {
          modal.addEventListener('click', (event) => {
            // Verifica se o clique foi no background (fora do conteúdo do modal)
            if (event.target === modal) {
              closeModal2();
            }
          });
        }

        // Exibe o modal
        document.querySelector('.auth-modal').style.display = 'block';

        // Em vez de carregar o script, configuramos os eventos diretamente aqui
        setupRegisterEvents();
      })
      .catch(error => console.error('Erro ao carregar o modal de registro:', error));
}

// Nova função para configurar eventos do registro
async function setupRegisterEvents() {
    const emailInput = document.getElementById("email");
    const registerButton = document.getElementById("register-button");

    if (!emailInput || !registerButton) {
        console.error("Elementos de registro não encontrados no DOM");
        return;
    }

    // Importar funções do Firebase necessárias
    const { 
        createUserWithEmailAndPassword, 
        sendPasswordResetEmail 
    } = await import("https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js");

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
            closeModal2();
            loadLoginModal(); // Redireciona para o login após registro

        } catch (error) {
            console.error("Erro ao registrar:", error);
            handleRegisterError(error);
        }
    });
}

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
        case "auth/weak-password":
            message = "A senha é muito fraca.";
            break;
    }

    alert(message);
}

function closeModal2() {
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
      modalContainer.innerHTML = ''; // Remove o conteúdo do modal
    }
}