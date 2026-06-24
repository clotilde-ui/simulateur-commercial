// Espaces clients — entités persistées localement (localStorage). Chaque espace
// regroupe des rapports/simulations sous un nom de client.
export const SPACES_KEY = "sim-client-spaces";

export function loadSpaces() {
  try { return JSON.parse(localStorage.getItem(SPACES_KEY)) || []; } catch { return []; }
}

export function saveSpaces(list) {
  try { localStorage.setItem(SPACES_KEY, JSON.stringify(list)); } catch (_) {}
}

export function genSpaceId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
