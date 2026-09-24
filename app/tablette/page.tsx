"use client";

import dynamic from "next/dynamic";

const Tablet = dynamic(() => import("@/components/Tablet"), { ssr: false });

export default function TablettePage() {
  return <Tablet />;
}
