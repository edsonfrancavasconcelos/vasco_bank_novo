document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("formCreateAccount");
  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const cpf = document.getElementById("cpf").value;
      if (validarCPF(cpf)) {
        await criarConta();
      } else {
        mostrarMensagem("⚠️ CPF inválido!", "error");
      }
    });
  } else {
    console.error(
      "⚠️ O formulário não foi encontrado! Verifique o ID 'formCreateAccount'."
    );
  }
});

function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, "");
  return cpf.length === 11;
}

async function criarConta() {
  const fullName = document.getElementById("fullName").value.trim();
  const cpf = document.getElementById("cpf").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document
    .getElementById("confirmPassword")
    .value.trim();
  const phone = document.getElementById("phone").value.trim();

  console.log("Dados do formulário:", {
    fullName,
    cpf,
    email,
    password,
    phone,
  });

  if (!fullName) {
    mostrarMensagem("⚠️ Insira seu nome completo!", "error");
    return;
  }
  if (!cpf) {
    mostrarMensagem("⚠️ Insira um CPF válido com 11 dígitos!", "error");
    return;
  }
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    mostrarMensagem("⚠️ Insira um e-mail válido!", "error");
    return;
  }
  if (!password || password.length !== 4 || !/^\d{4}$/.test(password)) {
    mostrarMensagem("⚠️ A senha deve ter 4 dígitos numéricos!", "error");
    return;
  }
  if (password !== confirmPassword) {
    mostrarMensagem("⚠️ As senhas não coincidem!", "error");
    return;
  }
  if (!phone || phone.length !== 11 || !/^\d{11}$/.test(phone)) {
    mostrarMensagem("⚠️ Insira um telefone válido com 11 dígitos!", "error");
    return;
  }

  try {
    const createResponse = await fetch("http://localhost:3000/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, cpf, email, password, phone }),
    });

    console.log("Resposta da criação:", createResponse);

    if (createResponse.ok) {
      const newUserData = await createResponse.json();
      console.log("Dados do novo usuário:", newUserData);
      mostrarMensagem(
        `✅ Conta criada com sucesso!\nNúmero da Conta: ${newUserData.user.accountNumber}`,
        "success"
      );
      sessionStorage.setItem("user", JSON.stringify(newUserData.user));
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1500);
    } else {
      const errorData = await createResponse.json();
      const errorMessage = errorData?.message || "Erro ao criar a conta.";
      console.error("❌ Erro ao criar a conta:", errorMessage);
      mostrarMensagem(errorMessage, "error");
    }
  } catch (error) {
    console.error("❌ Erro ao processar a conta:", error.message);
    mostrarMensagem(
      error.message || "Erro ao tentar processar a conta. Tente novamente.",
      "error"
    );
  }
}

function mostrarMensagem(texto, tipo) {
  const message = document.getElementById("message");
  if (message) {
    message.textContent = texto;
    message.className = `message ${tipo}`;
    message.style.display = "block";
  } else {
    console.error("Elemento 'message' não encontrado!");
  }
}
