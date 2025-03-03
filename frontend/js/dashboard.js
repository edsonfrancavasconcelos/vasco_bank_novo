document.addEventListener("DOMContentLoaded", function () {
  const user = JSON.parse(sessionStorage.getItem("user"));

  if (user && user.id) {
    const userId = user.id;
    carregarDadosDoUsuario(userId);
  } else {
    console.error(
      "Erro ao carregar dados do usuário: ID do usuário não encontrado no sessionStorage."
    );
    window.location.href = "index.html"; // Redireciona para a página de login
  }

  const searchAccountForm = document.getElementById("searchAccountForm");
  if (searchAccountForm) {
    searchAccountForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const accountNumber = document.getElementById("accountNumber").value;
      const messageDiv = document.getElementById("message");

      try {
        const response = await fetch(
          `http://localhost:3000/api/accounts/${accountNumber}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        let data;
        if (
          response.headers.get("content-type")?.includes("application/json")
        ) {
          data = await response.json();
        } else {
          data = await response.text();
          throw new Error(
            "A resposta do servidor não é um JSON válido: " + data
          );
        }

        if (!response.ok) {
          throw new Error(data.error || "Erro ao buscar conta.");
        }

        messageDiv.textContent = `✅ Conta encontrada! Nome do titular: ${data.fullName}`;
        messageDiv.style.color = "green";
      } catch (error) {
        console.error("❌ Erro:", error.message);
        messageDiv.textContent = "Erro ao buscar conta: " + error.message;
        messageDiv.style.color = "red";
      }
    });
  } else {
    console.error("Elemento searchAccountForm não encontrado no DOM.");
  }
});

async function carregarDadosDoUsuario(userId) {
  try {
    const response = await fetch(`http://localhost:3000/api/users/${userId}`);

    if (response.ok) {
      const userData = await response.json();
      document.getElementById("userName").textContent = userData.fullName;
      document.getElementById(
        "userBalance"
      ).textContent = `R$ ${userData.balance.toFixed(2)}`;

      const transactionsList = document.getElementById("transactionList");
      transactionsList.innerHTML = ""; // Limpa a lista antes de adicionar novas transações
      userData.transactions.forEach((transaction) => {
        const transactionItem = document.createElement("li");
        transactionItem.classList.add("list-group-item");
        transactionItem.textContent = `${
          transaction.description
        } - R$ ${transaction.amount.toFixed(2)}`;
        transactionsList.appendChild(transactionItem);
      });
    } else {
      console.error("Erro ao carregar dados do usuário:", response.statusText);
      document.getElementById("erroUserID").textContent =
        "Erro ao carregar dados do usuário.";
    }
  } catch (error) {
    console.error("Erro ao carregar dados do usuário:", error);
    document.getElementById("erroUserID").textContent =
      "Erro ao carregar dados do usuário.";
  }
}
