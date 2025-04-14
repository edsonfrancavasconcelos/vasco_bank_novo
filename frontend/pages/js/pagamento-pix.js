document.addEventListener("DOMContentLoaded", () => {
  const pixKeyInput = document.getElementById("pix-key");
  const recipientInfo = document.getElementById("recipient-info");
  const pixError = document.getElementById("pix-error");
  const pixLoading = document.getElementById("pix-loading");
  const submitBtn = document.getElementById("submit-btn");
  const form = document.getElementById("payment-form");

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
              recipientInfo.textContent = `Você está pagando para ${data.nome}`;
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
      const description = document.getElementById("description").value.trim();

      if (!pixKey || !amount) {
          pixError.textContent = "Preencha a chave Pix e o valor.";
          return;
      }

      try {
          await fetch("http://localhost:3000/api/pix/transaction", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  tipo: "pagamento",
                  chave: pixKey,
                  nome: recipientInfo.textContent.replace("Você está pagando para ", ""),
                  valor: amount,
                  descricao: description || "Nenhuma",
                  data: new Date().toISOString()
              })
          });
          alert(`Pagamento de R$${amount.toFixed(2)} realizado com sucesso!`);
          form.reset();
          recipientInfo.classList.add("hidden");
          pixLoading.textContent = "";
          submitBtn.disabled = true;
      } catch (error) {
          pixError.textContent = "Erro ao realizar pagamento.";
      }
  });
});