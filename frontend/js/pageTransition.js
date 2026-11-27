const LEAVE_MS = 150;

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  const plain = event.button === 0 && !(event.ctrlKey || event.metaKey || event.shiftKey || event.altKey);
  if (event.defaultPrevented || !plain || !link || link.target || link.origin !== location.origin) {
    return;
  }
  if (link.pathname === location.pathname && link.search === location.search) {
    return;
  }

  event.preventDefault();
  document.getElementById("app").classList.add("page-leaving");
  setTimeout(() => {
    location.href = link.href;
  }, reducedMotion.matches ? 0 : LEAVE_MS);
});

// al volver con el boton atras el navegador restaura la pagina tal como se fue, ya desvanecida
window.addEventListener("pageshow", () => {
  document.getElementById("app").classList.remove("page-leaving");
});
