export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  // Honeypot
  if (req.body.company) {
    return res.status(200).json({ ok: true });
  }

  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "Campos incompletos" });
  }

  // Aquí envías el email (SendGrid, Resend, SMTP, etc.)
  // Ejemplo conceptual:
  // await sendEmail({ to: "localstore@mail.com", ... })

  return res.status(200).json({ ok: true });
}
