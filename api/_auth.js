// Helper d'authentification (non routé) : session signée (HMAC) dans un cookie
// httpOnly. Pas de dépendance externe.
//
// Variable d'environnement requise : AUTH_SECRET (chaîne aléatoire longue).
// Compte admin de démarrage : ADMIN_EMAIL + ADMIN_PASSWORD.
import { createHmac, timingSafeEqual } from "crypto";

const SECRET = process.env.AUTH_SECRET || "";
const COOKIE = "sonate_session";

export function authConfigured() { return Boolean(SECRET); }

const b64u = (s) => Buffer.from(s).toString("base64url");
function sign(data) { return createHmac("sha256", SECRET).update(data).digest("base64url"); }

export function createSession(payload, days = 7) {
  const body = { ...payload, exp: Date.now() + days * 86400000 };
  const data = b64u(JSON.stringify(body));
  return `${data}.${sign(data)}`;
}

export function verifyToken(token) {
  if (!token || !SECRET) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = sign(data);
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  let body;
  try { body = JSON.parse(Buffer.from(data, "base64url").toString()); } catch { return null; }
  if (!body.exp || Date.now() > body.exp) return null;
  return body;
}

function cookieFromReq(req) {
  const c = req.headers.cookie || "";
  const part = c.split(/;\s*/).find((x) => x.startsWith(COOKIE + "="));
  return part ? decodeURIComponent(part.slice(COOKIE.length + 1)) : null;
}

export function getUser(req) { return verifyToken(cookieFromReq(req)); }

export function sessionCookie(token, days = 7) {
  return `${COOKIE}=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${days * 86400}`;
}
export function clearCookie() {
  return `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

export function requireAdmin(req, res) {
  const u = getUser(req);
  if (!u) { res.status(401).json({ error: "Non authentifié." }); return null; }
  if (u.role !== "Admin") { res.status(403).json({ error: "Accès réservé aux administrateurs." }); return null; }
  return u;
}

// Mitigation CSRF simple : exiger un en-tête custom (impossible en cross-site
// sans pré-vol CORS, que l'on n'autorise pas).
export function csrfOk(req) {
  return (req.headers["x-requested-with"] || "") === "fetch";
}
