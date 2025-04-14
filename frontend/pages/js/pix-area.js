document.addEventListener("DOMContentLoaded", () => {
  const pixKeysList = document.getElementById("pixKeysList");
  const pixKeysMessage = document.getElementById("pixKeysMessage");

  async function loadPixKeys() {
      try {
          // Faz a requisição pro endpoint do backend
          const response = await fetch("http://localhost:3000/api/pix/my-keys");
          const data = await response.json();

          // Verifica se há chaves e popula a lista
          if (data.keys && data.keys.length > 0) {
              pixKeysList.innerHTML = data.keys
                  .map(key => `<li class="list-group-item">${key.chave} - ${key.nome}</li>`)
                  .join("");
              pixKeysMessage.textContent = "";
          } else {
              pixKeysList.innerHTML = "";
              pixKeysMessage.textContent = "Nenhuma chave Pix registrada.";
          }
      } catch (error) {
          pixKeysMessage.textContent = "Erro ao carregar suas chaves. Tente novamente.";
          console.error("Erro na requisição:", error);
      }
  }

  // Carrega as chaves assim que a página abre
  loadPixKeys();
});