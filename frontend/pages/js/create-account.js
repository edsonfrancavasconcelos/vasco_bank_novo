// frontend/pages/js/create-account.js
document
  .getElementById("createAccountForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const rg = document.getElementById("rg").value.trim();
    const address = document.getElementById("address").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();
    const initialBalance = parseFloat(
      document.getElementById("initialBalance").value
    );

    console.log("Valores capturados:", { fullName, email, cpf, rg, address, password, initialBalance });

    if (password !== confirmPassword) {
      document.getElementById("message").textContent =
        "As senhas não coincidem";
      document.getElementById("message").className = "mt-3 text-danger";
      return;
    }

    if (!fullName || !email || !cpf || !rg || !address || !password) {
      document.getElementById("message").textContent =
        "Todos os campos são obrigatórios";
      document.getElementById("message").className = "mt-3 text-danger";
      return;
    }

    try {
      const payload = { fullName, email, cpf, rg, address, password, initialBalance };
      console.log("Payload enviado:", payload);
      const response = await fetch("http://localhost:3000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Resposta do backend:", response.status, data);

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar conta");
      }

      localStorage.setItem("token", data.token);
      console.log("Token salvo:", data.token);
      document.getElementById(
        "message"
      ).textContent = `Conta criada com sucesso! Seu número da conta é: ${data.accountNumber}`;
      document.getElementById("message").className = "mt-3 text-success";
    } catch (error) {
      console.error("Erro ao criar conta:", error);
      document.getElementById("message").textContent = `Erro: ${error.message}`;
      document.getElementById("message").className = "mt-3 text-danger";
    }
  });