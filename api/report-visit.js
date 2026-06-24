// POST /api/report-visit — enregistre/maj une visite d'un rapport (à l'ouverture
// d'un lien partagé). Public. La durée est conservée au maximum observé.
import { setReportVisit, dbConfigured } from "./_db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée." });
  if (!dbConfigured()) return res.status(200).json({ ok: false, skipped: true });

  const { linkId, visitId, duration } = req.body || {};
  if (!linkId || !visitId) return res.status(400).json({ error: "linkId et visitId requis." });

  try {
    const ok = await setReportVisit(linkId, visitId, duration);
    if (!ok) return res.status(404).json({ error: "Rapport introuvable." });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
  return res.status(200).json({ ok: true });
}
