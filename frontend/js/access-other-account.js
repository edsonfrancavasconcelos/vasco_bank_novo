document.getElementById('accessOtherAccountForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const otherAccountNumber = document.getElementById('otherAccountNumber').value;
  const password = document.getElementById('password').value;

  fetch('/api/access-other-account', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ otherAccountNumber, password })
  })
  .then(response => response.json())
  .then(data => {
      const messageDiv = document.getElementById('message');
      if (data.success) {
          messageDiv.textContent = 'Outra conta acessada com sucesso!';
          messageDiv.style.color = 'green';
      } else {
          messageDiv.textContent = 'Erro ao acessar outra conta: ' + data.message;
          messageDiv.style.color = 'red';
      }
  })
  .catch(error => console.error('Erro ao acessar outra conta:', error));
});
