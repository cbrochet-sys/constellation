// Protège tout le portail par un mot de passe d'équipe (variable APP_PASSWORD sur Vercel).
import { next } from "@vercel/functions";

export const config = { matcher: "/:path*" };

export default function middleware(request) {
  // Tri automatique des mails : la tâche planifiée Vercel s'authentifie avec CRON_SECRET (vérifié aussi dans api/mail-cron.js).
  if (new URL(request.url).pathname === "/api/mail-cron") {
    const cron = process.env.CRON_SECRET;
    if (cron && request.headers.get("authorization") === "Bearer " + cron) return next();
  }
  const expected = process.env.APP_PASSWORD;
  if (!expected) return new Response("APP_PASSWORD non configuré sur Vercel.", { status: 503 });
  const auth = request.headers.get("authorization") || "";
  const [scheme, encoded] = auth.split(" ");
  if (scheme === "Basic" && encoded) {
    let pwd = "";
    try { pwd = atob(encoded).split(":").slice(1).join(":"); } catch {}
    if (pwd === expected) return next(); // laisse passer
  }
  return new Response("Accès réservé à l'équipe Stella.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Stella portail", charset="UTF-8"' },
  });
}
