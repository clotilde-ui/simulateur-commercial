// Fonction serverless Vercel : envoie une invitation par email via Brevo.
// La clé API Brevo n'est JAMAIS exposée au navigateur — elle est lue ici
// depuis les variables d'environnement Vercel.
//
// Variables d'environnement à définir dans Vercel (Settings → Environment Variables) :
//   BREVO_API_KEY      – clé API Brevo (v3)
//   BREVO_SENDER_EMAIL – email expéditeur (doit être un expéditeur vérifié dans Brevo)
//   BREVO_SENDER_NAME  – nom expéditeur (optionnel, défaut « Sonate »)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée." });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "Sonate";
  if (!apiKey || !senderEmail) {
    return res.status(500).json({ error: "Brevo non configuré (BREVO_API_KEY / BREVO_SENDER_EMAIL manquants côté serveur)." });
  }

  const { email, espace, role, link } = req.body || {};
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: "Adresse email invalide." });
  }

  const espaceTxt = espace ? ` à l'espace « ${espace} »` : "";
  const roleTxt = role ? ` (rôle : ${role})` : "";
  const url = typeof link === "string" ? link : "";
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#1e3328;line-height:1.5">
      <h2 style="color:#1a2e25;margin:0 0 12px">Invitation Sonate</h2>
      <p>Bonjour,</p>
      <p>Vous êtes invité${espaceTxt}${roleTxt} sur le simulateur commercial Sonate.</p>
      ${url ? `<p style="margin:20px 0"><a href="${url}" style="background:#e8571a;color:#fff;padding:11px 20px;border-radius:6px;text-decoration:none;font-weight:700">Accéder au simulateur</a></p><p style="font-size:13px;color:#4a6a5a">Ou copiez ce lien : ${url}</p>` : ""}
      <p style="margin-top:24px;color:#4a6a5a">— L'équipe Sonate</p>
    </div>`;

  try {
    const r = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: senderName },
        to: [{ email }],
        subject: `Invitation${espaceTxt} — Sonate`,
        htmlContent: html,
      }),
    });

    if (!r.ok) {
      const detail = await r.text().catch(() => "");
      return res.status(502).json({ error: `Erreur Brevo (${r.status}). ${detail}`.trim() });
    }

    const data = await r.json().catch(() => ({}));
    return res.status(200).json({ ok: true, messageId: data.messageId ?? null });
  } catch (e) {
    return res.status(500).json({ error: `Échec de l'envoi : ${String(e)}` });
  }
}
