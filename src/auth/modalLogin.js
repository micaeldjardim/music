window.onload = () => {
    setTimeout(() => {
      loadLoginModal();
    }, 5000); // 10 segundos
};

document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button');
    if (loginButton) {
      loginButton.addEventListener('click', (event) => {
        event.preventDefault(); // Evita o comportamento padrão do link
        loadLoginModal(); // Chama a função para abrir o modal
      });
    }
});

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

        // Carrega o script login.js dinamicamente
        const script = document.createElement('script');
        script.type = 'module';
        script.src = './auth/login.js';
        document.body.appendChild(script);
      })
      .catch(error => console.error('Erro ao carregar o modal de login:', error));
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