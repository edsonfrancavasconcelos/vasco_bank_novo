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

    const messageEl = document.getElementById("message");

    // Validação básica
    if (password !== confirmPassword) {
      messageEl.textContent = "As senhas não coincidem";
      messageEl.className = "mt-3 text-danger";
      return;
    }

    if (!fullName || !email || !cpf || !rg || !address || !password || isNaN(initialBalance)) {
      messageEl.textContent = "Todos os campos são obrigatórios";
      messageEl.className = "mt-3 text-danger";
      return;
    }

    try {
      const payload = {
        fullName,
        email,
        cpf,
        rg,
        address,
        password,
        initialBalance,
      };
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
        const errorMsg =
          data?.errors?.map((e) => e.msg).join(" - ") ||
          data?.error ||
          "Erro ao criar conta";
        throw new Error(errorMsg);
      }

      localStorage.setItem("token", data.token);
      console.log("Token salvo:", data.token);

      messageEl.textContent = `Conta criada com sucesso! Seu número da conta é: ${data.accountNumber}`;
      messageEl.className = "mt-3 text-success";
    } catch (error) {
      console.error("Erro ao criar conta:", error);
      messageEl.textContent = `Erro: ${error.message}`;
      messageEl.className = "mt-3 text-danger";
    }
  });
