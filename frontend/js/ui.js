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

export function showToast(text) {
  const toast = document.getElementById("toast");
  document.getElementById("toast-text").textContent = text;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.hidden = true;
  }, TOAST_MS);
}
