// src/lib/validation.ts
// Fichier complet : le mot de passe doit désormais faire au moins 8 caractères
// et contenir au moins une lettre et un chiffre (au lieu de juste 6 caractères
// sans autre exigence). Le schéma est exporté séparément pour être réutilisé
// aussi bien à l'inscription qu'au changement de mot de passe.

import { z } from "zod";

export const motDePasseSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .regex(/[A-Za-z]/, "Le mot de passe doit contenir au moins une lettre")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre");

export const inscriptionSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("E-mail invalide"),
  telephone: z.string().min(8, "Numéro de téléphone invalide"),
  password: motDePasseSchema,
});

export type InscriptionInput = z.infer<typeof inscriptionSchema>;