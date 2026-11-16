"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function LocationMapClient({
  lat,
  lng,
  label,
}: {
  lat: number;
  lng: number;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const map = L.map(ref.current, { scrollWheelZoom: false }).setView([lat, lng], 14);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const icon = L.divIcon({
      className: "",
      html: '<div style="width:18px;height:18px;border-radius:9999px;background:#ff6b57;border:3px solid #fff;box-shadow:0 0 0 6px rgba(255,107,87,.3)"></div>',
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
    L.marker([lat, lng], { icon, title: label }).addTo(map);

    return () => {
      map.remove();
    };
  }, [lat, lng, label]);

  return <div ref={ref} className="isolate h-80 w-full overflow-hidden rounded-xl border border-border" />;
}