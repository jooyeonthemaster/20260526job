"use client";

import dynamic from "next/dynamic";

const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: () => <div className="spline-fallback" aria-hidden />,
});

export function SplineScene({ url }: { url: string }) {
  return <Spline scene={url} />;
}
