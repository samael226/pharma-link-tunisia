/// <reference types="google.maps" />
import { useEffect, useRef, useState } from "react";

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
    const cbName = "__pharmalinkMapsInit";
    (window as unknown as Record<string, () => void>)[cbName] = () => resolve();
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=${cbName}${channel ? `&channel=${channel}` : ""}`;
    s.async = true;
    s.defer = true;
    s.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(s);
  });
  return loadingPromise;
}

type Props = {
  value: { lat: number; lng: number } | null;
  onChange: (pos: { lat: number; lng: number }) => void;
  height?: number;
};

export function MapPicker({ value, onChange, height = 360 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadMaps()
      .then(() => {
        if (cancelled || !ref.current) return;
        const center = value ?? TUNIS;
        const map = new google.maps.Map(ref.current, {
          center,
          zoom: value ? 14 : 7,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        mapRef.current = map;
        if (value) {
          markerRef.current = new google.maps.Marker({ position: value, map, draggable: true });
          markerRef.current.addListener("dragend", () => {
            const p = markerRef.current!.getPosition();
            if (p) onChange({ lat: p.lat(), lng: p.lng() });
          });
        }
        map.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (!e.latLng) return;
          const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
          if (!markerRef.current) {
            markerRef.current = new google.maps.Marker({ position: pos, map, draggable: true });
            markerRef.current.addListener("dragend", () => {
              const p = markerRef.current!.getPosition();
              if (p) onChange({ lat: p.lat(), lng: p.lng() });
            });
          } else {
            markerRef.current.setPosition(pos);
          }
          onChange(pos);
        });
      })
      .catch((e) => setError(e.message));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // External value updates (e.g. geolocate button)
  useEffect(() => {
    if (!value || !mapRef.current) return;
    if (!markerRef.current) {
      markerRef.current = new google.maps.Marker({ position: value, map: mapRef.current, draggable: true });
      markerRef.current.addListener("dragend", () => {
        const p = markerRef.current!.getPosition();
        if (p) onChange({ lat: p.lat(), lng: p.lng() });
      });
    } else {
      markerRef.current.setPosition(value);
    }
    mapRef.current.panTo(value);
  }, [value, onChange]);

  if (error) {
    return (
      <div className="rounded-lg border bg-muted/30 p-6 text-center text-sm text-muted-foreground" style={{ height }}>
        Carte indisponible : {error}
      </div>
    );
  }
  return <div ref={ref} className="rounded-lg border overflow-hidden" style={{ height, width: "100%" }} />;
}
