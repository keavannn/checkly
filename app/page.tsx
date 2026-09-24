import Link from "next/link";
import "./demo.css";
import DemoControls from "@/components/DemoControls";

export default function Home() {
  return (
    <div className="demo-shell">
      <div className="demo-brand">
        <strong>CHECKLY</strong>
        <i />
        <span>SUITE DIGITALE HÔTELIÈRE — DÉMONSTRATION</span>
      </div>
      <div className="demo-cards">
        <Link className="demo-card" href="/borne">
          <span className="demo-icon">🏨</span>
          <strong>Borne Check-in</strong>
          <small>Accueil, réservation, paiement</small>
        </Link>
        <Link className="demo-card" href="/tablette">
          <span className="demo-icon">📱</span>
          <strong>Tablette Chambre</strong>
          <small>Restauration, services, séjour</small>
        </Link>
        <Link className="demo-card" href="/dashboard-cuisine">
          <span className="demo-icon">👨‍🍳</span>
          <strong>Dashboard Cuisine</strong>
          <small>Commandes en temps réel</small>
        </Link>
      </div>
      <DemoControls />
    </div>
  );
}
