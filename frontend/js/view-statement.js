document.addEventListener('DOMContentLoaded', function() {
  fetch('/api/view-statement')
  .then(response => response.json())
  .then(data => {
      const statementDetails = document.getElementById('statement-details');
      if (data.success) {
          statementDetails.innerHTML = `
              <p><strong>Nome:</strong> ${data.statement.name}</p>
              <p><strong>Conta:</strong> ${data.statement.account}</p>
              <p><strong>Data do Extrato:</strong> ${data.statement.date}</p>
              <p><strong>Saldo:</strong> R$${data.statement.balance}</p>
              <p><strong>Transações:</strong></p>
              <ul>
                  ${data.statement.transactions.map(transaction => `
                      <li>
                          <p><strong>Data:</strong> ${transaction.date}</p>
                          <p><strong>Descrição:</strong> ${transaction.description}</p>
                          <p><strong>Valor:</strong> R$${transaction.amount}</p>
                      </li>
                  `).join('')}
              </ul>
          `;
      } else {
          statementDetails.innerHTML = 'Erro ao carregar extrato: ' + data.message;
      }
  })
  .catch(error => console.error('Erro ao carregar extrato:', error));
});
