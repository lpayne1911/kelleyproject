// Central color tokens — mirrors the CSS custom properties in index.css.
// Brand colors are hex (passed as props / used in inline styles).
// Tone colors reference the CSS vars (used only inside the app DOM, which is in :root scope).
// Keep these in sync with the :root block in src/index.css.
export const BRAND = {
  green: '#2F8C5A', // buyer app
  navy: '#16263F', // advocate console
}

export const TONE = {
  red: 'var(--red)',
  orange: 'var(--orange)',
  green: 'var(--green)',
  yellow: 'var(--yellow)',
}
