// /api/admin/users — gestion des comptes (admin uniquement).
//   GET    → liste des comptes
//   POST   → créer un compte { name?, email, password, role? }
//   PATCH  → changer le rôle { email, role }
//   DELETE → supprimer ?email=
import { kvGet, kvSet, kvDel, kvSAdd, kvSRem, kvSMembers, hashPassword, kvConfigured } from "../_kv.js";
import { requireAdmin, csrfOk } from "../_auth.js";

export default async function handler(req, res) {
  const admin = requireAdmin(req, res);
  if (!admin) return;
  if (!kvConfigured()) return res.status(500).json({ error: "Store non configuré (KV)." });

  if (req.method === "GET") {
    const emails = await kvSMembers("users:index");
    const users = (await Promise.all(emails.map((e) => kvGet(`user:${e}`))))
      .filter(Boolean)
      .map((u) => ({ name: u.name, email: u.email, role: u.role, espace: u.espace || "", createdAt: u.createdAt }));
    return res.status(200).json({ users });
  }

  if (!csrfOk(req)) return res.status(403).json({ error: "Requête refusée." });

  if (req.method === "POST") {
    const { name, email, password, role } = req.body || {};
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: "Email invalide." });
    if (!password || String(password).length < 8) return res.status(400).json({ error: "Mot de passe d'au moins 8 caractères." });
    if (await kvGet(`user:${email}`)) return res.status(409).json({ error: "Un compte existe déjà pour cet email." });
    const user = {
      name: (name || "").trim() || email.split("@")[0],
      email, role: role || "Utilisateur", espace: "",
      passwordHash: hashPassword(String(password)), createdAt: new Date().toISOString(),
    };
    await kvSet(`user:${email}`, user);
    await kvSAdd("users:index", email);
    return res.status(200).json({ ok: true });
  }

  if (req.method === "PATCH") {
    const { email, role } = req.body || {};
    const u = await kvGet(`user:${email}`);
    if (!u) return res.status(404).json({ error: "Compte introuvable." });
    u.role = role;
    await kvSet(`user:${email}`, u);
    return res.status(200).json({ ok: true });
  }

  if (req.method === "DELETE") {
    const email = req.query?.email;
    if (!email) return res.status(400).json({ error: "Email requis." });
    await kvDel(`user:${email}`);
    await kvSRem("users:index", email);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Méthode non autorisée." });
}
