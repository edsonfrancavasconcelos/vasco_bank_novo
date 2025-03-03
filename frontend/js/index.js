document.addEventListener("DOMContentLoaded", function () {
  const carousel = document.querySelector(".carousel");
  const slidesContainer = document.querySelector(".slides");
  const slides = document.querySelectorAll(".slide");
  let currentIndex = 0;
  let slideWidth = slides[0].clientWidth;

  function goToSlide(index) {
    slidesContainer.style.transform = `translateX(-${index * slideWidth}px)`;
    slidesContainer.style.transition = "transform 0.5s ease-in-out"; // Add smooth transition
  }
  const sidebar = document.querySelector(".sidebar");
  const container = document.querySelector(".container-fluid");

  container.addEventListener("mouseenter", () => {
    sidebar.style.transform = "translateX(0)";
  });

  container.addEventListener("mouseleave", () => {
    sidebar.style.transform = "translateX(-100%)";
  });
  $(document).ready(function () {
    // Inicializa o carrossel
    $("#carouselExampleIndicators").carousel({
      interval: 5000,
      pause: "hover",
    });

    // Habilita o toque no carrossel para dispositivos móveis
    $(".carousel-touch")
      .on("touchstart", function (e) {
        const touch =
          e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
        $(this).data("startX", touch.pageX);
      })
      .on("touchmove", function (e) {
        const touch =
          e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
        const deltaX = touch.pageX - $(this).data("startX");
        if (deltaX > 50) {
          $(this).carousel("prev");
        } else if (deltaX < -50) {
          $(this).carousel("next");
        }
      });
  });

  function handleScroll(event) {
    event.preventDefault();
    const direction = event.deltaY > 0 ? 1 : -1; // Determine scroll direction
    let newIndex = currentIndex + direction;

    // Ensure we're within bounds
    newIndex = Math.max(0, Math.min(newIndex, slides.length - 1));

    if (newIndex !== currentIndex) {
      currentIndex = newIndex;
      goToSlide(currentIndex);
    }
  }

  // Mouse wheel event
  carousel.addEventListener("wheel", handleScroll);

  // Touch events for mobile interaction
  let touchStartX = 0;

  carousel.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
  });

  carousel.addEventListener("touchmove", (e) => {
    if (e.cancelable) {
      e.preventDefault();
    }
    const touchMoveX = e.touches[0].clientX;
    const direction = touchStartX - touchMoveX > 0 ? 1 : -1; // Detect swipe direction

    let newIndex = currentIndex + direction;

    newIndex = Math.max(0, Math.min(newIndex, slides.length - 1)); // Ensure we're within bounds

    if (newIndex !== currentIndex) {
      currentIndex = newIndex;
      goToSlide(currentIndex);
      touchStartX = touchMoveX; // Reset start position
    }
  });

  $(document).ready(function () {
    $("#carouselExampleIndicators").carousel();
  });

  // Handle window resizing
  window.addEventListener("resize", () => {
    slideWidth = slides[0].clientWidth;
    goToSlide(currentIndex); // Realign slides if window size changes
  });
});
