document.getElementById('payCreditForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const billNumber = document.getElementById('billNumber').value;
  const amount = document.getElementById('amount').value;

  fetch('/api/pay-credit', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ billNumber, amount })
  })
  .then(response => response.json())
  .then(data => {
      const messageDiv = document.getElementById('message');
      if (data.success) {
          messageDiv.textContent = 'Pagamento com crédito realizado com sucesso!';
          messageDiv.style.color = 'green';
      } else {
          messageDiv.textContent = 'Erro ao realizar o pagamento: ' + data.message;
          messageDiv.style.color = 'red';
      }
  })
  .catch(error => console.error('Erro ao realizar o pagamento:', error));
});
