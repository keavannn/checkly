import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import "./presentation.css";
import Presentation from "@/components/presentation/Presentation";
import { siteCopy } from "@/lib/i18n/presentation";

const display = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin"], display: "swap" });
const body = Figtree({ variable: "--font-body", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: siteCopy.fr.meta.title,
  description: siteCopy.fr.meta.description,
};

export default function Home() {
  return (
    <div className={`${display.variable} ${body.variable}`}>
      <Presentation />
    </div>
  );
}
