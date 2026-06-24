// POST /api/report-visit — enregistre/maj une visite d'un rapport (à l'ouverture
// d'un lien partagé). Public. La durée est conservée au maximum observé.
import { kvGet, kvSet, kvConfigured } from "./_kv.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée." });
  if (!kvConfigured()) return res.status(200).json({ ok: false, skipped: true });

  const { linkId, visitId, duration } = req.body || {};
  if (!linkId || !visitId) return res.status(400).json({ error: "linkId et visitId requis." });

  const rec = await kvGet(`report:${linkId}`);
  if (!rec) return res.status(404).json({ error: "Rapport introuvable." });

  rec.visits = rec.visits || {};
  const v = rec.visits[visitId] || { ts: new Date().toISOString(), duration: 0 };
  v.duration = Math.max(v.duration || 0, Number(duration) || 0);
  rec.visits[visitId] = v;

  await kvSet(`report:${linkId}`, rec);
  return res.status(200).json({ ok: true });
}
