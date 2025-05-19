document.addEventListener('DOMContentLoaded', () => {
    const preload = document.getElementById('preload');
    const content = document.getElementById('content');
  
    setTimeout(() => {
      preload.style.opacity = '0';
      content.classList.remove('hidden');
      setTimeout(() => preload.remove(), 500);
    }, 1500);
  
    // Verificar autenticação
    if (localStorage.getItem('jwt')) {
      fetch('http://localhost:3000/api/users/info', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt')}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.fullName) {
            window.location.href = 'dashboard.html';
          }
        })
        .catch(() => localStorage.removeItem('jwt'));
    }
  });