document.addEventListener('DOMContentLoaded', async () => {
  console.log('Dashboard carregado');

  // Elementos do DOM
  const userName = document.getElementById('userName');
  const accountNumber = document.getElementById('accountNumber');
  const balance = document.getElementById('balance');
  const toggleBalance = document.getElementById('toggleBalance');
  const transactionHistory = document.getElementById('transactionHistory');
  const creditCardInvoice = document.getElementById('creditCardInvoice');
  const loans = document.getElementById('loans');
  const consignedLoans = document.getElementById('consignedLoans');
  const cardsList = document.getElementById('cardsList');
  let balanceVisible = false;
  let userAccountNumber = null; // Armazenar accountNumber globalmente

  // Verificar token
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('Nenhum token encontrado, redirecionando para login');
    window.location.href = '/login.html';
    return;
  }

  // Carrega dados do usuário
  async function loadUserData() {
    try {
      console.log('Buscando dados do usuário');
      const response = await fetch('http://localhost:3000/api/users/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Resposta /users/me:', response.status);
      if (response.status === 401) {
        console.error('Token inválido, redirecionando para login');
        localStorage.removeItem('token');
        window.location.href = '/login.html';
        return;
      }

      if (!response.ok) {
        throw new Error(`Erro ao buscar usuário: ${response.status}`);
      }

      const data = await response.json();
      console.log('Dados do usuário recebidos:', data);

      const displayName = data.fullName || data.email || 'Usuário';
      userName.textContent = `Bem-vindo, ${displayName}!`;
      userAccountNumber = data.accountNumber || '---'; // Armazena globalmente
      accountNumber.textContent = userAccountNumber;
      balance.textContent = `R$ ${data.balance?.toFixed(2) || '0.00'}`;
      balance.dataset.value = `R$ ${data.balance?.toFixed(2) || '0.00'}`;
    } catch (error) {
      console.error('Erro ao carregar usuário:', error.message);
      userName.textContent = 'Erro ao carregar';
      accountNumber.textContent = '---';
      userAccountNumber = null;
      balance.textContent = 'R$ ---';
    }
  }

  // Carrega cartões
  async function loadCards() {
    try {
      console.log('Buscando cartões');
      const response = await fetch('http://localhost:3000/api/cards', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Resposta /cards:', response.status);
      if (response.status === 401) {
        console.error('Token inválido, redirecionando para login');
        localStorage.removeItem('token');
        window.location.href = '/login.html';
        return;
      }

      if (response.status === 404) {
        console.log('Nenhum cartão encontrado para o usuário');
        cardsList.textContent = 'Nenhum cartão encontrado';
        return;
      }

      if (!response.ok) {
        throw new Error(`Erro ao buscar cartões: ${response.status}`);
      }

      const cards = await response.json();
      console.log('Cartões:', cards);

      if (!cards || cards.length === 0) {
        cardsList.textContent = 'Nenhum cartão encontrado';
        return;
      }

      cardsList.innerHTML = cards.map(card => `
        <div class="card-item mb-2">
          <strong>Cartão ${card.number.slice(-4)}</strong> (${card.type}, ${card.status})
          ${card.status === 'blocked' ? `<button class="btn btn-sm btn-primary unlock-btn" data-id="${card._id}">Desbloquear</button>` : ''}
        </div>
      `).join('');
    } catch (error) {
      console.error('Erro ao carregar cartões:', error.message);
      cardsList.textContent = 'Erro ao carregar cartões';
    }
  }

  // Desbloquear cartão
  async function unlockCard(cardId) {
    try {
      console.log('Enviando requisição para desbloquear cartão:', cardId);
      const response = await fetch('http://localhost:3000/api/cards/unlock', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ _id: cardId })
      });

      console.log('Resposta /unlock:', response.status);
      if (response.status === 401) {
        console.error('Token inválido, redirecionando para login');
        localStorage.removeItem('token');
        window.location.href = '/login.html';
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao desbloquear cartão');
      }

      console.log('Cartão desbloqueado');
      alert('Cartão desbloqueado com sucesso!');
      await loadCards();
    } catch (error) {
      console.error('Erro ao desbloquear cartão:', error.message);
      alert('Erro ao desbloquear cartão: ' + error.message);
    }
  }

  // Toggle saldo
  toggleBalance.addEventListener('click', () => {
    balanceVisible = !balanceVisible;
    balance.textContent = balanceVisible ? balance.dataset.value : 'R$ ---';
    toggleBalance.className = balanceVisible ? 'fas fa-eye-slash ml-2' : 'fas fa-eye ml-2';
  });

  // Carrega histórico
  async function loadHistory() {
    try {
      console.log('Buscando histórico de transações');
      const response = await fetch('http://localhost:3000/api/transactions/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Resposta /transactions/history:', response.status);
      if (response.status === 401) {
        console.error('Token inválido, redirecionando para login');
        localStorage.removeItem('token');
        window.location.href = '/login.html';
        return;
      }

      if (!response.ok) {
        throw new Error(`Erro ao buscar histórico: ${response.status}`);
      }

      const data = await response.json();
      console.log('Histórico:', data);
      transactionHistory.innerHTML = data.transactions?.map(tx => `
        <div class="list-group-item">
          <strong>${tx.type}</strong> - R$ ${tx.amount.toFixed(2)}<br>
          <small>${new Date(tx.date).toLocaleString()}</small>
        </div>
      `).join('') || '<p>Sem transações</p>';
    } catch (error) {
      console.error('Erro ao carregar histórico:', error.message);
      transactionHistory.innerHTML = '<p>Erro ao carregar histórico</p>';
    }
  }

  // Carrega dados financeiros
  async function loadFinancialData() {
    try {
      console.log('Buscando dados financeiros');
      const response = await fetch('http://localhost:3000/api/financial', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Resposta /financial:', response.status);
      if (response.status === 401) {
        console.error('Token inválido, redirecionando para login');
        localStorage.removeItem('token');
        window.location.href = '/login.html';
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ao buscar dados financeiros: ${response.status}`);
      }

      const data = await response.json();
      console.log('Dados financeiros:', data);
      creditCardInvoice.textContent = `R$ ${data.card?.invoice?.toFixed(2) || '0.00'}`;
      loans.textContent = data.loans?.length ? data.loans.map(l => `R$ ${l.amount.toFixed(2)} (${l.installments}x)`).join(', ') : 'Nenhum';
      consignedLoans.textContent = data.consigned?.length ? data.consigned.map(c => `R$ ${c.amount.toFixed(2)}`).join(', ') : 'Nenhum';
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error.message);
      creditCardInvoice.textContent = 'Erro';
      loans.textContent = 'Erro';
      consignedLoans.textContent = 'Erro';
    }
  }

  // Manipulação de cliques
  document.addEventListener('click', (e) => {
    const item = e.target.closest('.icon-item, .pix-icon-item');
    if (!item) return;

    const action = item.id || item.dataset.action || item.dataset.pixAction;
    if (!action) {
      console.error('Ação não definida para o item:', item);
      return;
    }
    e.preventDefault();
    console.log('Ação clicada:', action);

    // Ações que redirecionam
    const redirectActions = {
      'create-account': '/create-account.html',
      'login': '/login.html',
      'products-services': '/products-services.html',
      'recover-access': '/recover-access.html',
      'create-card': '/create-card.html'
    };

    if (redirectActions[action]) {
      console.log('Redirecionando para:', redirectActions[action]);
      window.location.href = redirectActions[action];
      return;
    }

    // Área Pix
    if (action === 'pixArea') {
      console.log('Abrindo modal da Área Pix');
      $('#pixAreaModal').modal('show');
      return;
    }

    // Ações do Pix ou outras ações
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalConfirm = document.getElementById('modalConfirm');

    modalTitle.textContent = item.querySelector('span')?.textContent || action;
    modalBody.innerHTML = getModalContent(action);

    modalConfirm.onclick = null;
    modalConfirm.onclick = () => {
      console.log('Clicou em Confirmar para ação:', action);
      handleAction(action);
    };

    $('#pixAreaModal').modal('hide');
    $('#actionModal').modal('show');
  });

  // Evento para botões de desbloqueio
  cardsList.addEventListener('click', (e) => {
    if (e.target.classList.contains('unlock-btn')) {
      const cardId = e.target.dataset.id;
      if (confirm('Deseja desbloquear este cartão?')) {
        unlockCard(cardId);
      }
    }
  });

  function getModalContent(action) {
    const actions = {
      transferMoney: `
        <form id="transferForm">
          <input type="text" class="form-control mb-2" id="transferAccountNumber" placeholder="Número da Conta Destino" required>
          <input type="number" class="form-control mb-2" id="transferAmount" placeholder="Valor" min="0.01" step="0.01" required>
        </form>
      `,
      depositMoney: `
        <form id="depositForm">
          <input type="text" class="form-control mb-2" id="depositAccountNumber" placeholder="Número da Conta Destino" required>
          <input type="number" class="form-control mb-2" id="depositAmount" placeholder="Valor" min="0.01" step="0.01" required>
        </form>
      `,
      withdrawMoney: `
        <form id="withdrawForm">
          <input type="number" class="form-control mb-2" id="withdrawAmount" placeholder="Valor" min="0.01" step="0.01" required>
        </form>
      `,
      payBill: `
        <form id="payBillForm">
          <input type="text" class="form-control" id="barcode" placeholder="Código de Barras" required>
        </form>
      `,
      getLoan: `
        <form id="loanForm">
          <input type="number" class="form-control mb-2" id="loanAmount" placeholder="Valor do Empréstimo" min="0.01" step="0.01" required>
          <select class="form-control" id="installments" required>
            <option value="6">6 meses</option>
            <option value="12">12 meses</option>
            <option value="24">24 meses</option>
          </select>
        </form>
      `,
      rechargePhone: `
        <form id="rechargeForm">
          <select class="form-control mb-2" id="operator" required>
            <option value="vivo">Vivo</option>
            <option value="claro">Claro</option>
            <option value="tim">TIM</option>
            <option value="oi">Oi</option>
          </select>
          <select class="form-control mb-2" id="amount" required>
            <option value="20">R$ 20,00</option>
            <option value="30">R$ 30,00</option>
            <option value="50">R$ 50,00</option>
          </select>
          <input type="text" class="form-control" id="phone" placeholder="Número do Celular" required>
        </form>
      `,
      showQuotes: `
        <p>Carregando cotações...</p>
        <div id="quotesResult"></div>
      `,
      investMoney: `
        <form id="investForm">
          <select class="form-control mb-2" id="investmentType" required>
            <option value="cdb">CDB</option>
            <option value="tesouro">Tesouro Direto</option>
            <option value="stocks">Ações</option>
          </select>
          <input type="number" class="form-control" id="amount" placeholder="Valor a Investir" min="0.01" step="0.01" required>
        </form>
      `,
      createVirtualCard: `
        <form id="virtualCardForm">
          <input type="text" class="form-control" id="cardName" placeholder="Nome no Cartão Virtual" required>
        </form>
      `,
      replacePhysicalCard: `
        <form id="replaceCardForm">
          <input type="text" class="form-control" id="reason" placeholder="Motivo da Solicitação" required>
        </form>
      `,
      pixTransfer: `
        <form id="pixTransferForm">
          <input type="text" class="form-control mb-2" id="pixKey" placeholder="Chave Pix (CPF, email, telefone)" required>
          <input type="number" class="form-control" id="pixAmount" placeholder="Valor" min="0.01" step="0.01" required>
        </form>
      `,
      pixPayment: `
        <form id="pixPaymentForm">
          <input type="text" class="form-control" id="pixCode" placeholder="Código Pix ou QR Code" required>
        </form>
      `,
      pixCharge: `
        <form id="pixChargeForm">
          <input type="number" class="form-control" id="chargeAmount" placeholder="Valor a Cobrar" min="0.01" step="0.01" required>
        </form>
      `,
      pixSchedule: `
        <form id="pixScheduleForm">
          <input type="text" class="form-control mb-2" id="pixKey" placeholder="Chave Pix" required>
          <input type="number" class="form-control mb-2" id="scheduleAmount" placeholder="Valor" min="0.01" step="0.01" required>
          <input type="date" class="form-control" id="scheduleDate" required>
        </form>
      `,
      pixKeys: `
        <form id="pixKeysForm">
          <select class="form-control mb-2" id="keyType" required>
            <option value="cpf">CPF</option>
            <option value="email">Email</option>
            <option value="phone">Telefone</option>
            <option value="random">Chave Aleatória</option>
          </select>
          <input type="text" class="form-control" id="keyValue" placeholder="Valor da Chave" required>
        </form>
      `,
      pixMyKeys: `
        <p>Carregando chaves Pix...</p>
        <div id="pixKeysResult"></div>
      `,
      pagar: `
        <form id="payBillForm">
          <input type="text" class="form-control" id="barcode" placeholder="Código de Barras" required>
        </form>
      `,
      emprestimo: `
        <form id="loanForm">
          <input type="number" class="form-control mb-2" id="loanAmount" placeholder="Valor do Empréstimo" min="0.01" step="0.01" required>
          <select class="form-control" id="installments" required>
            <option value="6">6 meses</option>
            <option value="12">12 meses</option>
            <option value="24">24 meses</option>
          </select>
        </form>
      `,
      recarga: `
        <form id="rechargeForm">
          <select class="form-control mb-2" id="operator" required>
            <option value="vivo">Vivo</option>
            <option value="claro">Claro</option>
            <option value="tim">TIM</option>
            <option value="oi">Oi</option>
          </select>
          <select class="form-control mb-2" id="amount" required>
            <option value="20">R$ 20,00</option>
            <option value="30">R$ 30,00</option>
            <option value="50">R$ 50,00</option>
          </select>
          <input type="text" class="form-control" id="phone" placeholder="Número do Celular" required>
        </form>
      `,
      investir: `
        <form id="investForm">
          <select class="form-control mb-2" id="investmentType" required>
            <option value="cdb">CDB</option>
            <option value="tesouro">Tesouro Direto</option>
            <option value="stocks">Ações</option>
          </select>
          <input type="number" class="form-control" id="amount" placeholder="Valor a Investir" min="0.01" step="0.01" required>
        </form>
      `
    };
    return actions[action] || '<p>Funcionalidade em desenvolvimento.</p>';
  }

  async function handleAction(action) {
    const actions = {
      transferMoney: () => {
        const form = document.getElementById('transferForm');
        if (!form || !form.checkValidity()) {
          form?.reportValidity();
          throw new Error('Preencha todos os campos obrigatórios');
        }
        const accountNumber = document.getElementById('transferAccountNumber')?.value?.trim();
        const amount = parseFloat(document.getElementById('transferAmount')?.value);
        console.log('Valores capturados para transferência:', { accountNumber, amount });
        if (!accountNumber || isNaN(amount) || amount <= 0) {
          throw new Error('Número da conta e valor são obrigatórios');
        }
        if (!/^\d+$/.test(accountNumber)) {
          throw new Error('Número da conta deve conter apenas dígitos');
        }
        return {
          url: '/api/transactions/transfer',
          body: { accountNumber, amount }
        };
      },
      depositMoney: () => {
        const form = document.getElementById('depositForm');
        if (!form || !form.checkValidity()) {
          form?.reportValidity();
          throw new Error('Preencha todos os campos obrigatórios');
        }
        const amount = parseFloat(document.getElementById('depositAmount')?.value);
        console.log('Valor capturado para depósito:', { amount });
        if (isNaN(amount) || amount <= 0) {
          throw new Error('Valor a depositar é obrigatório');
        }
        return {
          url: '/api/transactions/deposit',
          body: { amount }
        };
      },
      withdrawMoney: () => {
        const form = document.getElementById('withdrawForm');
        if (!form || !form.checkValidity()) {
          form?.reportValidity();
          throw new Error('Preencha todos os campos obrigatórios');
        }
        const amount = parseFloat(document.getElementById('withdrawAmount')?.value);
        console.log('Valor capturado para saque:', { amount });
        if (isNaN(amount) || amount <= 0) {
          throw new Error('Valor a sacar é obrigatório');
        }
        return {
          url: '/api/transactions/withdraw',
          body: { amount }
        };
      },
      payBill: () => {
        const form = document.getElementById('payBillForm');
        if (!form || !form.checkValidity()) {
          form?.reportValidity();
          throw new Error('Preencha todos os campos obrigatórios');
        }
        const barcode = document.getElementById('barcode')?.value?.trim();
        console.log('Código de barras capturado:', { barcode });
        if (!barcode) {
          throw new Error('Código de barras é obrigatório');
        }
        return {
          url: '/api/transactions/pay-bill',
          body: { barcode }
        };
      },
      getLoan: () => {
        const form = document.getElementById('loanForm');
        if (!form || !form.checkValidity()) {
          form?.reportValidity();
          throw new Error('Preencha todos os campos obrigatórios');
        }
        const amount = parseFloat(document.getElementById('loanAmount')?.value);
        const installments = parseInt(document.getElementById('installments')?.value);
        console.log('Valores capturados para empréstimo:', {
          amount,
          installments,
          fromAccount: userAccountNumber,
          rawAmount: document.getElementById('loanAmount')?.value,
          rawInstallments: document.getElementById('installments')?.value
        });
        if (isNaN(amount) || amount <= 0 || isNaN(installments) || installments <= 0) {
          throw new Error('Valor do empréstimo e parcelas devem ser válidos');
        }
        if (!userAccountNumber || userAccountNumber === '---') {
          throw new Error('Número da conta não disponível. Tente novamente após recarregar a página.');
        }
        return {
          url: '/api/loans/request',
          body: { amount, installments, fromAccount: userAccountNumber }
        };
      },
      rechargePhone: () => {
        const form = document.getElementById('rechargeForm');
        if (!form || !form.checkValidity()) {
          form?.reportValidity();
          throw new Error('Preencha todos os campos obrigatórios');
        }
        const operator = document.getElementById('operator')?.value;
        const amount = parseFloat(document.getElementById('amount')?.value);
        const phone = document.getElementById('phone')?.value?.trim();
        console.log('Valores capturados para recarga:', { operator, amount, phone });
        if (!operator || isNaN(amount) || amount <= 0 || !phone) {
          throw new Error('Operadora, valor e telefone são obrigatórios');
        }
        return {
          url: '/api/transactions/recharge',
          body: { operator, amount, phone }
        };
      },
      showQuotes: async () => {
        try {
          console.log('Buscando cotações');
          const response = await fetch('http://localhost:3000/api/quotes', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          console.log('Resposta /quotes:', response.status);
          if (!response.ok) {
            throw new Error('Erro ao buscar cotações');
          }
          const data = await response.json();
          document.getElementById('quotesResult').innerHTML = Object.entries(data.quotes)
            .map(([symbol, { rate, updated }]) => `<p>${symbol}: ${rate} (Atualizado: ${updated})</p>`)
            .join('');
          return null;
        } catch (error) {
          console.error('Erro ao carregar cotações:', error.message);
          document.getElementById('quotesResult').innerHTML = `<p>Erro: ${error.message}</p>`;
          throw error;
        }
      },
      investMoney: () => {
        const form = document.getElementById('investForm');
        if (!form || !form.checkValidity()) {
          form?.reportValidity();
          throw new Error('Preencha todos os campos obrigatórios');
        }
        const type = document.getElementById('investmentType')?.value;
        const amount = parseFloat(document.getElementById('amount')?.value);
        console.log('Valores capturados para investimento:', { type, amount });
        if (!type || isNaN(amount) || amount <= 0) {
          throw new Error('Tipo de investimento e valor são obrigatórios');
        }
        return {
          url: '/api/investments/invest',
          body: { type, amount }
        };
      },
      createVirtualCard: () => {
        const form = document.getElementById('virtualCardForm');
        if (!form || !form.checkValidity()) {
          form?.reportValidity();
          throw new Error('Preencha todos os campos obrigatórios');
        }
        const cardName = document.getElementById('cardName')?.value?.trim();
        console.log('Nome capturado para cartão virtual:', { cardName });
        if (!cardName) {
          throw new Error('Nome no cartão é obrigatório');
        }
        return {
          url: '/api/cards/virtual',
          body: { cardName }
        };
      },
      replacePhysicalCard: () => {
        const form = document.getElementById('replaceCardForm');
        if (!form || !form.checkValidity()) {
          form?.reportValidity();
          throw new Error('Preencha todos os campos obrigatórios');
        }
        const reason = document.getElementById('reason')?.value?.trim();
        console.log('Motivo capturado para troca de cartão:', { reason });
        if (!reason) {
          throw new Error('Motivo da solicitação é obrigatório');
        }
        return {
          url: '/api/cards/replace',
          body: { reason }
        };
      },
      pixTransfer: () => {
        const form = document.getElementById('pixTransferForm');
        if (!form || !form.checkValidity()) {
          form?.reportValidity();
          throw new Error('Preencha todos os campos obrigatórios');
        }
        const key = document.getElementById('pixKey')?.value?.trim();
        const amount = parseFloat(document.getElementById('pixAmount')?.value);
        console.log('Valores capturados para Pix:', { key, amount });
        if (!key || isNaN(amount) || amount <= 0) {
          throw new Error('Chave Pix e valor são obrigatórios');
        }
        return {
          url: '/api/pix/transfer',
          body: { key, amount }
        };
      },
      pixPayment: () => {
        const form = document.getElementById('pixPaymentForm');
        if (!form || !form.checkValidity()) {
          form?.reportValidity();
          throw new Error('Preencha todos os campos obrigatórios');
        }
        const code = document.getElementById('pixCode')?.value?.trim();
        console.log('Código capturado para pagamento Pix:', { code });
        if (!code) {
          throw new Error('Código Pix é obrigatório');
        }
        return {
          url: '/api/pix/pay',
          body: { code }
        };
      },
      pixCharge: () => {
        const form = document.getElementById('pixChargeForm');
        if (!form || !form.checkValidity()) {
          form?.reportValidity();
          throw new Error('Preencha todos os campos obrigatórios');
        }
        const amount = parseFloat(document.getElementById('chargeAmount')?.value);
        console.log('Valor capturado para cobrança Pix:', { amount });
        if (isNaN(amount) || amount <= 0) {
          throw new Error('Valor a cobrar é obrigatório');
        }
        return {
          url: '/api/pix/charge',
          body: { amount }
        };
      },
      pixSchedule: () => {
        const form = document.getElementById('pixScheduleForm');
        if (!form || !form.checkValidity()) {
          form?.reportValidity();
          throw new Error('Preencha todos os campos obrigatórios');
        }
        const key = document.getElementById('pixKey')?.value?.trim();
        const amount = parseFloat(document.getElementById('scheduleAmount')?.value);
        const date = document.getElementById('scheduleDate')?.value;
        console.log('Valores capturados para agendamento Pix:', { key, amount, date });
        if (!key || isNaN(amount) || amount <= 0 || !date) {
          throw new Error('Chave Pix, valor e data são obrigatórios');
        }
        return {
          url: '/api/pix/schedule',
          body: { key, amount, date }
        };
      },
      pixKeys: () => {
        const form = document.getElementById('pixKeysForm');
        if (!form || !form.checkValidity()) {
          form?.reportValidity();
          throw new Error('Preencha todos os campos obrigatórios');
        }
        const type = document.getElementById('keyType')?.value;
        const value = document.getElementById('keyValue')?.value?.trim();
        console.log('Valores capturados para chaves Pix:', { type, value });
        if (!type || !value) {
          throw new Error('Tipo e valor da chave são obrigatórios');
        }
        return {
          url: '/api/pix/keys',
          body: { type, value }
        };
      },
      pixMyKeys: async () => {
        try {
          console.log('Buscando chaves Pix');
          const response = await fetch('http://localhost:3000/api/pix/keys', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          console.log('Resposta /pix/keys:', response.status);
          if (!response.ok) {
            throw new Error('Erro ao buscar chaves Pix');
          }
          const data = await response.json();
          document.getElementById('pixKeysResult').innerHTML = data.keys?.length
            ? data.keys.map(key => `<p>${key.type}: ${key.value}</p>`).join('')
            : '<p>Nenhuma chave Pix cadastrada.</p>';
          return null;
        } catch (error) {
          console.error('Erro ao carregar chaves Pix:', error.message);
          document.getElementById('pixKeysResult').innerHTML = `<p>Erro: ${error.message}</p>`;
          throw error;
        }
      },
      pagar: () => {
        const form = document.getElementById('payBillForm');
        if (!form || !form.checkValidity()) {
          form?.reportValidity();
          throw new Error('Preencha todos os campos obrigatórios');
        }
        const barcode = document.getElementById('barcode')?.value?.trim();
        console.log('Código de barras capturado:', { barcode });
        if (!barcode) {
          throw new Error('Código de barras é obrigatório');
        }
        return {
          url: '/api/transactions/pay-bill',
          body: { barcode }
        };
      },
      emprestimo: () => {
        const form = document.getElementById('loanForm');
        if (!form || !form.checkValidity()) {
          form?.reportValidity();
          throw new Error('Preencha todos os campos obrigatórios');
        }
        const amount = parseFloat(document.getElementById('loanAmount')?.value);
        const installments = parseInt(document.getElementById('installments')?.value);
        console.log('Valores capturados para empréstimo:', {
          amount,
          installments,
          fromAccount: userAccountNumber
        });
        if (isNaN(amount) || amount <= 0 || isNaN(installments) || installments <= 0) {
          throw new Error('Valor do empréstimo e parcelas devem ser válidos');
        }
        if (!userAccountNumber || userAccountNumber === '---') {
          throw new Error('Número da conta não disponível. Tente novamente após recarregar a página.');
        }
        return {
          url: '/api/loans/request',
          body: { amount, installments, fromAccount: userAccountNumber }
        };
      },
      recarga: () => {
        const form = document.getElementById('rechargeForm');
        if (!form || !form.checkValidity()) {
          form?.reportValidity();
          throw new Error('Preencha todos os campos obrigatórios');
        }
        const operator = document.getElementById('operator')?.value;
        const amount = parseFloat(document.getElementById('amount')?.value);
        const phone = document.getElementById('phone')?.value?.trim();
        console.log('Valores capturados para recarga:', { operator, amount, phone });
        if (!operator || isNaN(amount) || amount <= 0 || !phone) {
          throw new Error('Operadora, valor e telefone são obrigatórios');
        }
        return {
          url: '/api/transactions/recharge',
          body: { operator, amount, phone }
        };
      },
      investir: () => {
        const form = document.getElementById('investForm');
        if (!form || !form.checkValidity()) {
          form?.reportValidity();
          throw new Error('Preencha todos os campos obrigatórios');
        }
        const type = document.getElementById('investmentType')?.value;
        const amount = parseFloat(document.getElementById('amount')?.value);
        console.log('Valores capturados para investimento:', { type, amount });
        if (!type || isNaN(amount) || amount <= 0) {
          throw new Error('Tipo de investimento e valor são obrigatórios');
        }
        return {
          url: '/api/investments/invest',
          body: { type, amount }
        };
      }
    };

    if (['recoverAccess', 'productsServices'].includes(action)) {
      console.log('Redirecionando para:', action);
      alert('Redirecionando para a página correspondente.');
      return;
    }

    if (action === 'showQuotes' || action === 'pixMyKeys') {
      try {
        await actions[action]();
        return;
      } catch (error) {
        alert(`Erro ao carregar ${action === 'showQuotes' ? 'cotações' : 'chaves Pix'}: ${error.message}`);
        return;
      }
    }

    if (actions[action]) {
      try {
        const result = await actions[action]();
        if (!result) return;

        const { url, body } = result;
        console.log(`Enviando ação ${action} para ${url}:`, body);
        const response = await fetch(`http://localhost:3000${url}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(body)
        });

        console.log(`Resposta ${url}:`, response.status, response.statusText);
        if (response.status === 401) {
          console.error('Token inválido, redirecionando para login');
          localStorage.removeItem('token');
          window.location.href = '/login.html';
          return;
        }

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch {
            errorData = {};
          }
          const errorMessage = errorData.error || `Erro na ação: ${response.status}`;
          console.error(`Detalhes do erro ${url}:`, { status: response.status, errorData });
          if (errorMessage.includes('Conta não encontrada') || errorMessage.includes('Chave Pix não encontrada')) {
            throw new Error('Destino não encontrado. Verifique a chave Pix ou número da conta.');
          }
          if (url === '/api/loans/request' && response.status === 500) {
            throw new Error('Erro interno no servidor ao solicitar empréstimo. Tente novamente ou contate o suporte.');
          }
          if (errorMessage.includes('ValidationError')) {
            throw new Error('Dados inválidos para o empréstimo. Verifique os campos e tente novamente.');
          }
          throw new Error(errorMessage);
        }

        const responseData = await response.json();
        console.log(`Sucesso na ação ${action}:`, responseData);
        alert('Ação realizada com sucesso!');
        $('#actionModal').modal('hide');
        await Promise.all([loadUserData(), loadHistory(), loadFinancialData()]);
      } catch (error) {
        console.error(`Erro na ação ${action}:`, error.message);
        alert('Erro ao realizar ação: ' + error.message);
      }
    } else {
      console.error('Ação não reconhecida:', action);
      alert('Funcionalidade em desenvolvimento.');
    }
  }

  // Carrega tudo
  await Promise.all([loadUserData(), loadCards(), loadHistory(), loadFinancialData()]);
});