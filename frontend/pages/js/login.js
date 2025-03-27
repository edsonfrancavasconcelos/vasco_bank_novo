// frontend/pages/js/login.js
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const message = document.getElementById("message");

  const body = { email, password };

  try {
    console.log("Enviando login:", body); // Debug
    const response = await fetch("/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro desconhecido");
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);
    console.log("Login bem-sucedido, token salvo:", data.token);
    message.textContent = "Login realizado com sucesso!";
    message.className = "mt-3 text-success";

    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1000);
  } catch (error) {
    console.error("Erro no login:", error); // Linha ~24
    message.textContent = `Erro: ${error.message}`;
    message.className = "mt-3 text-danger";
  }
});
