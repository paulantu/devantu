"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("./location-map-client"), {
  ssr: false,
  loading: () => <div className="h-80 w-full rounded-xl border border-border bg-elevated" />,
});

export function LocationMap(props: { lat: number; lng: number; label: string }) {
  return <Map {...props} />;
}