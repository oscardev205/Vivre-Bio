// src/lib/pdf/FactureDocument.tsx
// Structure de la facture PDF avec @react-pdf/renderer — syntaxe proche de React
// mais avec des composants spécifiques (Document, Page, View, Text) qui compilent
// en PDF plutôt qu'en HTML. Polices intégrées Helvetica (pas de police custom
// pour rester simple et fiable — Poppins nécessiterait un embarquement manuel).

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatPrix } from "@/lib/format";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#1B2A1F" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  logoRouge: { color: "#E31E24", fontSize: 20, fontFamily: "Helvetica-Bold" },
  logoV.ert: { color: "#2E7D32", fontSize: 20, fontFamily: "Helvetica-Bold" },
  slogan: { fontSize: 8, color: "#7CB342", marginTop: 2 },
  titreFacture: { fontSize: 16, fontFamily: "Helvetica-Bold", color: "#2E7D32", textAlign: "right" },
  numeroFacture: { fontSize: 9, color: "#666", textAlign: "right", marginTop: 2 },
  section: { marginBottom: 16 },
  labelSection: { fontSize: 8, color: "#999", textTransform: "uppercase", marginBottom: 4 },
  texteGris: { color: "#555", marginBottom: 1 },
  tableHeader: { flexDirection: "row", backgroundColor: "#2E7D32", padding: 6, marginTop: 10 },
  tableHeaderTexte: { color: "#fff", fontSize: 9, fontFamily: "Helvetica-Bold" },
  tableRow: { flexDirection: "row", padding: 6, borderBottomWidth: 0.5, borderBottomColor: "#ede7d9" },
  colProduit: { flex: 3 },
  colQte: { flex: 1, textAlign: "center" },
  colPrix: { flex: 1.5, textAlign: "right" },
  colTotal: { flex: 1.5, textAlign: "right" },
  totauxBloc: { marginTop: 16, alignItems: "flex-end" },
  ligneTotal: { flexDirection: "row", justifyContent: "space-between", width: 220, marginBottom: 3 },
  ligneTotalFinal: {
    flexDirection: "row", justifyContent: "space-between", width: 220,
    borderTopWidth: 1, borderTopColor: "#1B2A1F", paddingTop: 4, marginTop: 4,
  },
  totalFinalTexte: { fontFamily: "Helvetica-Bold", fontSize: 12, color: "#2E7D32" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, textAlign: "center", fontSize: 8, color: "#999" },
});

type LigneFacture = { nom: string; quantite: number; prixUnitaire: number };

type Props = {
  numero: string;
  date: string;
  nomClient: string;
  contactTelephone: string;
  adresseLigne1?: string;
  adresseLigne2?: string;
  lignes: LigneFacture[];
  sousTotal: number;
  montantReduction: number;
  fraisLivraison: number;
  total: number;
  modePaiement: string;
  modeLivraison: string;
};

export function FactureDocument({
  numero, date, nomClient, contactTelephone, adresseLigne1, adresseLigne2,
  lignes, sousTotal, montantReduction, fraisLivraison, total, modePaiement, modeLivraison,
}: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text><Text style={styles.logoRouge}>V</Text><Text style={styles.logoV.ert}>ivre Bio</Text></Text>
            <Text style={styles.slogan}>Le meilleur de la nature pour vous</Text>
          </View>
          <View>
            <Text style={styles.titreFacture}>FACTURE</Text>
            <Text style={styles.numeroFacture}>{numero}</Text>
            <Text style={styles.numeroFacture}>{date}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.labelSection}>Facturé à</Text>
          <Text style={styles.texteGris}>{nomClient}</Text>
          <Text style={styles.texteGris}>{contactTelephone}</Text>
          {adresseLigne1 && <Text style={styles.texteGris}>{adresseLigne1}</Text>}
          {adresseLigne2 && <Text style={styles.texteGris}>{adresseLigne2}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.labelSection}>
            {modeLivraison === "RETRAIT" ? "Retrait en boutique" : "Mode de paiement"} · {modePaiement}
          </Text>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderTexte, styles.colProduit]}>Produit</Text>
          <Text style={[styles.tableHeaderTexte, styles.colQte]}>Qté</Text>
          <Text style={[styles.tableHeaderTexte, styles.colPrix]}>Prix unit.</Text>
          <Text style={[styles.tableHeaderTexte, styles.colTotal]}>Total</Text>
        </View>
        {lignes.map((ligne, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.colProduit}>{ligne.nom}</Text>
            <Text style={styles.colQte}>{ligne.quantite}</Text>
            <Text style={styles.colPrix}>{formatPrix(ligne.prixUnitaire)}</Text>
            <Text style={styles.colTotal}>{formatPrix(ligne.prixUnitaire * ligne.quantite)}</Text>
          </View>
        ))}

        <View style={styles.totauxBloc}>
          <View style={styles.ligneTotal}>
            <Text>Sous-total</Text>
            <Text>{formatPrix(sousTotal)}</Text>
          </View>
          {montantReduction > 0 && (
            <View style={styles.ligneTotal}>
              <Text>Réduction</Text>
              <Text>− {formatPrix(montantReduction)}</Text>
            </View>
          )}
          <View style={styles.ligneTotal}>
            <Text>{modeLivraison === "RETRAIT" ? "Retrait" : "Livraison"}</Text>
            <Text>{fraisLivraison === 0 ? "Gratuit" : formatPrix(fraisLivraison)}</Text>
          </View>
          <View style={styles.ligneTotalFinal}>
            <Text style={styles.totalFinalTexte}>Total</Text>
            <Text style={styles.totalFinalTexte}>{formatPrix(total)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Vivre Bio — Cotonou, Bénin · Merci pour votre confiance.
        </Text>
      </Page>
    </Document>
  );
}