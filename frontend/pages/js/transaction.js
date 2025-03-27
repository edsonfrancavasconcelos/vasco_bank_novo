const token = localStorage.getItem("token");
if (!token) {
  console.log("Token não encontrado, redirecionando...");
  window.location.href = "/index.html";
} else {
  console.log("Token carregado:", token);
}

async function fetchName(accountNumber) {
  if (!accountNumber) return "-";
  try {
    const response = await fetch(
      `http://localhost:3000/api/users/account/${accountNumber}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await response.json();
    return response.ok ? data.fullName || "Desconhecido" : "Desconhecido";
  } catch (error) {
    console.error("Erro ao buscar nome:", error);
    return "Desconhecido";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const loadHistoryBtn = document.getElementById("loadHistory");
  if (!loadHistoryBtn) {
    console.error("Botão loadHistory não encontrado!");
    return;
  }

  loadHistoryBtn.addEventListener("click", async () => {
    const historyBody = document.getElementById("historyBody");
    const historyTable = document.getElementById("historyTable");
    const historyMessage = document.getElementById("historyMessage");

    if (!historyBody || !historyTable || !historyMessage) {
      console.error("Elementos do DOM não encontrados!");
      return;
    }

    console.log("Iniciando carregamento do histórico...");

    try {
      const response = await fetch(
        "http://localhost:3000/api/transactions/history",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Status da resposta:", response.status);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao carregar histórico");
      }
      const transactions = await response.json();
      console.log("Transações recebidas:", transactions);

      historyBody.innerHTML = "";
      if (!transactions || transactions.length === 0) {
        historyMessage.textContent = "Nenhuma transação encontrada.";
        historyMessage.className = "mt-3 text-warning";
        historyTable.style.display = "none";
        return;
      }

      for (const t of transactions) {
        const fromName = await fetchName(t.fromAccount);
        const toName = await fetchName(t.targetAccount);
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${t.type}</td>
          <td>R$ ${t.amount.toFixed(2)}</td>
          <td>${fromName} (${t.fromAccount || "-"})</td>
          <td>${toName} (${t.targetAccount || "-"})</td>
          <td>${t.description || "-"}</td>
          <td>${new Date(t.date).toLocaleString()}</td>
        `;
        historyBody.appendChild(row);
      }

      historyTable.style.display = "table";
      historyMessage.textContent = "Histórico carregado com sucesso!";
      historyMessage.className = "mt-3 text-success";
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      historyMessage.textContent = `Erro: ${error.message}`;
      historyMessage.className = "mt-3 text-danger";
    }
  });
});
