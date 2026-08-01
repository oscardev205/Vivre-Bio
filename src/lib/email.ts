// src/lib/email.ts
// Fichier complet mis à jour : chaque notification a désormais un total lisible
// (" — " au lieu de vide) et une étiquette de type en tête de contenu, pour
// qu'on distingue immédiatement une commande d'un message ou d'une livraison.

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

// Bloc générique pour les notifications qui ne sont PAS des commandes
// (message, contact, livraison) — étiquette de type bien visible, une seule
// cellule pleine largeur, pas de confusion avec le tableau d'articles.
function blocNotification(type: string, contenu: string): string {
  return `
    <tr>
      <td style="padding: 10px;">
        <span style="display:inline-block; background:#EAF3DE; color:#2E7D32; font-size:11px; font-weight:600; padding:3px 10px; border-radius:12px; margin-bottom:8px;">
          ${type}
        </span>
        <div style="margin-top:8px; line-height:1.6;">${contenu}</div>
      </td>
    </tr>`;
}

export async function envoyerEmailConfirmationCommande(
  params: InfosCommande & { destinataire: string }
) {
  const { destinataire, numero, total, lignes } = params;
  try {
    const resultat = await emailjs.send(process.env.EMAILJS_SERVICE_ID!, process.env.EMAILJS_TEMPLATE_ID_CLIENT!, {
      to_email: destinataire,
      numero,
      total: `${total.toLocaleString("fr-FR")} FCFA`,
      lignes: formaterLignes(lignes),
    });
    console.log("[email] Confirmation client envoyée :", resultat.status, destinataire);
  } catch (error) {
    console.error("[email] Erreur d'envoi (confirmation client) :", error);
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

  if (!process.env.ADMIN_EMAIL) {
    console.error("[email] ADMIN_EMAIL n'est pas défini dans .env.");
    return;
  }

  try {
    const resultat = await emailjs.send(process.env.EMAILJS_SERVICE_ID!, process.env.EMAILJS_TEMPLATE_ID_ADMIN!, {
      to_email: process.env.ADMIN_EMAIL,
      numero,
      total: `${total.toLocaleString("fr-FR")} FCFA`,
      lignes: formaterLignes(lignes),
      client_nom: clientNom,
      client_telephone: clientTelephone,
      client_email: clientEmail,
      adresse_livraison: adresseLivraison,
    });
    console.log("[email] Notification admin envoyée :", resultat.status);
  } catch (error) {
    console.error("[email] Erreur d'envoi (notification admin) :", error);
  }
}

export async function envoyerMessageContact(params: { nom: string; email: string; message: string }) {
  const { nom, email, message } = params;

  if (!process.env.ADMIN_EMAIL) {
    console.error("[email] ADMIN_EMAIL n'est pas défini dans .env.");
    return;
  }

  try {
    const resultat = await emailjs.send(process.env.EMAILJS_SERVICE_ID!, process.env.EMAILJS_TEMPLATE_ID_ADMIN!, {
      to_email: process.env.ADMIN_EMAIL,
      numero: "Message de contact",
      total: "—",
      lignes: blocNotification(
        "FORMULAIRE DE CONTACT",
        `<strong>${nom}</strong> (${email}) écrit :<br><br>${message}`
      ),
      client_nom: nom,
      client_telephone: "—",
      client_email: email,
      adresse_livraison: "—",
    });
    console.log("[email] Message de contact envoyé :", resultat.status);
  } catch (error) {
    console.error("[email] Erreur d'envoi (contact) :", error);
  }
}

export async function envoyerNotificationLivraisonConfirmee(params: {
  numero: string;
  clientNom: string;
}) {
  const { numero, clientNom } = params;

  if (!process.env.ADMIN_EMAIL) {
    console.error("[email] ADMIN_EMAIL n'est pas défini dans .env.");
    return;
  }

  try {
    const resultat = await emailjs.send(process.env.EMAILJS_SERVICE_ID!, process.env.EMAILJS_TEMPLATE_ID_ADMIN!, {
      to_email: process.env.ADMIN_EMAIL,
      numero: `Commande ${numero}`,
      total: "—",
      lignes: blocNotification(
        "LIVRAISON CONFIRMÉE",
        `<strong>${clientNom}</strong> confirme avoir bien reçu sa commande <strong>${numero}</strong>.`
      ),
      client_nom: clientNom,
      client_telephone: "—",
      client_email: "—",
      adresse_livraison: "Voir le détail dans le back-office.",
    });
    console.log("[email] Notification livraison confirmée envoyée :", resultat.status);
  } catch (error) {
    console.error("[email] Erreur d'envoi (livraison confirmée) :", error);
  }
}

export async function envoyerNotificationNouveauMessage(params: {
  destinataire: string;
  numero: string;
  expediteur: string;
  apercu: string;
}) {
  const { destinataire, numero, expediteur, apercu } = params;
  const apercuCourt = apercu.length > 150 ? apercu.slice(0, 150) + "..." : apercu;

  // Détermine quel template utiliser selon qu'on notifie l'admin (adresse fixe)
  // ou le client (adresse dynamique) — les deux templates savent gérer to_email.
  const estAdmin = destinataire === process.env.ADMIN_EMAIL;
  const templateId = estAdmin ? process.env.EMAILJS_TEMPLATE_ID_ADMIN! : process.env.EMAILJS_TEMPLATE_ID_CLIENT!;

  try {
    const resultat = await emailjs.send(process.env.EMAILJS_SERVICE_ID!, templateId, {
      to_email: destinataire,
      numero: `Commande ${numero}`,
      total: "—",
      lignes: blocNotification(
        "NOUVEAU MESSAGE",
        `<strong>${expediteur}</strong> vous a écrit :<br><br>${apercuCourt}`
      ),
      client_nom: expediteur,
      client_telephone: "—",
      client_email: "—",
      adresse_livraison: "—",
    });
    console.log("[email] Notification nouveau message envoyée :", resultat.status, destinataire);
  } catch (error) {
    console.error("[email] Erreur d'envoi (nouveau message) :", error);
  }
}

// src/lib/email.ts
// Ajout : notifie tous les inscrits StockAlert non encore notifiés d'un produit,
// et notification admin pour le seuil de stock bas. À ajouter à la fin du fichier.

export async function envoyerAlerteRetourStock(params: { destinataire: string; nomProduit: string; slug: string }) {
  const { destinataire, nomProduit, slug } = params;
  try {
    const resultat = await emailjs.send(process.env.EMAILJS_SERVICE_ID!, process.env.EMAILJS_TEMPLATE_ID_CLIENT!, {
      to_email: destinataire,
      numero: "De retour en stock !",
      total: "—",
      lignes: blocNotification(
        "PRODUIT DISPONIBLE",
        `<strong>${nomProduit}</strong> est de nouveau en stock. <a href="${process.env.NEXT_PUBLIC_SITE_URL}/produit/${slug}" style="color:#2E7D32;">Voir le produit →</a>`
      ),
    });
    console.log("[email] Alerte retour stock envoyée :", resultat.status, destinataire);
  } catch (error) {
    console.error("[email] Erreur d'envoi (retour stock) :", error);
  }
}

export async function envoyerAlerteStockBas(params: { nomProduit: string; stockActuel: number; seuil: number }) {
  const { nomProduit, stockActuel, seuil } = params;
  if (!process.env.ADMIN_EMAIL) return;

  try {
    const resultat = await emailjs.send(process.env.EMAILJS_SERVICE_ID!, process.env.EMAILJS_TEMPLATE_ID_ADMIN!, {
      to_email: process.env.ADMIN_EMAIL,
      numero: "Stock bas",
      total: "—",
      lignes: blocNotification(
        "ALERTE STOCK",
        `<strong>${nomProduit}</strong> n'a plus que <strong>${stockActuel}</strong> unité(s) en stock (seuil configuré : ${seuil}).`
      ),
      client_nom: "—",
      client_telephone: "—",
      client_email: "—",
      adresse_livraison: "—",
    });
    console.log("[email] Alerte stock bas envoyée :", resultat.status);
  } catch (error) {
    console.error("[email] Erreur d'envoi (stock bas) :", error);
  }
}

// src/lib/email.ts
// Ajouts à la fin du fichier : notification admin d'une nouvelle demande de zone,
// et notification client quand sa zone est approuvée.

export async function envoyerDemandeLivraisonAdmin(params: { ville: string; nom: string; telephone: string }) {
  const { ville, nom, telephone } = params;
  if (!process.env.ADMIN_EMAIL) return;

  try {
    const resultat = await emailjs.send(process.env.EMAILJS_SERVICE_ID!, process.env.EMAILJS_TEMPLATE_ID_ADMIN!, {
      to_email: process.env.ADMIN_EMAIL,
      numero: "Demande de zone de livraison",
      total: "—",
      lignes: blocNotification(
        "NOUVELLE VILLE DEMANDÉE",
        `<strong>${nom}</strong> (${telephone}) demande une livraison à <strong>${ville}</strong>.`
      ),
      client_nom: nom,
      client_telephone: telephone,
      client_email: "—",
      adresse_livraison: ville,
    });
    console.log("[email] Demande de livraison envoyée à l'admin :", resultat.status);
  } catch (error) {
    console.error("[email] Erreur d'envoi (demande livraison) :", error);
  }
}

export async function envoyerZoneApprouvee(params: { destinataire: string; ville: string; frais: number }) {
  const { destinataire, ville, frais } = params;

  try {
    const resultat = await emailjs.send(process.env.EMAILJS_SERVICE_ID!, process.env.EMAILJS_TEMPLATE_ID_CLIENT!, {
      to_email: destinataire,
      numero: "Bonne nouvelle !",
      total: "—",
      lignes: blocNotification(
        "LIVRAISON DISPONIBLE",
        `Nous livrons désormais à <strong>${ville}</strong> pour <strong>${frais.toLocaleString("fr-FR")} FCFA</strong>. Vous pouvez finaliser votre commande dès maintenant.`
      ),
    });
    console.log("[email] Notification zone approuvée envoyée :", resultat.status, destinataire);
  } catch (error) {
    console.error("[email] Erreur d'envoi (zone approuvée) :", error);
  }
}