import { ApiError, getDeck, getStudyCards } from "/js/api.js";
import { plural, readDeckId } from "/js/ui.js";

const state = {
  status: "loading",
  deckId: null,
  deck: null,
  queue: [],
  results: [],
  index: 0,
  flipped: false,
  errorMessage: "",
};

const elements = {};

export function initStudyPage() {
  const ids = [
    "title", "summary", "exit", "missing", "content", "strip", "error", "error-text",
    "retry", "loading", "empty", "empty-add", "session", "result", "layer1", "layer2", "card",
    "face-front", "face-back", "question", "answer", "hint", "miss", "hit",
  ];
  for (const id of ids) {
    elements[id] = document.getElementById(id);
  }
  elements.positions = document.querySelectorAll(".pos");

  state.deckId = readDeckId();
  if (state.deckId !== null) {
    const deckUrl = `/deck.html?id=${state.deckId}`;
    elements.exit.href = deckUrl;
    elements["empty-add"].href = deckUrl;
  }

  elements.retry.addEventListener("click", () => loadStudy());
  elements.card.addEventListener("click", flip);
  loadStudy();
}

function start(cards) {
  state.queue = cards;
  state.results = cards.map(() => null);
  state.index = 0;
  state.flipped = false;

  elements.strip.replaceChildren(
    ...cards.map(() => {
      const segment = document.createElement("span");
      segment.className = "h-2 flex-1 rounded-full bg-sunken transition-colors";
      return segment;
    }),
  );
  elements.strip.setAttribute("aria-valuemax", String(cards.length));
  updateStrip();
}

function updateStrip() {
  const { results, index } = state;
  elements.strip.setAttribute("aria-valuenow", String(Math.min(index, results.length)));
  for (const i of [index - 1, index]) {
    const segment = elements.strip.children[i];
    if (!segment) {
      continue;
    }
    const result = results[i];
    segment.classList.remove("bg-success", "bg-danger", "bg-accent", "bg-sunken");
    segment.classList.add(result === true ? "bg-success" : result === false ? "bg-danger" : i === index ? "bg-accent" : "bg-sunken");
  }
}

function flip() {
  if (state.status !== "session") {
    return;
  }
  state.flipped = !state.flipped;
  renderFlip();
}

function renderFlip() {
  const { flipped } = state;
  elements.card.setAttribute("aria-pressed", String(flipped));
  elements["face-front"].setAttribute("aria-hidden", String(flipped));
  elements["face-back"].setAttribute("aria-hidden", String(!flipped));
  elements.hint.style.visibility = flipped ? "hidden" : "visible";
  elements.hit.disabled = !flipped;
  elements.miss.disabled = !flipped;
}

function renderCard() {
  const { queue, index } = state;
  const card = queue[index];
  elements.question.textContent = card.question;
  elements.answer.textContent = card.answer;
  for (const position of elements.positions) {
    position.textContent = String(index + 1);
  }
  const remaining = queue.length - index - 1;
  elements.layer1.hidden = remaining < 1;
  elements.layer2.hidden = remaining < 3;
  renderFlip();
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
    if (cards.length > 0) {
      start(cards);
    }
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

  elements.strip.classList.toggle("invisible", status !== "session" && status !== "result");

  if (status === "session") {
    const known = state.results.filter((result) => result === true).length;
    const missed = state.results.filter((result) => result === false).length;
    elements.summary.textContent =
      `Tarjeta ${state.index + 1} de ${queue.length} · ${plural(known, "sabida", "sabidas")} · ${missed} por repasar`;
    renderCard();
  } else if (status === "empty") {
    elements.summary.textContent = "Sin tarjetas para repasar";
  } else if (status === "missing") {
    elements.summary.textContent = "No existe un mazo con ese identificador";
  } else {
    elements.summary.textContent = " ";
  }
}
