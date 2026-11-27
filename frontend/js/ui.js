const TOAST_MS = 2600;

let toastTimer;

export function plural(count, one, many) {
  return `${count} ${count === 1 ? one : many}`;
}

// el id viene de la URL, solo se acepta un entero positivo
export function readDeckId() {
  const value = new URLSearchParams(location.search).get("id");
  return /^[1-9]\d*$/.test(value ?? "") ? Number(value) : null;
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString("es", { day: "numeric", month: "short" });
}

// NFD separa la tilde de la letra y el rango quita las marcas, asi "anatomia" encuentra "Anatomía" con o sin tilde
export function normalizeText(text) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function setCounter(input, counter, max) {
  counter.textContent = `${input.value.length} / ${max}`;
}

// ASP.NET devuelve los mensajes de cada campo como lista
export function firstMessage(messages) {
  return Array.isArray(messages) ? messages[0] : messages;
}

export function setFieldError(input, errorElement, message) {
  const invalid = Boolean(message);
  errorElement.querySelector("span").textContent = invalid ? message : "";
  errorElement.hidden = !invalid;
  if (invalid) {
    input.setAttribute("aria-invalid", "true");
  } else {
    input.removeAttribute("aria-invalid");
  }
}

export function confirmDelete(dialog, text) {
  dialog.querySelector("[data-delete-text]").textContent = text;

  return new Promise((resolve) => {
    const controller = new AbortController();
    const { signal } = controller;
    let confirmed = false;

    dialog.querySelector("[data-confirm]").addEventListener(
      "click",
      () => {
        confirmed = true;
        dialog.close();
      },
      { signal },
    );
    for (const button of dialog.querySelectorAll("[data-close]")) {
      button.addEventListener("click", () => dialog.close(), { signal });
    }
    dialog.addEventListener(
      "click",
      (event) => {
        if (event.target === dialog) {
          dialog.close();
        }
      },
      { signal },
    );
    // Esc, Cancelar y el fondo terminan aqui, asi la promesa siempre se resuelve
    dialog.addEventListener(
      "close",
      () => {
        controller.abort();
        resolve(confirmed);
      },
      { signal },
    );

    dialog.showModal();
  });
}

export function showToast(text, isError = false) {
  const toast = document.getElementById("toast");
  document.getElementById("toast-text").textContent = text;
  document.getElementById("toast-icon").setAttribute("href", `/assets/icons.svg#${isError ? "i-alert" : "i-check"}`);
  toast.classList.toggle("bg-primary", !isError);
  toast.classList.toggle("text-on-primary", !isError);
  toast.classList.toggle("bg-danger", isError);
  toast.classList.toggle("text-on-danger", isError);
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.hidden = true;
  }, TOAST_MS);
}
