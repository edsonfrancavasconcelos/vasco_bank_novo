document.addEventListener("DOMContentLoaded", () => {
  const pixKeyInput = document.getElementById("pix-key");
  const recipientInfo = document.getElementById("recipient-info");
  const pixError = document.getElementById("pix-error");
  const pixLoading = document.getElementById("pix-loading");
  const submitBtn = document.getElementById("submit-btn");
  const form = document.getElementById("schedule-form");
  const successMessage = document.getElementById("success-message");

  function debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
          const later = () => {
              clearTimeout(timeout);
              func(...args);
          };
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
      };
  }

  const fetchRecipient = debounce(async (pixKey) => {
      pixError.textContent = "";
      pixLoading.textContent = "Buscando...";
      recipientInfo.classList.add("hidden");
      submitBtn.disabled = true;

      try {
          const response = await fetch(`http://localhost:3000/api/pix/recipient/${encodeURIComponent(pixKey)}`);
          const data = await response.json();

          pixLoading.textContent = "";
          if (data.nome) {
              recipientInfo.textContent = `Você está programando para ${data.nome}`;
              recipientInfo.classList.remove("hidden");
              submitBtn.disabled = false;
          } else {
              pixError.textContent = data.error || "Chave Pix não encontrada.";
          }
      } catch (error) {
          pixLoading.textContent = "";
          pixError.textContent = "Erro ao buscar destinatário.";
      }
  }, 500);

  pixKeyInput.addEventListener("input", () => {
      const pixKey = pixKeyInput.value.trim();
      if (pixKey) {
          fetchRecipient(pixKey);
      } else {
          pixError.textContent = "";
          pixLoading.textContent = "";
          recipientInfo.classList.add("hidden");
          submitBtn.disabled = true;
      }
  });

  form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const pixKey = pixKeyInput.value.trim();
      const amount = parseFloat(document.getElementById("amount").value);
      const date = document.getElementById("date").value;
      const description = document.getElementById("description").value.trim();

      if (!pixKey || !amount || !date) {
          pixError.textContent = "Preencha todos os campos obrigatórios.";
          return;
      }

      try {
          await fetch("http://localhost:3000/api/pix/schedule", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  chave: pixKey,
                  nome: recipientInfo.textContent.replace("Você está programando para ", ""),
                  valor: amount,
                  data: new Date(date).toISOString(),
                  descricao: description || "Nenhuma"
              })
          });
          successMessage.textContent = `Transferência de R$${amount.toFixed(2)} programada para ${new Date(date).toLocaleString()}!`;
          form.reset();
          recipientInfo.classList.add("hidden");
          pixLoading.textContent = "";
          submitBtn.disabled = true;
      } catch (error) {
          pixError.textContent = "Erro ao programar transação.";
      }
  });
});