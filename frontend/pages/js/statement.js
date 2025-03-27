document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const accountId = 'SEU_ACCOUNT_ID_AQUI'; // Substitua por um método para obter o ID do usuário logado
  
    try {
      const response = await fetch(`http://localhost:3000/api/statement/${accountId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();
  
      const statementBody = document.getElementById('statement-body');
      if (response.ok) {
        result.forEach(entry => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${new Date(entry.date).toLocaleDateString()}</td>
            <td>${entry.description}</td>
            <td>${entry.amount.toFixed(2)}</td>
          `;
          statementBody.appendChild(row);
        });
      } else {
        statementBody.innerHTML = `<tr><td colspan="3">${result.message || 'Erro ao carregar extrato.'}</td></tr>`;
      }
    } catch (error) {
      document.getElementById('statement-body').innerHTML = `<tr><td colspan="3">Erro de conexão com o servidor.</td></tr>`;
      console.error(error);
    }
  });