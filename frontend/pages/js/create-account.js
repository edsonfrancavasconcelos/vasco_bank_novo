document.getElementById("createAccountForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Pegar os valores do formulário
  const fullName = document.getElementById("fullName").value;
  const email = document.getElementById("email").value;
  const cpf = (document.getElementById("cpf").value || "").replace(/[^\d]/g, "").padStart(11, "0").slice(0, 11);
  const rg = document.getElementById("rg").value;
  const address = document.getElementById("address").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const initialBalance = parseFloat(document.getElementById("initialBalance").value) || 0;

  console.log("CPF ajustado:", cpf);
  console.log("Dados enviados:", { fullName, email, cpf, rg, address, password, initialBalance });

  if (password !== confirmPassword) {
      document.getElementById("message").textContent = "As senhas não coincidem";
      document.getElementById("message").className = "mt-3 text-danger";
      return;
  }

  try {
      const response = await fetch("/api/users/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName, email, cpf, rg, address, password, initialBalance }),
      });

      const data = await response.json();
      console.log("Resposta do backend:", data);

      if (!response.ok) {
          throw new Error(data.error || "Erro ao criar conta");
      }

      // Pegar o accountNumber e exibir na hora
      const accountNumber = data.accountNumber || "ERRO: número não recebido";
      console.log("Número da conta:", accountNumber);
      document.getElementById("message").textContent = `Conta criada com sucesso! Seu número da conta é: ${accountNumber}`;
      document.getElementById("message").className = "mt-3 text-success";
  } catch (error) {
      console.error("Erro no frontend:", error);
      document.getElementById("message").textContent = `Erro: ${error.message}`;
      document.getElementById("message").className = "mt-3 text-danger";
  }
});