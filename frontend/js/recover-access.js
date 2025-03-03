document.getElementById('recoverAccessForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const email = document.getElementById('email').value;

  fetch('/api/recover-access', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
  })
  .then(response => response.json())
  .then(data => {
      const messageDiv = document.getElementById('message');
      if (data.success) {
          messageDiv.textContent = 'Instruções de recuperação enviadas para o e-mail!';
          messageDiv.style.color = 'green';
      } else {
          messageDiv.textContent = 'Erro ao recuperar acesso: ' + data.message;
          messageDiv.style.color = 'red';
      }
  })
  .catch(error => console.error('Erro ao recuperar acesso:', error));
});
