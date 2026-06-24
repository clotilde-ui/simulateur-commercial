// Utilisateurs — comptes persistés localement (localStorage). Servent notamment
// à ajouter un membre existant à un espace client.
export const USERS_KEY = "sim-users";

export function loadUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch { return []; }
}

export function saveUsers(list) {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(list)); } catch (_) {}
}

export function genUserId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
