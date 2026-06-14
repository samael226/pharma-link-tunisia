/// <reference types="google.maps" />
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    __pharmalinkMapsInit?: () => void;
  }
}


export type MapBranch = {
  id: string;
  name: string;
  city: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  pharmacy_name?: string | null;
  badge?: string;
};

type Props = {
  branches: MapBranch[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  height?: number;
};

// Tunis city center fallback
const TUNIS = { lat: 36.8065, lng: 10.1815 };

let loadingPromise: Promise<void> | null = null;
function loadMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));
  if (window.google?.maps) return Promise.resolve();
  if (loadingPromise) return loadingPromise;
  loadingPromise = new Promise((resolve, reject) => {
    const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;
    const channel = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID;
    if (!key) return reject(new Error("Google Maps key missing"));
    window.__pharmalinkMapsInit = () => resolve();
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=__pharmalinkMapsInit${channel ? `&channel=${channel}` : ""}`;
    s.async = true;
    s.defer = true;
    s.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(s);
  });
  return loadingPromise;
}

export function PharmacyMap({ branches, selectedId, onSelect, height = 480 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const infoRef = useRef<google.maps.InfoWindow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadMaps()
      .then(() => {
        if (cancelled || !ref.current) return;
        mapRef.current = new google.maps.Map(ref.current, {
          center: TUNIS,
          zoom: 7,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: [
            { featureType: "poi.business", stylers: [{ visibility: "off" }] },
            { featureType: "transit", stylers: [{ visibility: "off" }] },
          ],
        });
        infoRef.current = new google.maps.InfoWindow();
        setReady(true);
      })
      .catch((e) => setError(e.message));
    return () => {
      cancelled = true;
    };
  }, []);

  // Sync markers
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const map = mapRef.current;
    const existing = markersRef.current;
    const seen = new Set<string>();

    const bounds = new google.maps.LatLngBounds();
    let hasPoints = false;

    for (const b of branches) {
      if (b.latitude == null || b.longitude == null) continue;
      seen.add(b.id);
      hasPoints = true;
      const pos = { lat: b.latitude, lng: b.longitude };
      bounds.extend(pos);
      let marker = existing.get(b.id);
      if (!marker) {
        marker = new google.maps.Marker({
          position: pos,
          map,
          title: b.pharmacy_name ?? b.name,
        });
        marker.addListener("click", () => {
          infoRef.current?.setContent(
            `<div style="font-family:system-ui;font-size:13px;max-width:220px">
              <div style="font-weight:600;margin-bottom:2px">${escapeHtml(b.pharmacy_name ?? b.name)}</div>
              <div style="color:#666;font-size:12px">${escapeHtml(b.address)}, ${escapeHtml(b.city)}</div>
              ${b.badge ? `<div style="margin-top:4px;color:#0d9488;font-weight:500;font-size:12px">${escapeHtml(b.badge)}</div>` : ""}
            </div>`,
          );
          infoRef.current?.open({ map, anchor: marker });
          onSelect?.(b.id);
        });
        existing.set(b.id, marker);
      } else {
        marker.setPosition(pos);
      }
    }

    // Remove stale
    for (const [id, marker] of existing) {
      if (!seen.has(id)) {
        marker.setMap(null);
        existing.delete(id);
      }
    }

    if (hasPoints) {
      if (existing.size === 1) {
        map.setCenter(bounds.getCenter());
        map.setZoom(14);
      } else {
        map.fitBounds(bounds, 60);
      }
    }
  }, [branches, ready, onSelect]);

  // Highlight selected
  useEffect(() => {
    if (!ready) return;
    for (const [id, marker] of markersRef.current) {
      marker.setAnimation(id === selectedId ? google.maps.Animation.BOUNCE : null);
    }
  }, [selectedId, ready]);

  if (error) {
    return (
      <div className="rounded-lg border bg-muted/30 p-6 text-center text-sm text-muted-foreground" style={{ height }}>
        Carte indisponible : {error}
      </div>
    );
  }
  return <div ref={ref} className="rounded-lg border overflow-hidden" style={{ height, width: "100%" }} />;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}
