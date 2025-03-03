document.getElementById('payDebitForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const amount = document.getElementById('amount').value;
  const cardNumber = document.getElementById('cardNumber').value;

  fetch('/api/pay-debit', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount, cardNumber })
  })
  .then(response => response.json())
  .then(data => {
      const messageDiv = document.getElementById('message');
      if (data.success) {
          messageDiv.textContent = 'Pagamento realizado com sucesso!';
          messageDiv.style.color = 'green';
      } else {
          messageDiv.textContent = 'Erro ao realizar pagamento: ' + data.message;
          messageDiv.style.color = 'red';
      }
  })
  .catch(error => console.error('Erro ao pagar com débito:', error));
});
