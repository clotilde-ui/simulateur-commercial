// GET /api/me — utilisateur de la session courante.
import { getUser } from "./_auth.js";

export default function handler(req, res) {
  const u = getUser(req);
  if (!u) return res.status(401).json({ error: "Non authentifié." });
  return res.status(200).json({ email: u.email, name: u.name, role: u.role });
}
