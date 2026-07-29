// src/lib/validation.ts
// Schémas de validation Zod réutilisés côté formulaire ET côté API.

import { z } from "zod";

export const inscriptionSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("E-mail invalide"),
  telephone: z.string().min(8, "Numéro de téléphone invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export type InscriptionInput = z.infer<typeof inscriptionSchema>;