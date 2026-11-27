import { ApiError, getCards, getDeck } from "/js/api.js";
import { plural } from "/js/ui.js";

const state = {
  status: "loading",
  deck: null,
  cards: [],
  errorMessage: "",
  flipped: new Set(),
};

const elements = {};

export function initDeckPage() {
  const ids = [
    "title", "summary", "count-badge", "edit-deck", "deck-actions", "study", "new-card",
    "missing", "content", "error", "error-text", "retry", "loading", "empty", "grid",
  ];
  for (const id of ids) {
    elements[id] = document.getElementById(id);
  }
  elements.cardTemplate = document.getElementById("card-item");
  elements.newTemplate = document.getElementById("new-card-tile");

  elements.retry.addEventListener("click", () => loadDeck());
  elements.grid.addEventListener("click", handleGridClick);
  elements.viewDialog = document.getElementById("view-dialog");
  for (const button of elements.viewDialog.querySelectorAll("[data-close]")) {
    button.addEventListener("click", () => elements.viewDialog.close());
  }
  elements.viewDialog.addEventListener("click", (event) => {
    if (event.target === elements.viewDialog) {
      elements.viewDialog.close();
    }
  });
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

async function loadDeck() {
  const id = readDeckId();
  if (id === null) {
    state.status = "missing";
    render();
    return;
  }

  state.status = "loading";
  render();

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

function render() {
  const { status, deck } = state;
  const loaded = status === "ready" || status === "empty";
  const cardCount = state.cards.length;

  elements.loading.hidden = status !== "loading";
  elements.error.hidden = status !== "error";
  elements.empty.hidden = status !== "empty";
  elements.missing.hidden = status !== "missing";
  elements.content.hidden = status === "missing";
  elements["error-text"].textContent = `No se pudieron cargar las tarjetas: ${state.errorMessage}`;

  renderHeader(loaded);

  elements.grid.replaceChildren();
  if (status === "ready") {
    renderCards();
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

function renderCards() {
  const fragment = document.createDocumentFragment();
  state.cards.forEach((card, index) => {
    fragment.append(createCardItem(card, index + 1));
  });
  fragment.append(elements.newTemplate.content.cloneNode(true));
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
