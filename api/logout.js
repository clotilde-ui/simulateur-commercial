// POST /api/logout — efface le cookie de session.
import { clearCookie } from "./_auth.js";

export default function handler(req, res) {
  res.setHeader("Set-Cookie", clearCookie());
  return res.status(200).json({ ok: true });
}
