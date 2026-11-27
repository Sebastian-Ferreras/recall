import { ApiError, getDeck, getStudyCards } from "/js/api.js";
import { plural, readDeckId } from "/js/ui.js";

const FLIP_MS = 450;

const state = {
  status: "loading",
  deckId: null,
  deck: null,
  queue: [],
  results: [],
  index: 0,
  flipped: false,
  busy: false,
  errorMessage: "",
};

const elements = {};

export function initStudyPage() {
  const ids = [
    "title", "summary", "exit", "missing", "content", "strip", "error", "error-text",
    "retry", "loading", "empty", "empty-add", "session", "result", "layer1", "layer2", "card",
    "face-front", "face-back", "question", "answer", "hint", "miss", "hit",
    "result-pct", "result-text", "result-hit", "result-miss", "again-missed", "again-missed-text",
    "again-all", "back-deck", "missed-wrap", "missed-list",
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
    elements["back-deck"].href = deckUrl;
  }

  elements.retry.addEventListener("click", () => loadStudy());
  elements.card.addEventListener("click", flip);
  elements.hit.addEventListener("click", () => grade(true));
  elements.miss.addEventListener("click", () => grade(false));
  elements["again-missed"].addEventListener("click", repeatMissed);
  elements["again-all"].addEventListener("click", repeatAll);
  document.addEventListener("keydown", onKeydown);
  loadStudy();
}

function start(cards) {
  state.queue = cards;
  state.results = cards.map(() => null);
  state.index = 0;
  state.flipped = false;
  state.busy = false;

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

function paintSegment(i) {
  const segment = elements.strip.children[i];
  if (!segment) {
    return;
  }
  const result = state.results[i];
  segment.classList.remove("bg-success", "bg-danger", "bg-accent", "bg-sunken");
  segment.classList.add(result === true ? "bg-success" : result === false ? "bg-danger" : i === state.index ? "bg-accent" : "bg-sunken");
}

function updateStrip() {
  elements.strip.setAttribute("aria-valuenow", String(Math.min(state.index, state.results.length)));
  paintSegment(state.index - 1);
  paintSegment(state.index);
}

function flip() {
  if (state.busy || state.status !== "session") {
    return;
  }
  state.flipped = !state.flipped;
  renderFlip();
}

function grade(known) {
  if (state.busy || !state.flipped || state.status !== "session") {
    return;
  }
  state.busy = true;
  state.results[state.index] = known;
  state.flipped = false;
  renderFlip();
  paintSegment(state.index);

  // la espera deja terminar el giro de vuelta antes de cambiar el texto de la ficha
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    advance();
  } else {
    setTimeout(advance, FLIP_MS);
  }
}

function advance() {
  state.index += 1;
  state.busy = false;
  if (state.index >= state.queue.length) {
    state.status = "result";
  }
  updateStrip();
  render();
  if (state.status === "session") {
    focusCard();
  }
}

function focusCard() {
  elements.card.focus({ preventScroll: true });
}

// las falladas se filtran de la sesion actual, sin volver a pedir nada a la API
function repeatMissed() {
  start(state.queue.filter((card, i) => state.results[i] === false));
  state.status = "session";
  render();
  focusCard();
}

// se vuelve a pedir el repaso para recibir un orden nuevo del servidor
async function repeatAll() {
  await loadStudy();
  if (state.status === "session") {
    focusCard();
  }
}

function onKeydown(event) {
  if (event.ctrlKey || event.metaKey || event.altKey || event.repeat || state.status !== "session") {
    return;
  }
  if (event.key === "1") {
    grade(false);
  } else if (event.key === "2") {
    grade(true);
  } else if (event.key === " " && document.activeElement === document.body) {
    event.preventDefault();
    flip();
  }
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

function renderResult(known, missed) {
  const total = state.queue.length;
  elements["result-pct"].textContent = `${Math.round((known / total) * 100)} %`;
  elements["result-text"].textContent =
    `Sabias ${known} de ${plural(total, "tarjeta", "tarjetas")}${missed === 0 ? ". ¡Repaso perfecto!" : "."}`;
  elements["result-hit"].textContent = String(known);
  elements["result-miss"].textContent = String(missed);
  elements["again-missed"].hidden = missed === 0;
  elements["again-missed-text"].textContent = `Repasar las ${plural(missed, "fallada", "falladas")}`;
  elements["missed-wrap"].hidden = missed === 0;

  const items = [];
  state.queue.forEach((card, i) => {
    if (state.results[i] !== false) {
      return;
    }
    const item = document.createElement("li");
    item.className = "p-4";
    const question = document.createElement("p");
    question.className = "font-medium";
    question.textContent = card.question;
    const answer = document.createElement("p");
    answer.className = "text-sm text-content-muted";
    answer.textContent = card.answer;
    item.append(question, answer);
    items.push(item);
  });
  elements["missed-list"].replaceChildren(...items);
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
  const loaded = status === "session" || status === "empty" || status === "result";
  const known = state.results.filter((result) => result === true).length;
  const missed = state.results.filter((result) => result === false).length;

  elements.missing.hidden = status !== "missing";
  elements.content.hidden = status === "missing";
  elements.loading.hidden = status !== "loading";
  elements.error.hidden = status !== "error";
  elements.empty.hidden = status !== "empty";
  elements.session.hidden = status !== "session";
  elements.result.hidden = status !== "result";
  elements["error-text"].textContent = `No se pudieron cargar las tarjetas del repaso: ${state.errorMessage}`;
  elements.exit.classList.toggle("invisible", status === "missing");

  // al repetir, el mazo ya esta cargado: se conserva el titulo durante la carga y el error
  if (loaded || (deck !== null && status !== "missing")) {
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
    elements.summary.textContent =
      `Tarjeta ${state.index + 1} de ${queue.length} · ${plural(known, "sabida", "sabidas")} · ${missed} por repasar`;
    renderCard();
  } else if (status === "result") {
    elements.summary.textContent = "Resultado del repaso";
    renderResult(known, missed);
  } else if (status === "empty") {
    elements.summary.textContent = "Sin tarjetas para repasar";
  } else if (status === "missing") {
    elements.summary.textContent = "No existe un mazo con ese identificador";
  } else {
    elements.summary.textContent = " ";
  }
}
