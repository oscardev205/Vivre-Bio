// src/lib/email.ts
// Mise à jour : formaterLignes() génère maintenant des lignes de tableau HTML (<tr><td>)
// pour s'insérer proprement dans le <tbody> des templates EmailJS.

import emailjs from "@emailjs/nodejs";

emailjs.init({
  publicKey: process.env.EMAILJS_PUBLIC_KEY!,
  privateKey: process.env.EMAILJS_PRIVATE_KEY!,
});

type LigneCommande = { nom: string; quantite: number; prixUnitaire: number };

type InfosCommande = {
  numero: string;
  total: number;
  lignes: LigneCommande[];
};

// Génère les lignes du tableau HTML (une <tr> par article commandé)
function formaterLignes(lignes: LigneCommande[]): string {
  return lignes
    .map(
      (l) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${l.nom} × ${l.quantite}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${(l.prixUnitaire * l.quantite).toLocaleString("fr-FR")} FCFA</td>
        </tr>`
    )
    .join("");
}

export async function envoyerEmailConfirmationCommande(
  params: InfosCommande & { destinataire: string }
) {
  const { destinataire, numero, total, lignes } = params;

  try {
    await emailjs.send(process.env.EMAILJS_SERVICE_ID!, process.env.EMAILJS_TEMPLATE_ID_CLIENT!, {
      to_email: destinataire,
      numero,
      total: `${total.toLocaleString("fr-FR")} FCFA`,
      lignes: formaterLignes(lignes),
    });
  } catch (error) {
    console.error("Erreur d'envoi d'e-mail (confirmation client) :", error);
  }
}

export async function envoyerEmailNotificationAdmin(
  params: InfosCommande & {
    clientNom: string;
    clientTelephone: string;
    clientEmail: string;
    adresseLivraison: string;
  }
) {
  const { numero, total, lignes, clientNom, clientTelephone, clientEmail, adresseLivraison } = params;

  try {
    await emailjs.send(process.env.EMAILJS_SERVICE_ID!, process.env.EMAILJS_TEMPLATE_ID_ADMIN!, {
      numero,
      total: `${total.toLocaleString("fr-FR")} FCFA`,
      lignes: formaterLignes(lignes),
      client_nom: clientNom,
      client_telephone: clientTelephone,
      client_email: clientEmail,
      adresse_livraison: adresseLivraison,
    });
  } catch (error) {
    console.error("Erreur d'envoi d'e-mail (notification admin) :", error);
  }
}