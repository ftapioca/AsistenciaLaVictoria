export function waitNextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}
