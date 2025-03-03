async function carregarDadosUsuario() {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:3000/api/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Não autorizado. Faça login novamente.");
      } else if (response.status === 404) {
        throw new Error("Usuário não encontrado.");
      } else {
        const errorData = await response.json();
        const errorMessage =
          errorData?.message || `Erro ${response.status} ao carregar dados.`;
        throw new Error(errorMessage);
      }
    }

    const userData = await response.json();
    console.log("Dados do usuário:", userData);

    document.getElementById("userName").textContent = userData.fullName;
    document.getElementById(
      "userBalance"
    ).textContent = `R$ ${userData.balance}`;
  } catch (error) {
    console.error("Erro ao carregar dados do usuário:", error);

    const errorMessageElement = document.getElementById("errorMessage");
    if (errorMessageElement) {
      errorMessageElement.textContent = error.message;
    } else {
      alert(error.message);
    }
  }
}

carregarDadosUsuario();
