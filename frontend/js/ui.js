const TOAST_MS = 2600;

let toastTimer;

export function plural(count, one, many) {
  return `${count} ${count === 1 ? one : many}`;
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString("es", { day: "numeric", month: "short" });
}

export function setCounter(input, counter, max) {
  counter.textContent = `${input.value.length} / ${max}`;
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
