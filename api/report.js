// POST /api/report — upsert d'un rapport (créé par le simulateur à la génération
// d'un lien). Public : pas d'authentification (le linkId fait office de clé).
import { upsertReportMeta, dbConfigured } from "./_db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée." });
  if (!dbConfigured()) return res.status(200).json({ ok: false, skipped: true });

  const { linkId, label, website, espace, state } = req.body || {};
  if (!linkId) return res.status(400).json({ error: "linkId requis." });

  try {
    await upsertReportMeta(linkId, { label, website, espace, state });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
  return res.status(200).json({ ok: true });
}
