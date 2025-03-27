document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const links = document.querySelectorAll('main ul li a');

  // Destaca o link clicado (opcional)
  links.forEach(link => {
    link.addEventListener('click', () => {
      links.forEach(l => l.style.fontWeight = 'normal');
      link.style.fontWeight = 'bold';
    });
  });

  // Verifica se o usuário está logado e exibe uma mensagem (opcional)
  if (token) {
    const welcomeMessage = document.querySelector('main h2');
    welcomeMessage.textContent = 'Bem-vindo de volta!';
  }
});