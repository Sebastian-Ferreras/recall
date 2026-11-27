import { ApiError, getDeck, getStudyCards } from "/js/api.js";
import { plural, readDeckId } from "/js/ui.js";

const state = {
  status: "loading",
  deckId: null,
  deck: null,
  queue: [],
  errorMessage: "",
};

const elements = {};

export function initStudyPage() {
  const ids = [
    "title", "summary", "exit", "missing", "content", "strip", "error", "error-text",
    "retry", "loading", "empty", "empty-add", "session", "result",
  ];
  for (const id of ids) {
    elements[id] = document.getElementById(id);
  }

  state.deckId = readDeckId();
  if (state.deckId !== null) {
    const deckUrl = `/deck.html?id=${state.deckId}`;
    elements.exit.href = deckUrl;
    elements["empty-add"].href = deckUrl;
  }

  elements.retry.addEventListener("click", () => loadStudy());
  loadStudy();
}

async function loadStudy() {
  if (state.deckId === null) {
    state.status = "missing";
    render();
    return;
  }

  state.status = "loading";
  render();

  try {
    const [deck, cards] = await Promise.all([getDeck(state.deckId), getStudyCards(state.deckId)]);
    state.deck = deck;
    state.queue = cards;
    state.status = cards.length === 0 ? "empty" : "session";
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
  const { status, deck, queue } = state;
  const loaded = status === "session" || status === "empty";

  elements.missing.hidden = status !== "missing";
  elements.content.hidden = status === "missing";
  elements.loading.hidden = status !== "loading";
  elements.error.hidden = status !== "error";
  elements.empty.hidden = status !== "empty";
  elements.session.hidden = status !== "session";
  elements.result.hidden = status !== "result";
  elements["error-text"].textContent = `No se pudieron cargar las tarjetas del repaso: ${state.errorMessage}`;
  elements.exit.classList.toggle("invisible", status === "missing");

  if (loaded) {
    elements.title.textContent = deck.name;
    elements.title.title = deck.name;
    document.title = `Recall - Repaso de ${deck.name}`;
  } else {
    elements.title.textContent = status === "missing" ? "Mazo no encontrado" : " ";
    elements.title.removeAttribute("title");
    document.title = status === "missing" ? "Recall - Mazo no encontrado" : "Recall - Repaso";
  }

  if (status === "session") {
    elements.summary.textContent = `${plural(queue.length, "tarjeta", "tarjetas")} para repasar`;
  } else if (status === "empty") {
    elements.summary.textContent = "Sin tarjetas para repasar";
  } else if (status === "missing") {
    elements.summary.textContent = "No existe un mazo con ese identificador";
  } else {
    elements.summary.textContent = " ";
  }
}
