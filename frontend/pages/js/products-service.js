document.addEventListener('DOMContentLoaded', async () => {
    try {
      const response = await fetch('http://localhost:3000/api/products', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
  
      const productsList = document.getElementById('products-list');
      if (response.ok) {
        result.forEach(product => {
          const div = document.createElement('div');
          div.className = 'product';
          div.innerHTML = `
            <h3>${product.name}</h3>
            <p>${product.description}</p>
          `;
          productsList.appendChild(div);
        });
      } else {
        productsList.innerHTML = `<p>${result.message || 'Erro ao carregar produtos.'}</p>`;
      }
    } catch (error) {
      document.getElementById('products-list').innerHTML = `<p>Erro de conexão com o servidor.</p>`;
      console.error(error);
    }
  });