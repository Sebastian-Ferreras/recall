import { ApiError, createDeck, updateDeck } from "/js/api.js";
import { firstMessage, setCounter, setFieldError } from "/js/ui.js";

const NAME_MAX = 100;
const DESCRIPTION_MAX = 500;

// el modal es unico por pagina: los listeners se conectan una vez y lo que cambia por apertura va aqui
const current = { deck: null, onSaved: null, opener: null };

let form;

export function openDeckForm(dialog, deck, onSaved) {
  if (!form) {
    form = connect(dialog);
  }

  current.deck = deck;
  current.onSaved = onSaved;
  current.opener = document.activeElement;

  form.title.textContent = deck ? "Editar mazo" : "Nuevo mazo";
  form.submit.textContent = deck ? "Guardar cambios" : "Crear mazo";
  form.name.value = deck ? deck.name : "";
  form.description.value = deck?.description ?? "";
  clearErrors();
  updateCounters();

  dialog.showModal();
  form.name.focus();
}

function connect(dialog) {
  const elements = {
    dialog,
    form: dialog.querySelector("form"),
    title: dialog.querySelector("#deck-dialog-title"),
    name: dialog.querySelector("#deck-name"),
    nameCount: dialog.querySelector("#deck-name-count"),
    nameError: dialog.querySelector("#deck-name-error"),
    description: dialog.querySelector("#deck-desc"),
    descriptionCount: dialog.querySelector("#deck-desc-count"),
    descriptionError: dialog.querySelector("#deck-desc-error"),
    formError: dialog.querySelector("#deck-form-error"),
    submit: dialog.querySelector("#deck-submit"),
  };

  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitForm();
  });
  elements.name.addEventListener("input", () => {
    setFieldError(elements.name, elements.nameError, null);
    updateCounters();
  });
  elements.description.addEventListener("input", () => {
    setFieldError(elements.description, elements.descriptionError, null);
    updateCounters();
  });
  for (const button of dialog.querySelectorAll("[data-close]")) {
    button.addEventListener("click", () => dialog.close());
  }
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });
  dialog.addEventListener("close", () => {
    if (current.opener?.isConnected) {
      current.opener.focus();
    }
  });

  return elements;
}

function updateCounters() {
  setCounter(form.name, form.nameCount, NAME_MAX);
  setCounter(form.description, form.descriptionCount, DESCRIPTION_MAX);
}

function clearErrors() {
  setFieldError(form.name, form.nameError, null);
  setFieldError(form.description, form.descriptionError, null);
  form.formError.hidden = true;
}

async function submitForm() {
  clearErrors();

  const name = form.name.value.trim();
  if (!name) {
    setFieldError(form.name, form.nameError, "El nombre es obligatorio");
    form.name.focus();
    return;
  }
  const data = { name, description: form.description.value.trim() || null };

  form.submit.disabled = true;
  try {
    const saved = current.deck ? await updateDeck(current.deck.id, data) : await createDeck(data);
    form.dialog.close();
    await current.onSaved(saved, current.deck === null);
  } catch (error) {
    showError(error);
  } finally {
    form.submit.disabled = false;
  }
}

function showError(error) {
  if (!(error instanceof ApiError)) {
    throw error;
  }

  const nameMessage = firstMessage(error.errors.Name);
  const descriptionMessage = firstMessage(error.errors.Description);
  setFieldError(form.name, form.nameError, nameMessage);
  setFieldError(form.description, form.descriptionError, descriptionMessage);

  if (nameMessage) {
    form.name.focus();
  } else if (descriptionMessage) {
    form.description.focus();
  } else {
    form.formError.querySelector("span").textContent = error.message;
    form.formError.hidden = false;
  }
}
