document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const message = document.getElementById("message");

  if (!email || !password) {
    message.textContent = "Por favor, preencha todos os campos.";
    message.className = "mt-3 text-danger";
    return;
  }
  

  const body = { email, password };
  console.log("Tentando logar com:", email, password);


  try {
    console.log("Enviando login:", body);
    const response = await fetch("/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erro desconhecido");
    }

    localStorage.setItem("token", data.token);
    console.log("Login bem-sucedido, token salvo:", data.token);
    message.textContent = "Login realizado com sucesso!";123456
    message.className = "mt-3 text-success";

    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1000);
  } catch (error) {
    console.error("Erro no login:", error);
    message.textContent = `Erro: ${error.message}`;
    message.className = "mt-3 text-danger";
  }
});
async function loginUser(email, password) {
  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao fazer login');
    }
    localStorage.setItem('token', data.token);
    localStorage.setItem('userName', data.name); // Salva o nome
    window.location.href = '/dashboard.html';
  } catch (error) {
    console.error('Erro no login:', error);
    alert(error.message);
  }
}

// Exemplo de uso com formulário
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  await loginUser(email, password);
});
