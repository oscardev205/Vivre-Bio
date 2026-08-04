// src/lib/honeypot.ts
// Vérifie qu'un champ honeypot est bien resté vide — sinon la requête vient
// très probablement d'un robot.

export function estUnBot(body: Record<string, unknown>): boolean {
  return !!body.site_web && String(body.site_web).trim() !== "";
}