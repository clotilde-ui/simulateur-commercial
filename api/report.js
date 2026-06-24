// POST /api/report — upsert d'un rapport (créé par le simulateur à la génération
// d'un lien). Public : pas d'authentification (le linkId fait office de clé).
import { kvGet, kvSet, kvSAdd, kvConfigured } from "./_kv.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée." });
  if (!kvConfigured()) return res.status(200).json({ ok: false, skipped: true });

  const { linkId, label, website, espace, state } = req.body || {};
  if (!linkId) return res.status(400).json({ error: "linkId requis." });

  const existing = await kvGet(`report:${linkId}`);
  const rec = existing || { id: linkId, createdAt: new Date().toISOString(), visits: {} };
  rec.label = label || rec.label || "Sans nom";
  rec.website = website || rec.website || "";
  rec.espace = espace || rec.espace || "—";
  if (state) rec.state = state;

  await kvSet(`report:${linkId}`, rec);
  await kvSAdd("reports:index", linkId);
  return res.status(200).json({ ok: true });
}
