document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('createCardForm');
  const message = document.getElementById('message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      message.textContent = 'Faça login para criar um cartão.';
      message.className = 'error';
      return;
    }

    const cardData = {
      fullName: document.getElementById('fullName').value,
      rg: document.getElementById('rg').value,
      cpf: document.getElementById('cpf').value,
      address: document.getElementById('address').value,
      cardPassword: document.getElementById('cardPassword').value,
    };

    try {
      const response = await fetch('http://localhost:3000/api/cards/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(cardData),
      });

      const result = await response.json();

      if (response.ok) {
        message.textContent = result.message || 'Cartão criado com sucesso! Verifique os detalhes enviados.';
        message.className = 'success';
        form.reset();
      } else {
        message.textContent = result.error || 'Erro ao criar cartão.';
        message.className = 'error';
      }
    } catch (error) {
      message.textContent = 'Erro de conexão com o servidor.';
      message.className = 'error';
      console.error('Erro ao criar cartão:', error);
    }
  });
});