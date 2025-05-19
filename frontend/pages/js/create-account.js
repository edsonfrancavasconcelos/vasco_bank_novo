document.getElementById("createAccountForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  let cpf = document.getElementById("cpf").value.trim();
  const rg = document.getElementById("rg").value.trim();
  const address = document.getElementById("address").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  let phone = document.getElementById("phone-number").value.trim();
  const initialBalance = parseFloat(document.getElementById("initialBalance").value);

  const messageEl = document.getElementById("message");

  // Função para limpar máscaras
  const cleanInput = (input) => input.replace(/[\D]/g, '');

  // Limpar CPF e telefone
  cpf = cleanInput(cpf);
  phone = cleanInput(phone);

  // Validações
  if (password !== confirmPassword) {
    console.error("Erro: senhas não coincidem");
    messageEl.innerHTML = '<div class="alert alert-danger">As senhas não coincidem!</div>';
    return;
  }
  if (password.length < 6) {
    console.error("Erro: senha muito curta");
    messageEl.innerHTML = '<div class="alert alert-danger">A senha deve ter pelo menos 6 caracteres!</div>';
    return;
  }
  if (!password) {
    console.error("Erro: senha vazia");
    messageEl.innerHTML = '<div class="alert alert-danger">A senha não pode estar vazia!</div>';
    return;
  }
  if (!fullName || !email || !cpf || !rg || !address || !phone || isNaN(initialBalance)) {
    console.error("Erro: campos obrigatórios ausentes");
    messageEl.innerHTML = '<div class="alert alert-danger">Todos os campos são obrigatórios!</div>';
    return;
  }
  if (!/^\d{11}$/.test(phone)) {
    console.error("Erro: telefone inválido", phone);
    messageEl.innerHTML = '<div class="alert alert-danger">Telefone inválido! Use 11 dígitos numéricos (ex.: 81998779876)</div>';
    return;
  }
  if (!/^\d{11}$/.test(cpf)) {
    console.error("Erro: CPF inválido", cpf);
    messageEl.innerHTML = '<div class="alert alert-danger">CPF inválido! Use 11 dígitos numéricos (ex.: 98798798778)</div>';
    return;
  }
  if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    console.error("Erro: email inválido", email);
    messageEl.innerHTML = '<div class="alert alert-danger">E-mail inválido!</div>';
    return;
  }

  const payload = {
    fullName,
    email,
    cpf,
    rg,
    address,
    password,
    phone,
    initialBalance,
  };
  console.log("Payload enviado:", { ...payload, password: '[HIDDEN]' });

  try {
    const response = await fetch("http://localhost:3000/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("Status da resposta:", response.status, response.statusText);
    const text = await response.text();
    console.log("Resposta bruta:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Erro ao parsear JSON:", e, "Resposta:", text);
      throw new Error("Resposta do servidor não é JSON válida");
    }
    console.log("Resposta do backend:", data);

    if (!response.ok) {
      const errorMsg = data?.error || data?.message || `Erro ao criar conta: ${response.statusText}`;
      throw new Error(errorMsg);
    }

    localStorage.setItem("token", data.token);
    console.log("Token salvo:", data.token);

    messageEl.innerHTML = `<div class="alert alert-success">Conta criada com sucesso! Seu número da conta é: ${data.user.accountNumber}. Redirecionando...</div>`;
    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);
  } catch (error) {
    console.error("Erro ao criar conta:", error);
    messageEl.innerHTML = `<div class="alert alert-danger">Erro: ${error.message}</div>`;
  }
});