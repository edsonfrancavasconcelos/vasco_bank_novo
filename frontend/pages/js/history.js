document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const accountId = 'SEU_ACCOUNT_ID_AQUI'; // Substitua por um método para obter o ID do usuário logado
  
    try {
      const response = await fetch(`http://localhost:3000/api/history/${accountId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();
  
      const historyBody = document.getElementById('history-body');
      if (response.ok) {
        result.forEach(transaction => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${new Date(transaction.date).toLocaleDateString()}</td>
            <td>${transaction.type}</td>
            <td>${transaction.amount.toFixed(2)}</td>
            <td>${transaction.details || '-'}</td>
          `;
          historyBody.appendChild(row);
        });
      } else {
        historyBody.innerHTML = `<tr><td colspan="4">${result.message || 'Erro ao carregar histórico.'}</td></tr>`;
      }
    } catch (error) {
      document.getElementById('history-body').innerHTML = `<tr><td colspan="4">Erro de conexão com o servidor.</td></tr>`;
      console.error(error);
    }
  });