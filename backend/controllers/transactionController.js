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
            if (!token) {
                window.location.href = "/login.html";
                return;
            }

            const response = await fetch("http://localhost:3000/api/user", {
                headers: { "Authorization": `Bearer ${token}` },
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            userName.textContent = `Bem-vindo, ${data.user.fullName}!`;
            accountNumber.textContent = data.user.accountNumber || "0000-0";
            balance.textContent = `R$ ---`;
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
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            transactionHistory.innerHTML = data.transactions.map(tx => `
                <div class="list-group-item">
                    <strong>${tx.type}</strong> - R$ ${tx.amount.toFixed(2)}<br>
                    <small>${tx.description || ''} - ${new Date(tx.date).toLocaleString()}</small>
                </div>
            `).join("") || "<p>Sem transações</p>";
        } catch (error) {
            console.error("Erro ao carregar histórico:", error);
            transactionHistory.innerHTML = "<p>Erro ao carregar histórico</p>";
        }
    }

    // Carrega dados financeiros
    async function loadFinancialData() {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:3000/api/transactions/financial", {
                headers: { "Authorization": `Bearer ${token}` },
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
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

    // Ações
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
            pixTransfer: `
                <input type="text" class="form-control mb-2" id="pixKey" placeholder="Chave Pix">
                <input type="number" class="form-control mb-2" id="amount" placeholder="Valor">
                <input type="text" class="form-control" id="description" placeholder="Descrição (opcional)">
            `,
            pixSchedule: `
                <input type="text" class="form-control mb-2" id="pixKey" placeholder="Chave Pix">
                <input type="number" class="form-control mb-2" id="amount" placeholder="Valor">
                <input type="date" class="form-control mb-2" id="scheduleDate">
                <input type="text" class="form-control" id="description" placeholder="Descrição (opcional)">
            `,
            pixPayment: `
                <input type="text" class="form-control mb-2" id="pixCode" placeholder="Código Pix ou QR Code">
                <input type="number" class="form-control" id="amount" placeholder="Valor">
            `,
            pixCharge: `
                <input type="number" class="form-control mb-2" id="amount" placeholder="Valor a cobrar">
                <input type="text" class="form-control" id="description" placeholder="Descrição (opcional)">
            `,
            pixDeposit: `
                <input type="number" class="form-control" id="amount" placeholder="Valor a depositar">
            `,
            pixKeys: `
                <select class="form-control mb-2" id="keyType">
                    <option value="CPF">CPF</option>
                    <option value="EMAIL">E-mail</option>
                    <option value="PHONE">Telefone</option>
                    <option value="RANDOM">Chave Aleatória</option>
                </select>
                <input type="text" class="form-control" id="key" placeholder="Chave Pix">
            `,
            pixLimit: `
                <input type="number" class="form-control" id="dailyLimit" placeholder="Limite diário Pix">
            `,
            payBill: `
                <input type="text" class="form-control mb-2" id="billCode" placeholder="Código do boleto">
                <input type="number" class="form-control" id="amount" placeholder="Valor">
            `,
            getLoan: `
                <input type="number" class="form-control mb-2" id="amount" placeholder="Valor do empréstimo">
                <select class="form-control" id="loanType">
                    <option value="personal">Pessoal</option>
                    <option value="consigned">Consignado</option>
                </select>
            `,
            recharge: `
                <select class="form-control mb-2" id="operator">
                    <option value="Vivo">Vivo</option>
                    <option value="Claro">Claro</option>
                    <option value="Tim">Tim</option>
                    <option value="Oi">Oi</option>
                </select>
                <input type="text" class="form-control mb-2" id="phoneNumber" placeholder="Número do celular">
                <select class="form-control" id="amount">
                    <option value="10">R$ 10</option>
                    <option value="20">R$ 20</option>
                    <option value="30">R$ 30</option>
                    <option value="50">R$ 50</option>
                    <option value="100">R$ 100</option>
                </select>
            `,
            invest: `
                <input type="number" class="form-control mb-2" id="amount" placeholder="Valor a investir">
                <select class="form-control" id="investmentType">
                    <option value="Tesouro Direto">Tesouro Direto</option>
                    <option value="CDB">CDB</option>
                    <option value="Ações">Ações</option>
                </select>
            `,
        };
        return actions[action] || "<p>Funcionalidade em desenvolvimento.</p>";
    }

    async function handleAction(action) {
        const token = localStorage.getItem("token");
        const actions = {
            pixTransfer: () => ({
                url: "/api/transactions/pix/transfer",
                body: {
                    pixKey: document.getElementById("pixKey").value,
                    amount: parseFloat(document.getElementById("amount").value),
                    description: document.getElementById("description").value,
                },
            }),
            pixSchedule: () => ({
                url: "/api/transactions/pix/schedule",
                body: {
                    pixKey: document.getElementById("pixKey").value,
                    amount: parseFloat(document.getElementById("amount").value),
                    scheduleDate: document.getElementById("scheduleDate").value,
                    description: document.getElementById("description").value,
                },
            }),
            pixPayment: () => ({
                url: "/api/transactions/pix/payment",
                body: {
                    pixCode: document.getElementById("pixCode").value,
                    amount: parseFloat(document.getElementById("amount").value),
                },
            }),
            pixCharge: () => ({
                url: "/api/transactions/pix/charge",
                body: {
                    amount: parseFloat(document.getElementById("amount").value),
                    description: document.getElementById("description").value,
                },
            }),
            pixDeposit: () => ({
                url: "/api/transactions/pix/deposit",
                body: {
                    amount: parseFloat(document.getElementById("amount").value),
                },
            }),
            pixKeys: () => ({
                url: "/api/transactions/pix/register",
                body: {
                    keyType: document.getElementById("keyType").value,
                    key: document.getElementById("key").value,
                },
            }),
            pixLimit: () => ({
                url: "/api/transactions/pix/limits",
                body: {
                    dailyLimit: parseFloat(document.getElementById("dailyLimit").value),
                },
            }),
            payBill: () => ({
                url: "/api/transactions/bill/pay",
                body: {
                    billCode: document.getElementById("billCode").value,
                    amount: parseFloat(document.getElementById("amount").value),
                },
            }),
            getLoan: () => ({
                url: "/api/transactions/loan",
                body: {
                    amount: parseFloat(document.getElementById("amount").value),
                    loanType: document.getElementById("loanType").value,
                },
            }),
            recharge: () => ({
                url: "/api/transactions/recharge",
                body: {
                    operator: document.getElementById("operator").value,
                    phoneNumber: document.getElementById("phoneNumber").value,
                    amount: parseFloat(document.getElementById("amount").value),
                },
            }),
            invest: () => ({
                url: "/api/transactions/invest",
                body: {
                    amount: parseFloat(document.getElementById("amount").value),
                    investmentType: document.getElementById("investmentType").value,
                },
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
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                alert(data.message);
                $("#actionModal").modal("hide");
                loadUserData();
                loadHistory();
                loadFinancialData();
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