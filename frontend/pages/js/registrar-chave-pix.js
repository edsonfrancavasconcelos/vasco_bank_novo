document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("register-form");
  const pixKeyInput = document.getElementById("pix-key");
  const nomeInput = document.getElementById("nome");
  const pixError = document.getElementById("pix-error");
  const nomeError = document.getElementById("nome-error");
  const successMessage = document.getElementById("success-message");

  form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const pixKey = pixKeyInput.value.trim();
      const nome = nomeInput.value.trim();

      pixError.textContent = "";
      nomeError.textContent = "";
      successMessage.textContent = "";

      if (!pixKey) {
          pixError.textContent = "Por favor, insira uma chave Pix.";
          return;
      }
      if (!nome) {
          nomeError.textContent = "Por favor, insira um nome completo.";
          return;
      }

      try {
          const response = await fetch("http://localhost:3000/api/pix/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chave: pixKey, nome })
          });
          const data = await response.json();

          if (response.ok) {
              successMessage.textContent = "Chave Pix registrada com sucesso!";
              form.reset();
          } else {
              pixError.textContent = data.error || "Erro ao registrar chave.";
          }
      } catch (error) {
          pixError.textContent = "Erro ao conectar ao servidor.";
      }
  });
});