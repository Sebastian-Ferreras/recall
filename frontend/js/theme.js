const STORAGE_KEY = "recall-theme";

function applyTheme(button, theme) {
  const dark = theme === "dark";
  document.documentElement.dataset.theme = theme;
  button.querySelector("use").setAttribute("href", `/assets/icons.svg#${dark ? "i-sun" : "i-moon"}`);
  button.setAttribute("aria-label", dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
}

export function initThemeToggle(button) {
  // el script del head ya puso data-theme; aqui solo se sincroniza el boton
  applyTheme(button, document.documentElement.dataset.theme === "dark" ? "dark" : "light");

  button.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(button, next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // sin almacenamiento el tema solo dura mientras la pagina esta abierta
    }
  });
}
