document.addEventListener('DOMContentLoaded', function() {
  fetch('/api/service-products')
  .then(response => response.json())
  .then(data => {
      const productsList = document.getElementById('products-list');
      if (data.success) {
          data.products.forEach(product => {
              const productItem = document.createElement('div');
              productItem.classList.add('product-item');
              productItem.innerHTML = `
                  <h3>${product.name}</h3>
                  <p>${product.description}</p>
                  <p>Preço: R$${product.price}</p>
              `;
              productsList.appendChild(productItem);
          });
      } else {
          productsList.innerHTML = 'Erro ao carregar produtos: ' + data.message;
      }
  })
  .catch(error => console.error('Erro ao carregar produtos:', error));
});
