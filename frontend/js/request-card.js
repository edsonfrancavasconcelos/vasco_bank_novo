document.getElementById('requestCardForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const address = document.getElementById('address').value;

  fetch('/api/request-card', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, address })
  })
  .then(response => response.json())
  .then(data => {
      const messageDiv = document.getElementById('message');
      if (data.success) {
          messageDiv.textContent = 'Solicitação de cartão realizada com sucesso!';
          messageDiv.style.color = 'green';
      } else {
          messageDiv.textContent = 'Erro ao solicitar cartão: ' + data.message;
          messageDiv.style.color = 'red';
      }
  })
  .catch(error => console.error('Erro ao solicitar cartão:', error));
});
