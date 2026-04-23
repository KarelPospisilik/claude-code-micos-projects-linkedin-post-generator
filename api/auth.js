export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ ok: false, error: "Zadej email a heslo." });
  }

  const profileIds = ["michal", "petr", "pavel", "karel"];
  for (const profileId of profileIds) {
    const entry = process.env[`AUTH_${profileId}`];
    if (!entry) continue;
    const colonIdx = entry.indexOf(":");
    const envEmail = entry.slice(0, colonIdx).toLowerCase();
    const envPassword = entry.slice(colonIdx + 1);
    if (envEmail === email.trim().toLowerCase() && envPassword === password) {
      return res.status(200).json({ ok: true, profileId });
    }
  }

  return res.status(401).json({ ok: false, error: "Nesprávný email nebo heslo." });
}
