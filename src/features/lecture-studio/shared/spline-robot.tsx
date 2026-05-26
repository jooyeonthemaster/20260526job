"use client";

import dynamic from "next/dynamic";

const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: () => <div className="spline-fallback" aria-hidden />,
});

export function SplineRobot() {
  return <Spline scene="https://prod.spline.design/f60FOuMNnQHiP-ZC/scene.splinecode" />;
}
