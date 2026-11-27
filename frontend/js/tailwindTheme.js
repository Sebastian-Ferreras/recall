// El CDN de Tailwind solo compila bloques en linea, no archivos css. Este script crea el bloque y debe cargarse antes que el CDN
const style = document.createElement("style");
style.type = "text/tailwindcss";
style.textContent = `
  @custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));

  @theme inline {
    --color-canvas: var(--canvas);
    --color-surface: var(--surface);
    --color-sunken: var(--sunken);
    --color-line: var(--line);
    --color-line-strong: var(--line-strong);
    --color-content: var(--content);
    --color-content-muted: var(--content-muted);
    --color-primary: var(--primary);
    --color-primary-hover: var(--primary-hover);
    --color-on-primary: var(--on-primary);
    --color-accent: var(--accent);
    --color-accent-text: var(--accent-text);
    --color-accent-soft: var(--accent-soft);
    --color-success: var(--success);
    --color-success-text: var(--success-text);
    --color-success-soft: var(--success-soft);
    --color-danger: var(--danger);
    --color-on-danger: var(--on-danger);
    --color-danger-soft: var(--danger-soft);
    --color-ring: var(--ring);
    --font-display: Georgia, "Times New Roman", serif;
  }
`;
document.head.append(style);
