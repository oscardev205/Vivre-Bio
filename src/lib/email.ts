// src/lib/email.ts
// Fichier complet : ajout de echapperHtml(), appliquée à chaque texte fourni
// par un utilisateur AVANT de l'insérer dans les blocs HTML construits par le
// code (lignes, message_intro) — jamais nécessaire sur les champs simples déjà
// protégés automatiquement par EmailJS (client_nom, client_email...).

import emailjs from "@emailjs/nodejs";

emailjs.init({
  publicKey: process.env.EMAILJS_PUBLIC_KEY!,
  privateKey: process.env.EMAILJS_PRIVATE_KEY!,
});

// Neutralise les caractères HTML spéciaux dans un texte fourni par un visiteur,
// avant de l'insérer dans un bloc HTML construit par notre propre code.
function echapperHtml(texte: string): string {
  return texte
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${echapperHtml(l.nom)} × ${l.quantite}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${(l.prixUnitaire * l.quantite).toLocaleString("fr-FR")} FCFA</td>
        </tr>`
    )
    .join("");
}

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
      titre: "Merci pour votre commande !",
      message_intro: `Votre commande <strong>${echapperHtml(numero)}</strong> est confirmée et va bientôt être préparée.`,
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
    // clientNom/clientTelephone/clientEmail/adresseLivraison sont envoyés en
    // champs simples {{...}} au template — déjà échappés automatiquement par
    // EmailJS, pas besoin de les traiter ici.
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
        `<strong>${echapperHtml(nom)}</strong> (${echapperHtml(email)}) écrit :<br><br>${echapperHtml(message)}`
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
      titre: "✅ Livraison confirmée",
      numero: `Commande ${numero}`,
      total: "—",
      lignes: blocNotification(
        "LIVRAISON CONFIRMÉE",
        `<strong>${echapperHtml(clientNom)}</strong> confirme avoir bien reçu sa commande <strong>${echapperHtml(numero)}</strong>.`
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
  const estAdmin = destinataire === process.env.ADMIN_EMAIL;

  try {
    if (estAdmin) {
      await emailjs.send(process.env.EMAILJS_SERVICE_ID!, process.env.EMAILJS_TEMPLATE_ID_ADMIN!, {
        to_email: destinataire,
        titre: "💬 Nouveau message client",
        numero: `Commande ${numero}`,
        total: "—",
        lignes: blocNotification(
          "NOUVEAU MESSAGE",
          `<strong>${echapperHtml(expediteur)}</strong> vous a écrit :<br><br>${echapperHtml(apercuCourt)}`
        ),
        client_nom: expediteur,
        client_telephone: "—",
        client_email: "—",
        adresse_livraison: "—",
      });
    } else {
      await emailjs.send(process.env.EMAILJS_SERVICE_ID!, process.env.EMAILJS_TEMPLATE_ID_CLIENT!, {
        to_email: destinataire,
        titre: "💬 Nouveau message",
        message_intro: `<strong>${echapperHtml(expediteur)}</strong> vous a écrit concernant votre commande <strong>${echapperHtml(numero)}</strong> :<br><br>${echapperHtml(apercuCourt)}`,
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
        `<strong>${echapperHtml(nom)}</strong> (${echapperHtml(telephone)}) demande une livraison à <strong>${echapperHtml(ville)}</strong>.`
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
      titre: "🎉 Bonne nouvelle !",
      message_intro: `Nous livrons désormais à <strong>${echapperHtml(ville)}</strong> pour <strong>${frais.toLocaleString("fr-FR")} FCFA</strong>. Vous pouvez finaliser votre commande dès maintenant.`,
      numero: "",
      total: "",
      lignes: "",
    });
    console.log("[email] Notification zone approuvée envoyée :", resultat.status, destinataire);
  } catch (error) {
    console.error("[email] Erreur d'envoi (zone approuvée) :", error);
  }
}

export async function envoyerAlerteRetourStock(params: { destinataire: string; nomProduit: string; slug: string }) {
  const { destinataire, nomProduit, slug } = params;
  try {
    const resultat = await emailjs.send(process.env.EMAILJS_SERVICE_ID!, process.env.EMAILJS_TEMPLATE_ID_CLIENT!, {
      to_email: destinataire,
      titre: "📦 De retour en stock !",
      message_intro: `<strong>${echapperHtml(nomProduit)}</strong> est de nouveau en stock. <a href="${process.env.NEXT_PUBLIC_SITE_URL}/produit/${slug}" style="color:#2E7D32;">Voir le produit →</a>`,
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
        `<strong>${echapperHtml(nomProduit)}</strong> n'a plus que <strong>${stockActuel}</strong> unité(s) en stock (seuil configuré : ${seuil}).`
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
// Ajout à la fin du fichier existant : envoi du lien de réinitialisation.

export async function envoyerLienReinitialisation(params: { destinataire: string; lien: string }) {
  const { destinataire, lien } = params;

  try {
    const resultat = await emailjs.send(process.env.EMAILJS_SERVICE_ID!, process.env.EMAILJS_TEMPLATE_ID_CLIENT!, {
      to_email: destinataire,
      titre: "🔑 Réinitialisation de mot de passe",
      message_intro: `Vous avez demandé à réinitialiser votre mot de passe. <a href="${lien}" style="color:#2E7D32; font-weight:600;">Cliquez ici pour choisir un nouveau mot de passe</a>. Ce lien expire dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail.`,
      numero: "",
      total: "",
      lignes: "",
    });
    console.log("[email] Lien de réinitialisation envoyé :", resultat.status, destinataire);
  } catch (error) {
    console.error("[email] Erreur d'envoi (réinitialisation) :", error);
  }
}