// src/lib/email.ts
// Fichier complet : chaque fonction envoie désormais un "titre" et, côté client,
// un "message_intro" spécifiques à son événement — fini le titre figé "Nouvelle
// commande reçue" ou "Merci pour votre commande" réutilisé partout à tort.

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

// Bloc générique pour les notifications qui ne sont PAS une commande
// (message, contact, livraison, zone) — étiquette de type visible en tête.
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

// ------------------------------
// COMMANDE — confirmation client
// ------------------------------
export async function envoyerEmailConfirmationCommande(
  params: InfosCommande & { destinataire: string }
) {
  const { destinataire, numero, total, lignes } = params;
  try {
    const resultat = await emailjs.send(process.env.EMAILJS_SERVICE_ID!, process.env.EMAILJS_TEMPLATE_ID_CLIENT!, {
      to_email: destinataire,
      titre: "Merci pour votre commande !",
      message_intro: `Votre commande <strong>${numero}</strong> est confirmée et va bientôt être préparée.`,
      numero,
      total: `${total.toLocaleString("fr-FR")} FCFA`,
      lignes: formaterLignes(lignes),
    });
    console.log("[email] Confirmation client envoyée :", resultat.status, destinataire);
  } catch (error) {
    console.error("[email] Erreur d'envoi (confirmation client) :", error);
  }
}

// ------------------------------
// COMMANDE — notification admin
// ------------------------------
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
      titre: "🔔 Nouvelle commande reçue",
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

// ------------------------------
// FORMULAIRE DE CONTACT
// ------------------------------
export async function envoyerMessageContact(params: { nom: string; email: string; message: string }) {
  const { nom, email, message } = params;

  if (!process.env.ADMIN_EMAIL) {
    console.error("[email] ADMIN_EMAIL n'est pas défini dans .env.");
    return;
  }

  try {
    const resultat = await emailjs.send(process.env.EMAILJS_SERVICE_ID!, process.env.EMAILJS_TEMPLATE_ID_ADMIN!, {
      to_email: process.env.ADMIN_EMAIL,
      titre: "✉️ Message de contact",
      numero: "—",
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

// ------------------------------
// LIVRAISON CONFIRMÉE PAR LE CLIENT
// ------------------------------
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
      titre: "✅ Livraison confirmée",
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

// ------------------------------
// NOUVEAU MESSAGE (fil de discussion commande)
// ------------------------------
export async function envoyerNotificationNouveauMessage(params: {
  destinataire: string;
  numero: string;
  expediteur: string;
  apercu: string;
}) {
  const { destinataire, numero, expediteur, apercu } = params;
  const apercuCourt = apercu.length > 150 ? apercu.slice(0, 150) + "..." : apercu;
  const estAdmin = destinataire === process.env.ADMIN_EMAIL;

  try {
    if (estAdmin) {
      await emailjs.send(process.env.EMAILJS_SERVICE_ID!, process.env.EMAILJS_TEMPLATE_ID_ADMIN!, {
        to_email: destinataire,
        titre: "💬 Nouveau message client",
        numero: `Commande ${numero}`,
        total: "—",
        lignes: blocNotification("NOUVEAU MESSAGE", `<strong>${expediteur}</strong> vous a écrit :<br><br>${apercuCourt}`),
        client_nom: expediteur,
        client_telephone: "—",
        client_email: "—",
        adresse_livraison: "—",
      });
    } else {
      await emailjs.send(process.env.EMAILJS_SERVICE_ID!, process.env.EMAILJS_TEMPLATE_ID_CLIENT!, {
        to_email: destinataire,
        titre: "💬 Nouveau message",
        message_intro: `<strong>${expediteur}</strong> vous a écrit concernant votre commande <strong>${numero}</strong> :<br><br>${apercuCourt}`,
        numero,
        total: "",
        lignes: "",
      });
    }
    console.log("[email] Notification nouveau message envoyée :", destinataire);
  } catch (error) {
    console.error("[email] Erreur d'envoi (nouveau message) :", error);
  }
}

// ------------------------------
// DEMANDE DE NOUVELLE ZONE DE LIVRAISON
// ------------------------------
export async function envoyerDemandeLivraisonAdmin(params: { ville: string; nom: string; telephone: string }) {
  const { ville, nom, telephone } = params;
  if (!process.env.ADMIN_EMAIL) return;

  try {
    const resultat = await emailjs.send(process.env.EMAILJS_SERVICE_ID!, process.env.EMAILJS_TEMPLATE_ID_ADMIN!, {
      to_email: process.env.ADMIN_EMAIL,
      titre: "📍 Demande de nouvelle zone",
      numero: "—",
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

// ------------------------------
// ZONE APPROUVÉE (notifie le client)
// ------------------------------
export async function envoyerZoneApprouvee(params: { destinataire: string; ville: string; frais: number }) {
  const { destinataire, ville, frais } = params;

  try {
    const resultat = await emailjs.send(process.env.EMAILJS_SERVICE_ID!, process.env.EMAILJS_TEMPLATE_ID_CLIENT!, {
      to_email: destinataire,
      titre: "🎉 Bonne nouvelle !",
      message_intro: `Nous livrons désormais à <strong>${ville}</strong> pour <strong>${frais.toLocaleString("fr-FR")} FCFA</strong>. Vous pouvez finaliser votre commande dès maintenant.`,
      numero: "",
      total: "",
      lignes: "",
    });
    console.log("[email] Notification zone approuvée envoyée :", resultat.status, destinataire);
  } catch (error) {
    console.error("[email] Erreur d'envoi (zone approuvée) :", error);
  }
}

// ------------------------------
// STOCK
// ------------------------------
export async function envoyerAlerteRetourStock(params: { destinataire: string; nomProduit: string; slug: string }) {
  const { destinataire, nomProduit, slug } = params;
  try {
    const resultat = await emailjs.send(process.env.EMAILJS_SERVICE_ID!, process.env.EMAILJS_TEMPLATE_ID_CLIENT!, {
      to_email: destinataire,
      titre: "📦 De retour en stock !",
      message_intro: `<strong>${nomProduit}</strong> est de nouveau en stock. <a href="${process.env.NEXT_PUBLIC_SITE_URL}/produit/${slug}" style="color:#2E7D32;">Voir le produit →</a>`,
      numero: "",
      total: "",
      lignes: "",
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
      titre: "⚠️ Stock bas",
      numero: "—",
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