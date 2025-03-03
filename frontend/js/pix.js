// js/pix.js
document.getElementById('pixForm').addEventListener('submit', function(event) {
  event.preventDefault();  // Evita o envio padrão do formulário

  const pixKey = document.getElementById('pixKey').value;
  const amount = document.getElementById('amount').value;

  // Exemplo de chamada de API para realizar o Pix
  fetch('/api/pix', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ pixKey, amount })
  })
  .then(response => response.json())
  .then(data => {
      const messageDiv = document.getElementById('message');
      if (data.success) {
          messageDiv.textContent = 'Pix realizado com sucesso!';
          messageDiv.style.color = 'green';
      } else {
          messageDiv.textContent = 'Erro ao realizar o Pix: ' + data.message;
          messageDiv.style.color = 'red';
      }
  })
  .catch(error => console.error('Erro ao realizar o Pix:', error));
});
