"use client";

import dynamic from "next/dynamic";

const DashboardCuisine = dynamic(() => import("@/components/DashboardCuisine"), { ssr: false });

export default function DashboardCuisinePage() {
  return <DashboardCuisine />;
}
