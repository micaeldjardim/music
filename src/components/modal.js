
/**
 * Exibe o modal com o resultado baseado na porcentagem de acertos e número de estrelas.
 * @param {number} percentage - Porcentagem de acertos.
 * @param {number} stars - Número de estrelas (1 a 3).
 */
export function showResultPopup(percentage, stars) {
    const modal = document.getElementById("resultModal");
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close" onclick="closeModal()">&times;</span>
        <h2>Resultado</h2>
        <p>Você acertou ${percentage}%.</p>
        <p>${stars === 3 ? "Excelente!" : stars === 2 ? "Bom trabalho!" : "Continue tentando!"}</p>
        <div class="stars">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</div>
      </div>
    `;
    modal.style.display = "block";
    modal.onclick = function(event) {
      if (event.target === modal) closeModal();
    };
  }
  
  /**
   * Fecha o modal de resultado.
   */
  export function closeModal() {
    const modal = document.getElementById("resultModal");
    modal.style.display = "none";
  }
  