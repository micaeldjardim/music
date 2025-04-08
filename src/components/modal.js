// Armazena referências para navegação após o fechamento do modal
let navActions = null;

/**
 * Exibe o modal com o resultado baseado na porcentagem de acertos e número de estrelas.
 * @param {number} percentage - Porcentagem de acertos.
 * @param {number} stars - Número de estrelas (1 a 3).
 * @param {Object} detalhes - Detalhes adicionais da performance.
 */
export function showResultPopup(percentage, stars, detalhes = {}) {
    // Limpar qualquer ação de navegação pendente
    navActions = null;
    
    // Salvar os dados de resultado para referência
    const resultadoCompleto = {
        percentual: percentage,
        estrelas: stars,
        pontuacao: detalhes.pontuacao || 0,
        fatorTempo: detalhes.fatorTempo || 1,
        precisao: detalhes.precisao || 0,
        totalCorretas: detalhes.totalCorretas || 0,
        totalQuestoes: detalhes.totalQuestoes || 0
    };
    
    localStorage.setItem('ultimoResultado', JSON.stringify(resultadoCompleto));
    
    // Recuperar a música atual do localStorage
    const musicaAtual = JSON.parse(localStorage.getItem('musicaAtual') || '{}');
    
    // Remover qualquer modal existente
    let modal = document.getElementById("resultModal");
    if (modal) {
        document.body.removeChild(modal); 
        modal = null;
    }
    
    // Criar o iframe container para o modal
    modal = document.createElement('div');
    modal.id = 'resultModal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.zIndex = '10000';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    document.body.appendChild(modal);
    
    const titulo = stars === 3 ? 'Você mandou muito bem!' : 
                   stars === 2 ? 'Bom trabalho!' : 
                   'Continue praticando!';
    
    // Criar o HTML do modal com botões como links <a> simples
    const pathProxima = window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
    const pathExplicacao = window.location.pathname.includes('/pages/') ? 'explicacao.html' : 'pages/explicacao.html';
    const pathDashboard = window.location.pathname.includes('/pages/') ? 'dashboard.html' : 'pages/dashboard.html';
    
    modal.innerHTML = `
        <div class="modal-overlay" id="modal-overlay"></div>
        <div class="modal-content" onclick="event.stopPropagation()">
            <h1>${titulo}</h1>
            
            <div class="estrelas-container">
                ${[1, 2, 3].map(i => `
                    <img src="https://cdn-icons-png.flaticon.com/512/1828/1828884.png" 
                         class="estrela" id="estrela${i}" 
                         alt="Estrela ${i}" 
                         style="${i > stars ? 'display:none;' : ''}">
                `).join('')}
            </div>
            
            <div id="pontos">+${detalhes.pontuacao} pontos</div>
            
            <div class="detalhes">
                <p><span>Acertos:</span> <span id="acertos">${detalhes.totalCorretas}/${detalhes.totalQuestoes}</span></p>
                <p><span>Precisão:</span> <span id="precisao">${percentage}%</span></p>
                <p><span>Fator tempo:</span> <span id="fator-tempo">${detalhes.fatorTempo}x</span></p>
            </div>
            
            <div class="icon-container">
                <div class="left-icons">
                    <a href="javascript:void(0)" onclick="window.location.reload()" class="icon-btn small" title="Jogar novamente">
                        <img src="${window.location.pathname.includes('/pages/') ? '../img/reload.png' : 'img/reload.png'}" alt="Jogar novamente" style="width: 24px; height: 24px;">
                    </a>
                    <a href="${window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html'}" class="icon-btn small" title="Voltar para a página principal">
                        <img src="${window.location.pathname.includes('/pages/') ? '../img/home.png' : 'img/home.png'}" alt="Home" style="width: 24px; height: 24px;">
                    </a>
                </div>
                <div class="center-icon">
                    <a href="${pathProxima}" onclick="localStorage.setItem('navegarParaProxima', 'true')" class="icon-btn big" title="Próxima música">
                        <img src="${window.location.pathname.includes('/pages/') ? '../img/play.png' : 'img/play.png'}" alt="Próxima música" style="width: 32px; height: 32px;">
                    </a>
                </div>
                <div class="right-icons">
                    <a href="${pathExplicacao}?id=${musicaAtual.id || ''}" class="icon-btn small" title="Explicação gramatical">
                        <img src="${window.location.pathname.includes('/pages/') ? '../img/writing.png' : 'img/writing.png'}" alt="Explicação gramatical" style="width: 24px; height: 24px;">
                    </a>
                    <a href="${pathDashboard}" class="icon-btn small" title="Meu progresso">
                        <img src="${window.location.pathname.includes('/pages/') ? '../img/growth.png' : 'img/growth.png'}" alt="Meu progresso" style="width: 24px; height: 24px;">
                    </a>
                </div>
            </div>
        </div>
    `;
    
    // Adicionar estilo ao modal
    const style = document.createElement('style');
    style.textContent = `
        #resultModal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1000;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
        }
        
        .modal-content {
            background: radial-gradient(circle at top, #519ECF 0%, #f0f4f8 100%);
            padding: 2rem;
            border-radius: 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            position: relative;
            max-width: 500px;
            width: 90%;
            max-height: 90%;
            overflow-y: auto;
            text-align: center;
            color: #064D7A;
            font-family: 'Inter', sans-serif;
            z-index: 1001;
        }
        
        .close-button {
            position: absolute;
            top: 10px;
            right: 10px;
            font-size: 24px;
            background: transparent;
            border: none;
            cursor: pointer;
            color: #064D7A;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s;
            z-index: 1002;
        }
        
        .close-button:hover {
            background-color: rgba(0, 0, 0, 0.1);
        }
        
        .estrelas-container {
            margin-top: 2rem;
        }
        
        .estrela {
            width: 70px;
            margin: 10px;
            opacity: 1;
            transform: scale(1);
            display: inline-block;
            filter: drop-shadow(0 0 6px rgba(0,0,0,0.2));
        }
        
        #pontos {
            font-size: 2.625rem;
            margin: 2.5rem 0 1.875rem;
            color: #762379;
            font-weight: 700;
        }
        
        .detalhes {
            margin: 2rem auto;
            padding: 1rem;
            background: rgba(255,255,255,0.7);
            border-radius: 10px;
            max-width: 400px;
        }
        
        .detalhes p {
            margin: 0.5rem 0;
            display: flex;
            justify-content: space-between;
            padding: 0 1rem;
        }
        
        .detalhes p span:first-child {
            font-weight: bold;
            color: #064D7A;
        }
        
        .icon-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 2rem;
            margin-top: 2rem;
            flex-wrap: wrap;
            z-index: 1002;
        }
        
        .left-icons, .center-icon, .right-icons {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .left-icons, .right-icons {
            flex-direction: column;
            gap: 1rem;
        }
        
        .icon-btn {
            border: none;
            cursor: pointer !important;
            transition: transform 0.2s ease;
            background-color: #064D7A;
            color: #fff !important;
            border-radius: 50%;
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none !important;
            font-weight: bold;
            text-align: center;
            z-index: 1002;
            position: relative;
        }
        
        .icon-btn:hover {
            transform: scale(1.15);
            text-decoration: none !important;
        }
        
        .icon-btn.small {
            font-size: 1.5rem;
            width: 60px;
            height: 60px;
        }
        
        .icon-btn.big {
            font-size: 2rem;
            width: 80px;
            height: 80px;
        }
        
        /* Garantir que links não herdem estilos não desejados */
        .icon-btn:link, .icon-btn:visited, .icon-btn:hover, .icon-btn:active {
            color: #fff !important;
            text-decoration: none !important;
        }
    `;
    document.head.appendChild(style);

    // Animar pontuação apenas se GSAP estiver disponível
    setTimeout(() => {
        // Animar pontuação se GSAP estiver disponível
        if (typeof gsap !== 'undefined') {
            let pontosObj = { val: 0 };
            gsap.to(pontosObj, {
                duration: 1.5,
                val: detalhes.pontuacao,
                onUpdate: () => {
                    const pontosElement = document.getElementById("pontos");
                    if (pontosElement) {
                        pontosElement.innerText = "+" + Math.floor(pontosObj.val) + " pontos";
                    }
                },
                onComplete: () => {
                    if (stars === 3) {
                        dispararConfete();
                    }
                }
            });
            
            // Animar estrelas se GSAP estiver disponível
            const tl = gsap.timeline();
            for (let i = 1; i <= stars; i++) {
                const estrela = document.getElementById(`estrela${i}`);
                if (estrela) {
                    // Redefinir primeiro para garantir que a animação funcione
                    estrela.style.opacity = '0';
                    estrela.style.transform = 'scale(0)';
                    
                    // Animar
                    tl.to(estrela, { 
                        delay: 0.2 * i, 
                        scale: 1, 
                        opacity: 1, 
                        duration: 0.5, 
                        ease: "bounce.out" 
                    }, i === 1 ? 0 : "-=0.3");
                }
            }
        } else {
            // Sem animação se GSAP não estiver disponível
            if (stars === 3) {
                dispararConfete();
            }
        }
        
        // Som de vitória
        tocarSomVitoria();
    }, 300);
}

/**
 * Fecha o modal de resultado.
 */
export function closeModal() {
    const modal = document.getElementById("resultModal");
    if (modal) {
        document.body.removeChild(modal);
    }
}

/**
 * Dispara efeito de confete
 */
function dispararConfete() {
    if (typeof confetti !== 'function') {
        console.warn("Biblioteca confetti não foi carregada");
        return;
    }

    try {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#FFC0CB', '#00FFFF', '#FF69B4', '#7FFF00']
        });
        
        setTimeout(() => {
            confetti({
              particleCount: 50,
              angle: 60,
              spread: 80,
              origin: { x: 0 }
            });
            confetti({
              particleCount: 50,
              angle: 120,
              spread: 80,
              origin: { x: 1 }
            });
        }, 750);
    } catch (error) {
        console.warn("Erro ao disparar confetes:", error);
    }
}

/**
 * Toca o som de vitória
 */
function tocarSomVitoria() {
    try {
        // Opção 1: Usar Howler.js se disponível
        if (typeof Howl !== 'undefined') {
            const somVitoria = new Howl({
                src: ['../assets/sounds/success.mp3', 'assets/sounds/success.mp3'],  // Tentar caminhos alternativos
                volume: 0.7,
                onloaderror: function() {
                    // Fallback para Web Audio API
                    tocarSomFallback();
                }
            });
            somVitoria.play();
        } else {
            // Fallback para Web Audio API
            tocarSomFallback();
        }
    } catch (error) {
        console.warn("Erro ao tocar som de vitória:", error);
        tocarSomFallback();
    }
}

// Fallback para som de vitória usando Web Audio API
function tocarSomFallback() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Tocar notas ascendentes
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.2); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.4); // G5
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.8);
    } catch (error) {
        console.warn("Fallback de áudio também falhou:", error);
    }
}
