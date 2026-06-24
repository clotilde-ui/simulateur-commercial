// /api/admin/invites — liste/suppression des invitations (admin uniquement).
//   GET    → liste des invitations (avec statut calculé)
//   DELETE → supprimer ?token=
import { kvGet, kvDel, kvSRem, kvSMembers, kvConfigured } from "../_kv.js";
import { requireAdmin, csrfOk } from "../_auth.js";

export default async function handler(req, res) {
  const admin = requireAdmin(req, res);
  if (!admin) return;
  if (!kvConfigured()) return res.status(500).json({ error: "Store non configuré (KV)." });

  if (req.method === "GET") {
    const tokens = await kvSMembers("invites:index");
    const invites = (await Promise.all(tokens.map(async (t) => {
      const i = await kvGet(`invite:${t}`);
      return i ? { ...i, token: t } : null;
    })))
      .filter(Boolean)
      .map((i) => {
        const expired = i.expiresAt && Date.now() > new Date(i.expiresAt).getTime();
        return {
          token: i.token, email: i.email, espace: i.espace || "", role: i.role || "Lecteur",
          sentAt: i.sentAt, expiresAt: i.expiresAt, activatedAt: i.activatedAt || null,
          status: i.activatedAt ? "activated" : expired ? "expired" : "pending",
        };
      })
      .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
    return res.status(200).json({ invites });
  }

  if (!csrfOk(req)) return res.status(403).json({ error: "Requête refusée." });

  if (req.method === "DELETE") {
    const token = req.query?.token;
    if (!token) return res.status(400).json({ error: "Token requis." });
    await kvDel(`invite:${token}`);
    await kvSRem("invites:index", token);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Méthode non autorisée." });
}
