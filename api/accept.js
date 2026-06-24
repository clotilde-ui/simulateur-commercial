// POST /api/accept — le destinataire active son invitation : création du compte
// (mot de passe haché) et passage de l'invitation à « activé ».
import { getInvite, setInviteActivated, getUserRaw, createUser, dbConfigured, hashPassword } from "./_db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée." });
  if (!dbConfigured()) return res.status(500).json({ error: "Backend non configuré (base Turso manquante)." });

  const { token, name, password } = req.body || {};
  if (!token) return res.status(400).json({ error: "Token requis." });
  if (!password || String(password).length < 8) return res.status(400).json({ error: "Mot de passe d'au moins 8 caractères requis." });

  let inv;
  try { inv = await getInvite(token); }
  catch (e) { return res.status(500).json({ error: String(e) }); }

  if (!inv) return res.status(404).json({ error: "Invitation introuvable ou expirée." });
  if (inv.activatedAt) return res.status(409).json({ error: "Cette invitation a déjà été activée." });
  if (inv.expiresAt && Date.now() > new Date(inv.expiresAt).getTime()) return res.status(410).json({ error: "Cette invitation a expiré." });

  if (await getUserRaw(inv.email)) return res.status(409).json({ error: "Un compte existe déjà pour cet email." });

  const user = {
    name: (name || "").trim() || inv.email.split("@")[0],
    email: inv.email, role: inv.role || "Lecteur", espace: inv.espace || "",
    passwordHash: hashPassword(String(password)), createdAt: new Date().toISOString(),
  };

  try {
    await createUser(user);
    await setInviteActivated(token, new Date().toISOString());
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }

  return res.status(200).json({ ok: true, name: user.name, email: user.email, espace: user.espace });
}
