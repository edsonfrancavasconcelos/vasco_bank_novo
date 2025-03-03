document.addEventListener('DOMContentLoaded', function() {
  fetch('/api/view-history')
  .then(response => response.json())
  .then(data => {
      const historyList = document.getElementById('history-list');
      if (data.success) {
          data.history.forEach(transaction => {
              const transactionItem = document.createElement('div');
              transactionItem.classList.add('transaction-item');
              transactionItem.innerHTML = `
                  <p><strong>Data:</strong> ${transaction.date}</p>
                  <p><strong>Descrição:</strong> ${transaction.description}</p>
                  <p><strong>Valor:</strong> R$${transaction.amount}</p>
              `;
              historyList.appendChild(transactionItem);
          });
      } else {
          historyList.innerHTML = 'Erro ao carregar histórico: ' + data.message;
      }
  })
  .catch(error => console.error('Erro ao carregar histórico:', error));
});
