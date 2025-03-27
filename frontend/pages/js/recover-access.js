document.getElementById('recoverAccessForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = { email: form.email.value };
  
    try {
      const response = await fetch('http://localhost:3000/api/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
  
      if (response.ok) {
        document.getElementById('message').textContent = 'Instruções de recuperação enviadas para seu e-mail!';
      } else {
        document.getElementById('message').textContent = result.error || 'Erro ao recuperar acesso.';
      }
    } catch (error) {
      document.getElementById('message').textContent = 'Erro de conexão com o servidor.';
      console.error(error);
    }
  });