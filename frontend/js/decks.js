import { getDecks } from "/js/api.js";
import { formatDate, plural } from "/js/ui.js";

// con 20 o mas tarjetas se dibuja la segunda carta detras, el mazo se ve mas grueso
const THICK_DECK = 20;

const state = {
  status: "loading",
  decks: [],
  errorMessage: "",
  query: "",
  sort: "recent",
};

const elements = {};

const sorters = {
  recent: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  name: (a, b) => a.name.localeCompare(b.name, "es"),
  cards: (a, b) => b.cardCount - a.cardCount,
};

export function initDecksPage() {
  const ids = [
    "summary", "new-deck", "toolbar", "search", "sort", "error", "error-text", "retry",
    "loading", "empty", "empty-new", "no-results", "no-results-q", "clear-search", "grid",
  ];
  for (const id of ids) {
    elements[id] = document.getElementById(id);
  }
  elements.deckTemplate = document.getElementById("deck-card");
  elements.newTemplate = document.getElementById("new-deck-card");

  elements.retry.addEventListener("click", loadDecks);
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
  loadDecks();
}

// NFD separa la tilde de la letra y el rango quita las marcas, asi "anatomia" encuentra "Anatomia" con o sin tilde
function normalize(text) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function filterDecks(decks, query) {
  const needle = normalize(query.trim());
  if (!needle) {
    return decks;
  }
  return decks.filter((deck) => normalize(`${deck.name} ${deck.description ?? ""}`).includes(needle));
}

function visibleDecks() {
  return filterDecks(state.decks, state.query).toSorted(sorters[state.sort]);
}

async function loadDecks() {
  state.status = "loading";
  render();

  try {
    state.decks = await getDecks();
    state.status = state.decks.length === 0 ? "empty" : "ready";
  } catch (error) {
    state.errorMessage = error.message;
    state.status = "error";
  }
  render();
}

function render() {
  const { status } = state;
  const ready = status === "ready";
  const decks = ready ? visibleDecks() : [];
  const searching = state.query.trim() !== "";

  elements.loading.hidden = status !== "loading";
  elements.error.hidden = status !== "error";
  elements.empty.hidden = status !== "empty";
  elements["new-deck"].hidden = !ready;
  elements.toolbar.hidden = !ready;
  elements["no-results"].hidden = !(ready && decks.length === 0);
  elements["no-results-q"].textContent = state.query.trim();
  elements["error-text"].textContent = `No se pudieron cargar los mazos: ${state.errorMessage}`;
  elements.summary.textContent = ready && decks.length > 0 ? summarize(decks) : " ";

  elements.grid.replaceChildren();
  if (decks.length > 0) {
    renderDecks(decks, !searching);
  }
}

function summarize(decks) {
  const totalCards = decks.reduce((sum, deck) => sum + deck.cardCount, 0);
  return `${plural(decks.length, "mazo", "mazos")} · ${plural(totalCards, "tarjeta", "tarjetas")}`;
}

function renderDecks(decks, withNewCard) {
  const fragment = document.createDocumentFragment();
  for (const deck of decks) {
    fragment.append(createDeckCard(deck));
  }
  if (withNewCard) {
    fragment.append(elements.newTemplate.content.cloneNode(true));
  }
  elements.grid.append(fragment);
}

function createDeckCard(deck) {
  const node = elements.deckTemplate.content.cloneNode(true);
  const cards = plural(deck.cardCount, "tarjeta", "tarjetas");

  const link = node.querySelector("[data-link]");
  link.href = `/deck.html?id=${deck.id}`;
  link.setAttribute("aria-label", `${deck.name}, ${cards}`);

  for (const initial of node.querySelectorAll("[data-initial]")) {
    initial.textContent = deck.name.trim().charAt(0).toUpperCase();
  }
  node.querySelector("[data-name]").textContent = deck.name;

  const description = node.querySelector("[data-desc]");
  description.textContent = deck.description || "Sin descripcion";
  description.classList.toggle("italic", !deck.description);

  node.querySelector("[data-count]").textContent = cards;
  node.querySelector("[data-date]").textContent = `Creado el ${formatDate(deck.createdAt)}`;

  if (deck.cardCount === 0) {
    node.querySelector("[data-layer1]").remove();
  }
  if (deck.cardCount < THICK_DECK) {
    node.querySelector("[data-layer2]").remove();
  }

  const study = node.querySelector("[data-study]");
  if (deck.cardCount === 0) {
    study.removeAttribute("href");
    study.setAttribute("aria-disabled", "true");
    study.tabIndex = -1;
    study.title = "Agrega tarjetas para poder estudiar";
    study.classList.add("pointer-events-none", "opacity-50");
  } else {
    study.href = `/study.html?id=${deck.id}`;
  }

  node.querySelector("[data-edit]").setAttribute("aria-label", `Editar ${deck.name}`);
  node.querySelector("[data-delete]").setAttribute("aria-label", `Borrar ${deck.name}`);

  return node;
}
