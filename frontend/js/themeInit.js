// Script clasico y sincrono, debe correr antes de pintar para evitar el parpadeo del tema
(() => {
  let theme = null;
  try {
    theme = localStorage.getItem("recall-theme");
  } catch { }
  if (theme !== "dark" && theme !== "light") {
    theme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  document.documentElement.dataset.theme = theme;
})();
