document.addEventListener("DOMContentLoaded", () => {
  const userName = document.getElementById("userName");
  const accountNumber = document.getElementById("accountNumber");
  const balance = document.getElementById("balance");
  const toggleBalance = document.getElementById("toggleBalance");
  const transactionHistory = document.getElementById("transactionHistory");
  const creditCardInvoice = document.getElementById("creditCardInvoice");
  const loans = document.getElementById("loans");
  const consignedLoans = document.getElementById("consignedLoans");
  let balanceVisible = false;

  // Carrega dados do usuário
  async function loadUserData() {
      try {
          const token = localStorage.getItem("token");
          if (!token || token.split(".").length !== 3) {
            console.error("Token inválido, deslogando...");
            localStorage.removeItem("token");
            window.location.href = "/login.html"; // ou o caminho do seu login
          }

          const response = await fetch("http://localhost:3000/api/user", {
              headers: { "Authorization": `Bearer ${token}` },
          });
          if (!response.ok) throw new Error("Erro ao buscar usuário");

          const data = await response.json();
          userName.textContent = `Bem-vindo, ${data.user.name}!`;
          accountNumber.textContent = data.user.accountNumber || "0000-0";
          balance.textContent = `R$ ${data.user.balance.toFixed(2)}`;
          balance.dataset.value = data.user.balance.toFixed(2);
      } catch (error) {
          console.error("Erro ao carregar usuário:", error);
          userName.textContent = "Erro ao carregar dados";
      }
  }

  // Toggle saldo
  toggleBalance.addEventListener("click", () => {
      balanceVisible = !balanceVisible;
      balance.textContent = balanceVisible ? `R$ ${balance.dataset.value}` : "R$ ---";
      toggleBalance.className = balanceVisible ? "fas fa-eye-slash ml-2" : "fas fa-eye ml-2";
  });

  // Carrega histórico
  
  async function loadHistory() {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3000/api/transactions/history", {
            headers: { "Authorization": `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Erro ao buscar histórico");

        const data = await response.json();
        console.log("Dados recebidos:", data);

        if (data && Array.isArray(data.transactions)) {
            transactionHistory.innerHTML = data.transactions.length > 0
                ? data.transactions.map(tx => `
                    <div class="list-group-item">
                        <strong>${tx.type}</strong> - R$ ${tx.amount.toFixed(2)}<br>
                        <small>${new Date(tx.date).toLocaleString()}</small>
                    </div>
                `).join("")
                : "<p>Sem transações</p>";
        } else {
            transactionHistory.innerHTML = "<p>Nenhum dado de transação encontrado.</p>";
        }
    } catch (error) {
        console.error("Erro ao carregar histórico:", error);
        transactionHistory.innerHTML = "<p>Erro ao carregar histórico</p>";
    }
}

  // Carrega dados do cartão e empréstimos
  async function loadFinancialData() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("Token não encontrado no localStorage");
            creditCardInvoice.textContent = "Erro: Faça login novamente";
            loans.textContent = "Erro: Faça login novamente";
            consignedLoans.textContent = "Erro: Faça login novamente";
            return;
        }

        console.log("Fazendo fetch para /api/transactions/financial com token:", token.substring(0, 10) + "...");
        const response = await fetch("http://localhost:3000/api/transactions/financial", {
            headers: { "Authorization": `Bearer ${token}` },
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Erro na API /financial:", {
                status: response.status,
                statusText: response.statusText,
                error: errorData.error || "Sem detalhes",
            });
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log("Dados financeiros recebidos:", data);
        creditCardInvoice.textContent = `R$ ${data.card.invoice.toFixed(2)}`;
        loans.textContent = data.loans.length ? data.loans.map(l => `R$ ${l.amount.toFixed(2)}`).join(", ") : "Nenhum";
        consignedLoans.textContent = data.consigned.length ? data.consigned.map(c => `R$ ${c.amount.toFixed(2)}`).join(", ") : "Nenhum";
    } catch (error) {
        console.error("Erro ao carregar dados financeiros:", error);
        creditCardInvoice.textContent = "Erro";
        loans.textContent = "Erro";
        consignedLoans.textContent = "Erro";
    }
}
  // Ações da área Pix e transações
  document.querySelectorAll(".icon-item").forEach(item => {
      item.addEventListener("click", () => {
          const action = item.dataset.action;
          const modalTitle = document.getElementById("modalTitle");
          const modalBody = document.getElementById("modalBody");
          const modalConfirm = document.getElementById("modalConfirm");

          modalTitle.textContent = item.querySelector("span").textContent;
          modalBody.innerHTML = getModalContent(action);
          modalConfirm.onclick = () => handleAction(action);
          $("#actionModal").modal("show");
      });
  });

  function getModalContent(action) {
      const actions = {
          transferir: `<input type="text" class="form-control mb-2" id="pixKey" placeholder="Chave Pix">
                      <input type="number" class="form-control" id="amount" placeholder="Valor">`,
          programar: `<input type="text" class="form-control mb-2" id="pixKey" placeholder="Chave Pix">
                      <input type="number" class="form-control mb-2" id="amount" placeholder="Valor">
                      <input type="date" class="form-control" id="scheduleDate">`,
          qrcode: `<p>Funcionalidade em desenvolvimento.</p>`,
          copiaecola: `<input type="text" class="form-control" id="pixCode" placeholder="Código Pix">`,
          cobrar: `<input type="number" class="form-control" id="amount" placeholder="Valor a cobrar">`,
          depositar: `<input type="number" class="form-control" id="amount" placeholder="Valor a depositar">`,
          chaves: `<p><a href="/minhas-chaves.html">Gerenciar chaves Pix</a></p>`,
          limites: `<input type="number" class="form-control" id="pixLimit" placeholder="Limite diário Pix">`,
          pagar: `<input type="text" class="form-control" id="barcode" placeholder="Código de barras">`,
          emprestimo: `<input type="number" class="form-control" id="loanAmount" placeholder="Valor do empréstimo">`,
          recarga: `<input type="text" class="form-control mb-2" id="phone" placeholder="Número do celular">
                    <input type="number" class="form-control" id="amount" placeholder="Valor da recarga">`,
          investir: `<input type="number" class="form-control" id="investAmount" placeholder="Valor a investir">`,
      };
      return actions[action] || "<p>Funcionalidade em desenvolvimento.</p>";
  }

  async function handleAction(action) {
      const token = localStorage.getItem("token");
      const actions = {
          transferir: () => ({
              url: "/api/pix/transfer",
              body: {
                  key: document.getElementById("pixKey").value,
                  amount: parseFloat(document.getElementById("amount").value),
              },
          }),
          programar: () => ({
              url: "/api/pix/schedule",
              body: {
                  key: document.getElementById("pixKey").value,
                  amount: parseFloat(document.getElementById("amount").value),
                  date: document.getElementById("scheduleDate").value,
              },
          }),
          copiaecola: () => ({
              url: "/api/pix/copiaecola",
              body: { code: document.getElementById("pixCode").value },
          }),
          cobrar: () => ({
              url: "/api/pix/charge",
              body: { amount: parseFloat(document.getElementById("amount").value) },
          }),
          depositar: () => ({
              url: "/api/pix/deposit",
              body: { amount: parseFloat(document.getElementById("amount").value) },
          }),
          limites: () => ({
              url: "/api/pix/limits",
              body: { limit: parseFloat(document.getElementById("pixLimit").value) },
          }),
          pagar: () => ({
              url: "/api/transactions/pay",
              body: { barcode: document.getElementById("barcode").value },
          }),
          emprestimo: () => ({
              url: "/api/loans/request",
              body: { amount: parseFloat(document.getElementById("loanAmount").value) },
          }),
          recarga: () => ({
              url: "/api/transactions/recharge",
              body: {
                  phone: document.getElementById("phone").value,
                  amount: parseFloat(document.getElementById("amount").value),
              },
          }),
          investir: () => ({
              url: "/api/investments",
              body: { amount: parseFloat(document.getElementById("investAmount").value) },
          }),
      };

      if (actions[action]) {
          try {
              const { url, body } = actions[action]();
              const response = await fetch(`http://localhost:3000${url}`, {
                  method: "POST",
                  headers: {
                      "Content-Type": "application/json",
                      "Authorization": `Bearer ${token}`,
                  },
                  body: JSON.stringify(body),
              });
              if (!response.ok) throw new Error("Erro na ação");
              alert("Ação realizada com sucesso!");
              $("#actionModal").modal("hide");
              loadHistory(); // Atualiza histórico
          } catch (error) {
              console.error(`Erro na ação ${action}:`, error);
              alert("Erro ao realizar ação. Tente novamente.");
          }
      } else {
          alert("Funcionalidade em desenvolvimento.");
      }
  }

  // Carrega tudo
  loadUserData();
  loadHistory();
  loadFinancialData();
});