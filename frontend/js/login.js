document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Exemplo de chamada de API para login
  fetch('/api/login', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
  })
  .then(response => response.json())
  .then(data => {
      if (data.success) {
          alert('Login realizado com sucesso!');
          window.location.href = 'access-account.html';
      } else {
          alert('Falha no login. Verifique suas credenciais.');
      }
  })
  .catch(error => console.error('Erro:', error));
});
