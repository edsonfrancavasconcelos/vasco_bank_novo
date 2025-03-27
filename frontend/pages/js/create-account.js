// frontend/pages/js/create-account.js
document
  .getElementById("createAccountForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const cpf = document.getElementById("cpf").value;
    const rg = document.getElementById("rg").value;
    const address = document.getElementById("address").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const initialBalance = parseFloat(
      document.getElementById("initialBalance").value
    );

    if (password !== confirmPassword) {
      document.getElementById("message").textContent =
        "As senhas não coincidem";
      document.getElementById("message").className = "mt-3 text-danger";
      return;
    }

    try {
      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          cpf,
          rg,
          address,
          password,
          initialBalance,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao criar conta");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token); // Salva o token pra login posterior
      console.log("Token salvo:", data.token); // Debug
      document.getElementById(
        "message"
      ).textContent = `Conta criada com sucesso! Seu número da conta é: ${data.accountNumber}`;
      document.getElementById("message").className = "mt-3 text-success";
      // Removido o redirecionamento automático
    } catch (error) {
      console.error("Erro ao criar conta:", error);
      document.getElementById("message").textContent = `Erro: ${error.message}`;
      document.getElementById("message").className = "mt-3 text-danger";
    }
  });
