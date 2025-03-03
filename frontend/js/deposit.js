document.getElementById('depositForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const accountNumber = document.getElementById('accountNumber').value;
  const amount = document.getElementById('amount').value;

  fetch('/api/deposit', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ accountNumber, amount })
  })
  .then(response => response.json())
  .then(data => {
      const messageDiv = document.getElementById('message');
      if (data.success) {
          messageDiv.textContent = 'Depósito realizado com sucesso!';
          messageDiv.style.color = 'green';
      } else {
          messageDiv.textContent = 'Erro ao realizar o depósito: ' + data.message;
          messageDiv.style.color = 'red';
      }
  })
  .catch(error => console.error('Erro ao realizar o depósito:', error));
});
