// src/components/commande/AddressMapPicker.tsx
// Ajout : adresseCourte transmise via onSelect (dérivée aussi côté recherche,
// pas seulement au glisser du repère).
"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import { FaLocationCrosshairs, FaLocationDot } from "react-icons/fa6";

type PositionChoisie = {
  adresseTexte: string;
  adresseCourte: string;
  lat: number;
  lng: number;
  ville?: string;
  quartier?: string;
};
type Props = { onSelect: (position: PositionChoisie) => void };

const COTONOU: [number, number] = [6.3703, 2.3912];

function extraireAdresseCourte(address: Record<string, string> | undefined, displayName: string): string {
  if (!address) return displayName.split(",")[0] ?? "";
  const rue = [address.road, address.house_number].filter(Boolean).join(" ");
  return rue || address.neighbourhood || address.suburb || displayName.split(",")[0] || "";
}

export function AddressMapPicker({ onSelect }: Props) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const initialise = useRef(false);
  const watchIdRef = useRef<number | null>(null);

  const [recherche, setRecherche] = useState("");
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [suiviActif, setSuiviActif] = useState(false);

  useEffect(() => {
    if (initialise.current || !mapDivRef.current) return;
    initialise.current = true;

    (async () => {
      const L = (await import("leaflet")).default;
      const map = L.map(mapDivRef.current!).setView(COTONOU, 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const iconePin = L.divIcon({
        className: "",
        html: `<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
                 <path d="M15 0C6.7 0 0 6.7 0 15c0 11.2 15 25 15 25s15-13.8 15-25C30 6.7 23.3 0 15 0z" fill="#2E7D32"/>
                 <circle cx="15" cy="15" r="5.5" fill="#fff"/>
               </svg>`,
        iconSize: [30, 40],
        iconAnchor: [15, 40],
      });

      const marker = L.marker(COTONOU, { icon: iconePin, draggable: true }).addTo(map);

      marker.on("dragend", async () => {
        const { lat, lng } = marker.getLatLng();
        await geocoderInverse(lat, lng);
      });

      mapRef.current = map;
      markerRef.current = marker;
    })();

    return () => {
      mapRef.current?.remove();
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function geocoderInverse(lat: number, lng: number) {
    try {
      const res = await fetch(`/api/geocodage/inverse?lat=${lat}&lng=${lng}`);
      const data = await res.json();
      onSelect({
        adresseTexte: data.adresseTexte ?? `Position (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
        adresseCourte: data.adresseCourte ?? `Position (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
        lat,
        lng,
        ville: data.ville ?? "",
        quartier: data.quartier ?? "",
      });
    } catch {
      onSelect({
        adresseTexte: `Position (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
        adresseCourte: `Position (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
        lat,
        lng,
      });
    }
  }

  async function lancerRecherche() {
    if (recherche.trim().length < 3) {
      setErreur("Tape au moins 3 caractères.");
      return;
    }
    setChargement(true);
    setErreur("");

    try {
      const res = await fetch(`/api/geocodage/recherche?q=${encodeURIComponent(recherche)}`);
      const resultats = await res.json();

      if (!Array.isArray(resultats) || resultats.length === 0) {
        setErreur("Aucune adresse trouvée, essaie de déplacer le repère manuellement.");
        setChargement(false);
        return;
      }

      const premier = resultats[0];
      const { lat, lon, display_name, address } = premier;
      const position: [number, number] = [parseFloat(lat), parseFloat(lon)];

      mapRef.current?.setView(position, 16);
      markerRef.current?.setLatLng(position);

      onSelect({
        adresseTexte: display_name,
        adresseCourte: extraireAdresseCourte(address, display_name),
        lat: position[0],
        lng: position[1],
        ville: address?.city ?? address?.town ?? address?.municipality ?? address?.county ?? "",
        quartier: address?.suburb ?? address?.neighbourhood ?? address?.quarter ?? address?.residential ?? "",
      });
    } catch {
      setErreur("Recherche indisponible pour le moment.");
    } finally {
      setChargement(false);
    }
  }

  function utiliserPositionActuelle() {
    if (!navigator.geolocation) {
      setErreur("La géolocalisation n'est pas disponible sur cet appareil.");
      return;
    }
    setErreur("");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const position: [number, number] = [coords.latitude, coords.longitude];
        mapRef.current?.setView(position, 16);
        markerRef.current?.setLatLng(position);
        await geocoderInverse(coords.latitude, coords.longitude);
      },
      (err) => setErreur(messageErreurGeolocalisation(err)),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function basculerSuiviDirect() {
    if (suiviActif) {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setSuiviActif(false);
      return;
    }
    if (!navigator.geolocation) {
      setErreur("La géolocalisation n'est pas disponible sur cet appareil.");
      return;
    }
    setErreur("");
    watchIdRef.current = navigator.geolocation.watchPosition(
      async ({ coords }) => {
        const position: [number, number] = [coords.latitude, coords.longitude];
        mapRef.current?.setView(position);
        markerRef.current?.setLatLng(position);
        await geocoderInverse(coords.latitude, coords.longitude);
      },
      (err) => {
        setErreur(messageErreurGeolocalisation(err));
        setSuiviActif(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    setSuiviActif(true);
  }

  function messageErreurGeolocalisation(err: GeolocationPositionError): string {
    if (err.code === err.PERMISSION_DENIED) return "Localisation refusée — autorise-la dans les réglages de ton navigateur.";
    if (err.code === err.POSITION_UNAVAILABLE) return "Position indisponible pour le moment.";
    return "Impossible de récupérer ta position.";
  }

  return (
    <div>
      <div className="mb-2 flex gap-2">
        <input
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              lancerRecherche();
            }
          }}
          placeholder="Rechercher une adresse ou un quartier"
          className="flex-1 rounded-lg border border-sable px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={lancerRecherche}
          disabled={chargement}
          className="rounded-lg bg-vivrebio-vert px-4 text-sm font-medium text-white"
        >
          {chargement ? "..." : "Rechercher"}
        </button>
      </div>

      <div className="mb-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={utiliserPositionActuelle}
          className="flex items-center gap-1.5 rounded-lg border border-sable px-3 py-1.5 text-xs font-medium text-encre/70 hover:border-vivrebio-vert hover:text-vivrebio-vert"
        >
          <FaLocationCrosshairs size={12} /> Utiliser ma position actuelle
        </button>

        <button
          type="button"
          onClick={basculerSuiviDirect}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
            suiviActif
              ? "border-vivrebio-rouge bg-vivrebio-rouge/10 text-vivrebio-rouge"
              : "border-sable text-encre/70 hover:border-vivrebio-vert hover:text-vivrebio-vert"
          }`}
        >
          <FaLocationDot size={12} />
          {suiviActif ? "Arrêter le suivi en direct" : "Suivre ma position en direct"}
        </button>
      </div>

      {suiviActif && (
        <p className="mb-2 text-xs font-medium text-vivrebio-rouge">
          ● Suivi en direct actif — le repère se déplace avec toi
        </p>
      )}

      {erreur && <p className="mb-2 text-xs text-vivrebio-rouge">{erreur}</p>}

      <div ref={mapDivRef} className="h-56 w-full rounded-xl border border-sable" />

      <p className="mt-1.5 text-xs text-encre/40">
        Recherchez une adresse, utilisez votre position actuelle, ou déplacez le repère vert.
      </p>
    </div>
  );
}