document.addEventListener("DOMContentLoaded", () => {
  // Elementos do DOM
  const preload = document.getElementById("preload");
  const content = document.getElementById("content");

  // Remove o preloader e mostra o conteúdo após 2 segundos
  setTimeout(() => {
      preload.style.opacity = "0";
      preload.style.transition = "opacity 0.5s ease";
      setTimeout(() => {
          preload.style.display = "none";
          content.classList.remove("hidden");
      }, 500); // Tempo da transição de fade-out
  }, 2000); // Tempo total do preloader

  // Interatividade básica nos ícones (exemplo pra ações sem link)
  const iconItems = document.querySelectorAll(".icon-item");
  iconItems.forEach(item => {
      item.addEventListener("click", (e) => {
          // Se o item não tiver href ou for "#", mostra um alerta temporário
          const href = item.getAttribute("href");
          if (!href || href === "#") {
              e.preventDefault();
              const spanText = item.querySelector("span").textContent;
              alert(`${spanText}: Em desenvolvimento. Em breve no VascoBank!`);
          }
      });
  });
});