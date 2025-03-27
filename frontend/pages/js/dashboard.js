// Data: 26 de Março de 2025, 19:30 - Nome: dashboard.js
const token = localStorage.getItem("token");
if (!token) {
  console.log("Token não encontrado no localStorage");
  window.location.href = "/"; // Redireciona pra index.html no root
}

async function fetchName(accountNumber) {
  if (!accountNumber) {
    console.log("accountNumber não fornecido para fetchName");
    return "-";
  }
  try {
    console.log("Buscando nome para accountNumber:", accountNumber);
    const response = await fetch(`/api/users/account/${accountNumber}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao buscar nome");
    }
    const data = await response.json();
    console.log("Nome retornado:", data.fullName);
    return data.fullName || "Desconhecido";
  } catch (error) {
    console.error(`Erro ao buscar nome para ${accountNumber}:`, error.message);
    return "Desconhecido";
  }
}

async function loadUserData() {
  const message = document.getElementById("message");
  const userNameEl = document.getElementById("userName");
  const accountNumberEl = document.getElementById("accountNumber");
  const balanceEl = document.getElementById("balance");

  if (!userNameEl || !accountNumberEl || !balanceEl || !message) {
    console.error("Elementos HTML não encontrados:", {
      userNameEl,
      accountNumberEl,
      balanceEl,
      message,
    });
    return;
  }

  try {
    console.log("Carregando dados do usuário com token:", token);
    const response = await fetch("/api/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erro na resposta do servidor:", errorData);
      throw new Error(errorData.error || "Erro ao carregar dados do usuário");
    }

    const userData = await response.json();
    console.log("Dados do usuário recebidos:", userData);

    userNameEl.textContent = userData.fullName || "Nome não disponível";
    accountNumberEl.textContent =
      userData.accountNumber || "Conta não disponível";
    balanceEl.textContent =
      userData.balance !== undefined
        ? `R$ ${userData.balance.toFixed(2)}`
        : "Saldo não disponível";

    message.textContent = "Dados carregados com sucesso!";
    message.className = "mt-3 text-success";
  } catch (error) {
    console.error("Erro ao carregar dados:", error.message);
    message.textContent = `Erro: ${error.message}`;
    message.className = "mt-3 text-danger";
  }
}

function updateDynamicFields() {
  const transactionType = document.getElementById("transactionType")?.value;
  const dynamicFields = document.getElementById("dynamicFields");
  const submitButton = document.getElementById("submitTransaction");

  if (!dynamicFields || !submitButton) {
    console.error("Elementos de formulário não encontrados:", {
      dynamicFields,
      submitButton,
    });
    return;
  }

  dynamicFields.innerHTML = "";

  switch (transactionType) {
    case "transfer":
    case "pix/transfer":
      dynamicFields.innerHTML = `
        <div class="form-group">
          <label for="toAccount">${
            transactionType === "pix/transfer"
              ? "Chave PIX Destino"
              : "Conta Destino"
          }</label>
          <input type="text" class="form-control" id="toAccount" required>
        </div>
        <div class="form-group">
          <label for="amount">Valor (R$)</label>
          <input type="number" class="form-control" id="amount" step="0.01" min="0.01" required>
        </div>
        <div class="form-group">
          <label for="description">Descrição (opcional)</label>
          <input type="text" class="form-control" id="description">
        </div>
      `;
      submitButton.disabled = false;
      break;
    case "deposit":
      dynamicFields.innerHTML = `
        <div class="form-group">
          <label for="toAccount">Conta Destino</label>
          <input type="text" class="form-control" id="toAccount" required>
        </div>
        <div class="form-group">
          <label for="amount">Valor (R$)</label>
          <input type="number" class="form-control" id="amount" step="0.01" min="0.01" required>
        </div>
      `;
      submitButton.disabled = false;
      break;
    case "withdrawal":
      dynamicFields.innerHTML = `
        <div class="form-group">
          <label for="amount">Valor (R$)</label>
          <input type="number" class="form-control" id="amount" step="0.01" min="0.01" required>
        </div>
      `;
      submitButton.disabled = false;
      break;
    case "pix/payment":
      dynamicFields.innerHTML = `
        <div class="form-group">
          <label for="toAccount">Chave PIX do Pagamento</label>
          <input type="text" class="form-control" id="toAccount" required>
        </div>
        <div class="form-group">
          <label for="amount">Valor (R$)</label>
          <input type="number" class="form-control" id="amount" step="0.01" min="0.01" required>
        </div>
      `;
      submitButton.disabled = false;
      break;
    case "pix/receive":
      dynamicFields.innerHTML = `
        <p>Sua chave PIX será gerada no backend. Clique em "Executar" para visualizar.</p>
      `;
      submitButton.disabled = false;
      break;
    case "pix/register":
      dynamicFields.innerHTML = `
        <div class="form-group">
          <label for="pixKey">Chave PIX (ex.: CPF, e-mail, telefone)</label>
          <input type="text" class="form-control" id="pixKey" required>
        </div>
      `;
      submitButton.disabled = false;
      break;
    case "recharge":
      dynamicFields.innerHTML = `
        <div class="form-group">
          <label for="phoneNumber">Número do Telefone</label>
          <input type="text" class="form-control" id="phoneNumber" required>
        </div>
        <div class="form-group">
          <label for="operator">Operadora</label>
          <select class="form-control" id="operator" required>
            <option value="">Selecione</option>
            <option value="Vivo">Vivo</option>
            <option value="Claro">Claro</option>
            <option value="Tim">Tim</option>
            <option value="Oi">Oi</option>
          </select>
        </div>
        <div class="form-group">
          <label for="amount">Valor da Recarga</label>
          <select class="form-control" id="amount" required>
            <option value="">Selecione</option>
            <option value="10">R$ 10,00</option>
            <option value="20">R$ 20,00</option>
            <option value="30">R$ 30,00</option>
            <option value="50">R$ 50,00</option>
          </select>
        </div>
      `;
      submitButton.disabled = false;
      break;
    case "bill/pay":
      dynamicFields.innerHTML = `
        <div class="form-group">
          <label for="billCode">Código do Boleto</label>
          <input type="text" class="form-control" id="billCode" required>
        </div>
        <div class="form-group">
          <label for="amount">Valor (R$)</label>
          <input type="number" class="form-control" id="amount" step="0.01" min="0.01" required>
        </div>
      `;
      submitButton.disabled = false;
      break;
    case "loan":
      dynamicFields.innerHTML = `
        <div class="form-group">
          <label for="amount">Valor do Empréstimo</label>
          <select class="form-control" id="amount" required>
            <option value="">Selecione</option>
            <option value="100">R$ 100,00</option>
            <option value="200">R$ 200,00</option>
            <option value="500">R$ 500,00</option>
            <option value="1000">R$ 1.000,00</option>
          </select>
        </div>
      `;
      submitButton.disabled = false;
      break;
    case "invest":
      dynamicFields.innerHTML = `
        <div class="form-group">
          <label for="amount">Valor (R$)</label>
          <input type="number" class="form-control" id="amount" step="0.01" min="0.01" required>
        </div>
        <div class="form-group">
          <label for="investmentType">Tipo de Investimento</label>
          <select class="form-control" id="investmentType" required>
            <option value="">Selecione</option>
            <option value="Tesouro Direto">Tesouro Direto</option>
            <option value="CDB">CDB</option>
            <option value="Ações">Ações</option>
          </select>
        </div>
      `;
      submitButton.disabled = false;
      break;
    default:
      console.log("Tipo de transação não reconhecido:", transactionType);
      submitButton.disabled = true;
      break;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const transactionTypeEl = document.getElementById("transactionType");
  const form = document.getElementById("transactionForm");

  if (!transactionTypeEl || !form) {
    console.error("Elementos de transação não encontrados:", {
      transactionTypeEl,
      form,
    });
    return;
  }

  transactionTypeEl.addEventListener("change", updateDynamicFields);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const transactionType = transactionTypeEl.value;
    const transactionMessage = document.getElementById("transactionMessage");

    if (!transactionMessage) {
      console.error("Elemento transactionMessage não encontrado");
      return;
    }

    let url, body, method;
    switch (transactionType) {
      case "transfer":
        url = "/api/transactions/transfer";
        method = "POST";
        body = {
          toAccount: document.getElementById("toAccount")?.value,
          amount: parseFloat(document.getElementById("amount")?.value),
          description: document.getElementById("description")?.value,
        };
        break;
      case "deposit":
        url = "/api/transactions/deposit";
        method = "POST";
        body = {
          toAccount: document.getElementById("toAccount")?.value,
          amount: parseFloat(document.getElementById("amount")?.value),
        };
        break;
      case "withdrawal":
        url = "/api/transactions/withdrawal";
        method = "POST";
        body = { amount: parseFloat(document.getElementById("amount")?.value) };
        break;
      case "pix/transfer":
        url = "/api/transactions/pix/transfer";
        method = "POST";
        body = {
          toAccount: document.getElementById("toAccount")?.value,
          amount: parseFloat(document.getElementById("amount")?.value),
          description: document.getElementById("description")?.value,
        };
        break;
      case "pix/payment":
        url = "/api/transactions/pix/payment";
        method = "POST";
        body = {
          targetKey: document.getElementById("toAccount")?.value,
          amount: parseFloat(document.getElementById("amount")?.value),
        };
        break;
      case "pix/receive":
        url = "/api/transactions/pix/receive";
        method = "GET";
        body = null;
        break;
      case "pix/register":
        url = "/api/transactions/pix/register";
        method = "POST";
        body = { pixKey: document.getElementById("pixKey")?.value };
        break;
      case "recharge":
        url = "/api/transactions/recharge";
        method = "POST";
        body = {
          operator: document.getElementById("operator")?.value,
          phoneNumber: document.getElementById("phoneNumber")?.value,
          amount: parseFloat(document.getElementById("amount")?.value),
        };
        break;
      case "bill/pay":
        url = "/api/transactions/bill/pay";
        method = "POST";
        body = {
          billCode: document.getElementById("billCode")?.value,
          amount: parseFloat(document.getElementById("amount")?.value),
        };
        break;
      case "loan":
        url = "/api/transactions/loan";
        method = "POST";
        body = { amount: parseFloat(document.getElementById("amount")?.value) };
        break;
      case "invest":
        url = "/api/transactions/invest";
        method = "POST";
        body = {
          amount: parseFloat(document.getElementById("amount")?.value),
          investmentType: document.getElementById("investmentType")?.value,
        };
        break;
      default:
        console.error("Tipo de transação inválido:", transactionType);
        transactionMessage.textContent = "Erro: Tipo de transação inválido";
        transactionMessage.className = "mt-3 text-danger";
        return;
    }

    try {
      console.log(`Enviando ${method} para ${url} com body:`, body);
      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: method === "GET" ? undefined : JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("Erro na resposta do servidor:", data);
        throw new Error(
          data.error || `Erro ${response.status}: ${response.statusText}`
        );
      }

      console.log("Resposta da transação:", data);
      transactionMessage.textContent =
        data.message || "Transação realizada com sucesso!";
      transactionMessage.className = "mt-3 text-success";
      setTimeout(() => {
        transactionMessage.textContent = "";
        form.reset();
        updateDynamicFields();
        loadUserData(); // Atualiza os dados após transação
      }, 2000);
    } catch (error) {
      console.error(`Erro na transação ${transactionType}:`, error.message);
      transactionMessage.textContent = error.message.includes("404")
        ? "Erro: Conta não encontrada ou problema no servidor"
        : `Erro: ${error.message}`;
      transactionMessage.className = "mt-3 text-danger";
    }
  });

  document
    .getElementById("loadHistory")
    ?.addEventListener("click", async () => {
      const historyTable = document.getElementById("historyTable");
      const historyBody = document.getElementById("historyBody");
      const historyMessage = document.getElementById("historyMessage");

      if (!historyTable || !historyBody || !historyMessage) {
        console.error("Elementos do histórico não encontrados:", {
          historyTable,
          historyBody,
          historyMessage,
        });
        return;
      }

      try {
        console.log("Carregando histórico com token:", token);
        const response = await fetch("/api/transactions/history", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erro ao carregar histórico:", errorData);
          throw new Error(errorData.error || "Erro ao carregar histórico");
        }

        const transactions = await response.json();
        console.log("Histórico recebido:", transactions);
        historyBody.innerHTML = "";
        for (const t of transactions.length !== undefined ? transactions : []) {
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
        console.error("Erro ao carregar histórico:", error.message);
        historyMessage.textContent = `Erro: ${error.message}`;
        historyMessage.className = "mt-3 text-danger";
      }
    });

  updateDynamicFields();
  loadUserData();
});
