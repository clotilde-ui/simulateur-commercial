// /api/admin/reports — rapports enregistrés (admin uniquement).
//   GET    → liste (agrégats vues / temps / dernière consultation)
//   PATCH  → déplacer { id, espace }
//   DELETE → supprimer ?id=
import { kvGet, kvSet, kvDel, kvSRem, kvSMembers, kvConfigured } from "../_kv.js";
import { requireAdmin, csrfOk } from "../_auth.js";

export default async function handler(req, res) {
  const admin = requireAdmin(req, res);
  if (!admin) return;
  if (!kvConfigured()) return res.status(500).json({ error: "Store non configuré (KV)." });

  if (req.method === "GET") {
    const ids = await kvSMembers("reports:index");
    const reports = (await Promise.all(ids.map((id) => kvGet(`report:${id}`))))
      .filter(Boolean)
      .map((r) => {
        const visits = Object.values(r.visits || {});
        const last = visits.length ? visits.reduce((a, b) => (new Date(b.ts) > new Date(a.ts) ? b : a)) : null;
        return {
          id: r.id, prospect: r.label || "Sans nom", website: r.website || "", espace: r.espace || "—",
          vues: visits.length, temps: visits.reduce((s, v) => s + (v.duration || 0), 0),
          derniere: last ? last.ts : null, creation: r.createdAt, state: r.state || null,
        };
      });
    return res.status(200).json({ reports });
  }

  if (!csrfOk(req)) return res.status(403).json({ error: "Requête refusée." });

  if (req.method === "PATCH") {
    const { id, espace } = req.body || {};
    const r = await kvGet(`report:${id}`);
    if (!r) return res.status(404).json({ error: "Rapport introuvable." });
    r.espace = espace || "—";
    await kvSet(`report:${id}`, r);
    return res.status(200).json({ ok: true });
  }

  if (req.method === "DELETE") {
    const id = req.query?.id;
    if (!id) return res.status(400).json({ error: "id requis." });
    await kvDel(`report:${id}`);
    await kvSRem("reports:index", id);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Méthode non autorisée." });
}
