export function plural(count, one, many) {
  return `${count} ${count === 1 ? one : many}`;
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString("es", { day: "numeric", month: "short" });
}
