// /api/admin/spaces — espaces clients (admin uniquement).
//   GET    → liste
//   POST   → créer { name }
//   PATCH  → maj { id, name?, members? }
//   DELETE → supprimer ?id=
import { kvGet, kvSet, kvDel, kvSAdd, kvSRem, kvSMembers, kvConfigured } from "../_kv.js";
import { requireAdmin, csrfOk } from "../_auth.js";

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

export default async function handler(req, res) {
  const admin = requireAdmin(req, res);
  if (!admin) return;
  if (!kvConfigured()) return res.status(500).json({ error: "Store non configuré (KV)." });

  if (req.method === "GET") {
    const ids = await kvSMembers("spaces:index");
    const spaces = (await Promise.all(ids.map((id) => kvGet(`space:${id}`))))
      .filter(Boolean)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.status(200).json({ spaces });
  }

  if (!csrfOk(req)) return res.status(403).json({ error: "Requête refusée." });

  if (req.method === "POST") {
    const name = (req.body?.name || "").trim();
    if (!name) return res.status(400).json({ error: "Nom requis." });
    const id = genId();
    const space = { id, name, createdAt: new Date().toISOString(), role: "Propriétaire", members: [] };
    await kvSet(`space:${id}`, space);
    await kvSAdd("spaces:index", id);
    return res.status(200).json({ ok: true, space });
  }

  if (req.method === "PATCH") {
    const { id, name, members } = req.body || {};
    const s = await kvGet(`space:${id}`);
    if (!s) return res.status(404).json({ error: "Espace introuvable." });
    if (typeof name === "string" && name.trim()) s.name = name.trim();
    if (Array.isArray(members)) s.members = members;
    await kvSet(`space:${id}`, s);
    return res.status(200).json({ ok: true, space: s });
  }

  if (req.method === "DELETE") {
    const id = req.query?.id;
    if (!id) return res.status(400).json({ error: "id requis." });
    await kvDel(`space:${id}`);
    await kvSRem("spaces:index", id);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Méthode non autorisée." });
}
