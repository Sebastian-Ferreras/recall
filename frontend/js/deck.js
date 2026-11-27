import { ApiError, createCard, getCards, getDeck, updateCard } from "/js/api.js";
import { firstMessage, normalizeText, plural, setCounter, setFieldError, showToast } from "/js/ui.js";

const QUESTION_MAX = 500;
const ANSWER_MAX = 1000;

const state = {
  status: "loading",
  deck: null,
  cards: [],
  errorMessage: "",
  flipped: new Set(),
  query: "",
  sort: "old",
};

const elements = {};

// el numero de la ficha es su posicion de creacion y no cambia con el orden elegido
const sorters = {
  old: (a, b) => a.number - b.number,
  recent: (a, b) => b.number - a.number,
  az: (a, b) => a.card.question.localeCompare(b.card.question, "es"),
};

export function initDeckPage() {
  const ids = [
    "title", "summary", "count-badge", "edit-deck", "deck-actions", "study", "new-card",
    "missing", "content", "error", "error-text", "retry", "loading", "empty", "grid",
    "toolbar", "search", "sort", "no-results", "no-results-q", "clear-search", "empty-new",
  ];
  for (const id of ids) {
    elements[id] = document.getElementById(id);
  }
  elements.cardTemplate = document.getElementById("card-item");
  elements.newTemplate = document.getElementById("new-card-tile");

  elements.retry.addEventListener("click", () => loadDeck());
  elements.grid.addEventListener("click", handleGridClick);
  elements.search.addEventListener("input", () => {
    state.query = elements.search.value;
    render();
  });
  elements.sort.addEventListener("change", () => {
    state.sort = elements.sort.value;
    render();
  });
  elements["clear-search"].addEventListener("click", () => {
    state.query = "";
    elements.search.value = "";
    render();
    elements.search.focus();
  });
  elements.viewDialog = document.getElementById("view-dialog");
  for (const button of elements.viewDialog.querySelectorAll("[data-close]")) {
    button.addEventListener("click", () => elements.viewDialog.close());
  }
  elements.viewDialog.addEventListener("click", (event) => {
    if (event.target === elements.viewDialog) {
      elements.viewDialog.close();
    }
  });
  elements["new-card"].addEventListener("click", () => openCardForm(null));
  elements["empty-new"].addEventListener("click", () => openCardForm(null));
  connectCardForm();
  // el CDN de Tailwind aplica los estilos despues del primer render y la ventana cambia el ancho de la ficha, ambos alteran que texto queda recortado
  new ResizeObserver(markClippedCards).observe(elements.grid);
  loadDeck();
}

function handleGridClick(event) {
  const target = event.target.closest("[data-flip], [data-action]");
  if (!target) {
    return;
  }
  const article = target.closest("article");
  if (article && (target.matches("[data-flip]") || target.dataset.action === "turn")) {
    toggleFlip(article);
  } else if (article && target.dataset.action === "view") {
    openCardView(Number(article.dataset.id));
  } else if (target.dataset.action === "new") {
    openCardForm(null);
  } else if (article && target.dataset.action === "edit") {
    const card = state.cards.find((item) => item.id === Number(article.dataset.id));
    if (card) {
      openCardForm(card);
    }
  }
}

function openCardView(id) {
  const index = state.cards.findIndex((card) => card.id === id);
  if (index === -1) {
    return;
  }
  const card = state.cards[index];
  document.getElementById("view-title").textContent = `Tarjeta N.º ${index + 1}`;
  document.getElementById("view-question").textContent = card.question;
  document.getElementById("view-answer").textContent = card.answer;
  elements.viewDialog.showModal();
}

// solo se ofrece "Ver completa" cuando line-clamp recorta el texto de alguna de las dos caras
function markClippedCards() {
  for (const article of elements.grid.querySelectorAll("article")) {
    const clipped = [...article.querySelectorAll("[data-q], [data-a]")].some(
      (text) => text.scrollHeight > text.clientHeight,
    );
    article.querySelector('[data-action="view"]').hidden = !clipped;
  }
}

// solo cambia la ficha tocada, un render completo reiniciaria la animacion
function toggleFlip(article) {
  const id = Number(article.dataset.id);
  const flipped = !state.flipped.has(id);
  if (flipped) {
    state.flipped.add(id);
  } else {
    state.flipped.delete(id);
  }
  applyFlip(article, flipped);
}

function applyFlip(article, flipped) {
  article.querySelector("[data-flip]").setAttribute("aria-pressed", String(flipped));
  article.querySelector("[data-front]").setAttribute("aria-hidden", String(flipped));
  article.querySelector("[data-back]").setAttribute("aria-hidden", String(!flipped));
}

// el id viene de la URL, solo se acepta un entero positivo
function readDeckId() {
  const value = new URLSearchParams(location.search).get("id");
  return /^[1-9]\d*$/.test(value ?? "") ? Number(value) : null;
}

// silent evita el esqueleto de carga al recargar tras guardar, que haria saltar la pantalla
async function loadDeck({ silent = false } = {}) {
  const id = readDeckId();
  if (id === null) {
    state.status = "missing";
    render();
    return;
  }

  if (!silent) {
    state.status = "loading";
    render();
  }

  try {
    const [deck, cards] = await Promise.all([getDeck(id), getCards(id)]);
    state.deck = deck;
    state.cards = cards.toSorted((a, b) => a.id - b.id);
    state.status = state.cards.length === 0 ? "empty" : "ready";
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      state.status = "missing";
    } else {
      state.errorMessage = error.message;
      state.status = "error";
    }
  }
  render();
}

function filterCards(items, query) {
  const needle = normalizeText(query.trim());
  if (!needle) {
    return items;
  }
  return items.filter(({ card }) => normalizeText(`${card.question} ${card.answer}`).includes(needle));
}

function visibleCards() {
  const items = state.cards.map((card, index) => ({ card, number: index + 1 }));
  return filterCards(items, state.query).toSorted(sorters[state.sort]);
}

function render() {
  const { status, deck } = state;
  const loaded = status === "ready" || status === "empty";
  const cardCount = state.cards.length;
  const ready = status === "ready";
  const items = ready ? visibleCards() : [];
  const searching = state.query.trim() !== "";

  elements.toolbar.hidden = !ready;
  elements["no-results"].hidden = !(ready && items.length === 0);
  elements["no-results-q"].textContent = state.query.trim();

  elements.loading.hidden = status !== "loading";
  elements.error.hidden = status !== "error";
  elements.empty.hidden = status !== "empty";
  elements.missing.hidden = status !== "missing";
  elements.content.hidden = status === "missing";
  elements["error-text"].textContent = `No se pudieron cargar las tarjetas: ${state.errorMessage}`;

  renderHeader(loaded);

  elements.grid.replaceChildren();
  if (items.length > 0) {
    renderCards(items, !searching);
  }

  if (loaded) {
    document.title = `${deck.name} - Recall`;
  } else if (status === "missing") {
    document.title = "Mazo no encontrado - Recall";
  }
  elements["count-badge"].textContent = loaded ? plural(cardCount, "tarjeta", "tarjetas") : "";
}

function renderHeader(loaded) {
  const { status, deck } = state;

  if (loaded) {
    elements.title.textContent = deck.name;
    elements.title.title = deck.name;
  } else {
    elements.title.textContent = status === "missing" ? "Mazo no encontrado" : " ";
    elements.title.removeAttribute("title");
  }

  const summary = elements.summary;
  if (loaded) {
    summary.textContent = deck.description || "Sin descripcion";
    summary.title = deck.description ?? "";
  } else {
    summary.textContent = status === "missing" ? "No existe un mazo con ese identificador" : " ";
    summary.removeAttribute("title");
  }
  summary.classList.toggle("italic", loaded && !deck.description);

  elements["count-badge"].classList.toggle("invisible", !loaded);
  elements["edit-deck"].classList.toggle("invisible", !loaded);
  elements["deck-actions"].classList.toggle("invisible", !loaded);
  elements["new-card"].classList.toggle("invisible", status !== "ready");

  const study = elements.study;
  const noCards = state.cards.length === 0;
  if (loaded && !noCards) {
    study.href = `/study.html?id=${deck.id}`;
    study.removeAttribute("aria-disabled");
    study.removeAttribute("title");
    study.removeAttribute("tabindex");
  } else {
    study.removeAttribute("href");
    study.setAttribute("aria-disabled", "true");
    study.tabIndex = -1;
    study.title = "Agrega tarjetas para poder estudiar";
  }
  study.classList.toggle("pointer-events-none", !loaded || noCards);
  study.classList.toggle("opacity-50", !loaded || noCards);
}

function renderCards(items, withNewTile) {
  const fragment = document.createDocumentFragment();
  for (const { card, number } of items) {
    fragment.append(createCardItem(card, number));
  }
  if (withNewTile) {
    fragment.append(elements.newTemplate.content.cloneNode(true));
  }
  elements.grid.append(fragment);
  markClippedCards();
}

function createCardItem(card, number) {
  const node = elements.cardTemplate.content.cloneNode(true);

  const article = node.querySelector("article");
  article.dataset.id = card.id;
  applyFlip(article, state.flipped.has(card.id));
  for (const target of node.querySelectorAll("[data-n]")) {
    target.textContent = number;
  }
  node.querySelector("[data-q]").textContent = card.question;
  node.querySelector("[data-a]").textContent = card.answer;

  for (const button of node.querySelectorAll("[data-action]")) {
    button.dataset.id = card.id;
  }
  node.querySelector('[data-action="edit"]').setAttribute("aria-label", `Editar la tarjeta ${number}`);
  node.querySelector('[data-action="delete"]').setAttribute("aria-label", `Borrar la tarjeta ${number}`);

  return node;
}

const cardForm = { editing: null, opener: null };

function connectCardForm() {
  const dialog = document.getElementById("card-dialog");
  Object.assign(cardForm, {
    dialog,
    form: dialog.querySelector("form"),
    title: dialog.querySelector("#card-dialog-title"),
    question: dialog.querySelector("#card-question"),
    questionCount: dialog.querySelector("#card-question-count"),
    questionError: dialog.querySelector("#card-question-error"),
    answer: dialog.querySelector("#card-answer"),
    answerCount: dialog.querySelector("#card-answer-count"),
    answerError: dialog.querySelector("#card-answer-error"),
    formError: dialog.querySelector("#card-form-error"),
    another: dialog.querySelector("#card-another"),
    submit: dialog.querySelector("#card-submit"),
  });

  cardForm.form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitCardForm(event.submitter === cardForm.another);
  });
  cardForm.question.addEventListener("input", () => {
    setFieldError(cardForm.question, cardForm.questionError, null);
    updateCardCounters();
  });
  cardForm.answer.addEventListener("input", () => {
    setFieldError(cardForm.answer, cardForm.answerError, null);
    updateCardCounters();
  });
  for (const field of [cardForm.question, cardForm.answer]) {
    field.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        cardForm.form.requestSubmit(cardForm.submit);
      }
    });
  }
  for (const button of dialog.querySelectorAll("[data-close]")) {
    button.addEventListener("click", () => dialog.close());
  }
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });
  dialog.addEventListener("close", () => {
    if (cardForm.opener?.isConnected) {
      cardForm.opener.focus();
    }
  });
}

function openCardForm(card) {
  cardForm.editing = card;
  cardForm.opener = document.activeElement;

  cardForm.title.textContent = card ? "Editar tarjeta" : "Nueva tarjeta";
  cardForm.submit.textContent = card ? "Guardar cambios" : "Agregar tarjeta";
  cardForm.another.hidden = card !== null;
  cardForm.question.value = card ? card.question : "";
  cardForm.answer.value = card ? card.answer : "";
  clearCardErrors();
  updateCardCounters();

  cardForm.dialog.showModal();
  cardForm.question.focus();
}

function updateCardCounters() {
  setCounter(cardForm.question, cardForm.questionCount, QUESTION_MAX);
  setCounter(cardForm.answer, cardForm.answerCount, ANSWER_MAX);
}

function clearCardErrors() {
  setFieldError(cardForm.question, cardForm.questionError, null);
  setFieldError(cardForm.answer, cardForm.answerError, null);
  cardForm.formError.hidden = true;
}

async function submitCardForm(addAnother) {
  clearCardErrors();

  const question = cardForm.question.value.trim();
  const answer = cardForm.answer.value.trim();
  if (!question || !answer) {
    setFieldError(cardForm.question, cardForm.questionError, question ? null : "La pregunta es obligatoria");
    setFieldError(cardForm.answer, cardForm.answerError, answer ? null : "La respuesta es obligatoria");
    (question ? cardForm.answer : cardForm.question).focus();
    return;
  }
  const data = { question, answer };

  cardForm.submit.disabled = true;
  cardForm.another.disabled = true;
  try {
    const editing = cardForm.editing;
    const saved = editing ? await updateCard(editing.id, data) : await createCard(state.deck.id, data);
    await loadDeck({ silent: true });
    showToast(editing ? "Tarjeta actualizada" : "Tarjeta agregada");

    if (addAnother) {
      cardForm.question.value = "";
      cardForm.answer.value = "";
      updateCardCounters();
      cardForm.question.focus();
    } else {
      cardForm.dialog.close();
      if (!editing) {
        elements.grid.querySelector(`[data-id="${saved.id}"]`)?.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }
  } catch (error) {
    showCardError(error);
  } finally {
    cardForm.submit.disabled = false;
    cardForm.another.disabled = false;
  }
}

function showCardError(error) {
  if (!(error instanceof ApiError)) {
    throw error;
  }

  const questionMessage = firstMessage(error.errors.Question);
  const answerMessage = firstMessage(error.errors.Answer);
  setFieldError(cardForm.question, cardForm.questionError, questionMessage);
  setFieldError(cardForm.answer, cardForm.answerError, answerMessage);

  if (questionMessage) {
    cardForm.question.focus();
  } else if (answerMessage) {
    cardForm.answer.focus();
  } else {
    cardForm.formError.querySelector("span").textContent = error.message;
    cardForm.formError.hidden = false;
  }
}
