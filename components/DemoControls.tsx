"use client";

import { useRef, useState } from "react";
import { useConfig, setConfig, defaultConfig, type HotelInfoItem } from "@/lib/config";
import { clearOrders } from "@/lib/orders";
import { clearChats } from "@/lib/chat";

const isProd = process.env.NODE_ENV === "production";
const SECRET_TAPS = 3;
const SECRET_WINDOW_MS = 1500;

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const maxW = 480;
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("no canvas context")); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function DemoControls() {
  const config = useConfig();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(config);
  const [resetDone, setResetDone] = useState(false);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importImages, setImportImages] = useState<string[]>([]);
  const [importedName, setImportedName] = useState<string | null>(null);

  const openPanel = () => { setForm(config); setOpen(true); };

  const runImport = async () => {
    if (!importUrl.trim() || importing) return;
    setImporting(true);
    setImportError(null);
    setImportedName(null);
    try {
      const res = await fetch("/api/scrape-hotel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: importUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setImportError(data.error || "Import impossible.");
        setImportImages([]);
        return;
      }
      setImportImages(data.images || []);
      if (data.hotelName) {
        setForm((f) => ({ ...f, hotelName: data.hotelName }));
        setImportedName(data.hotelName);
      }
      if (!data.images?.length && !data.hotelName) {
        setImportError("Rien d'exploitable n'a été trouvé sur cette page.");
      }
    } catch {
      setImportError("Import impossible (connexion ou site inaccessible).");
      setImportImages([]);
    } finally {
      setImporting(false);
    }
  };

  const handleSecretTap = () => {
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => { tapCount.current = 0; }, SECRET_WINDOW_MS);
    if (tapCount.current >= SECRET_TAPS) {
      tapCount.current = 0;
      openPanel();
    }
  };

  const save = () => {
    setConfig({
      ...form,
      room: Number(form.room) || defaultConfig.room,
      floor: Number(form.floor) || defaultConfig.floor,
      guests: Math.min(4, Math.max(1, Number(form.guests) || defaultConfig.guests)),
    });
    setOpen(false);
  };

  const resetDemo = () => {
    clearOrders();
    clearChats();
    setResetDone(true);
    setTimeout(() => setResetDone(false), 2000);
  };

  const updateItem = (id: string, patch: Partial<HotelInfoItem>) => {
    setForm((f) => ({ ...f, hotelInfo: f.hotelInfo.map((it) => (it.id === id ? { ...it, ...patch } : it)) }));
  };

  const applyImage = async (id: string, file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    const dataUrl = await compressImage(file);
    updateItem(id, { image: dataUrl });
  };

  const panel = open && (
    <div className="demo-overlay" onClick={() => setOpen(false)}>
      <div className="demo-panel" onClick={(e) => e.stopPropagation()}>
        <h3>Personnaliser pour cet hôtel</h3>
        <label>Nom de l&apos;hôtel<input value={form.hotelName} onChange={(e) => setForm({ ...form, hotelName: e.target.value })} /></label>
        <div className="demo-row">
          <label>Ville<input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></label>
          <label>Pays<input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></label>
        </div>
        <div className="demo-row">
          <label>Prénom client<input value={form.guestFirst} onChange={(e) => setForm({ ...form, guestFirst: e.target.value })} /></label>
          <label>Nom client<input value={form.guestLast} onChange={(e) => setForm({ ...form, guestLast: e.target.value })} /></label>
        </div>
        <div className="demo-row">
          <label>Chambre<input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value as unknown as number })} /></label>
          <label>Étage<input value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value as unknown as number })} /></label>
        </div>
        <div className="demo-row">
          <label>Nombre de personnes<input value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value as unknown as number })} /></label>
        </div>

        <h4>Importer depuis le site de l&apos;hôtel</h4>
        <div className="demo-import-row">
          <input
            placeholder="www.hotel-exemple.com"
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runImport()}
          />
          <button className="demo-btn outline" onClick={runImport} disabled={importing}>{importing ? "Recherche…" : "Récupérer"}</button>
        </div>
        {importError && <p className="demo-import-error">{importError}</p>}
        {importedName && <p className="demo-import-note">Nom détecté et appliqué : {importedName}</p>}
        {importImages.length > 0 && (
          <>
            <p className="demo-import-note">Glissez une photo sur une catégorie ci-dessous.</p>
            <div className="demo-import-gallery">
              {importImages.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={src}
                  alt=""
                  draggable
                  onDragStart={(e) => { e.dataTransfer.setData("text/plain", src); e.dataTransfer.effectAllowed = "copy"; }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              ))}
            </div>
          </>
        )}

        <h4>Infos hôtel (tablette)</h4>
        <div className="demo-hotelinfo-list">
          {form.hotelInfo.map((item) => (
            <div className="demo-hotelinfo-row" key={item.id}>
              <label className="demo-checkbox">
                <input type="checkbox" checked={item.enabled} onChange={(e) => updateItem(item.id, { enabled: e.target.checked })} />
                {item.title}
              </label>
              <input className="demo-hours-input" value={item.hours} onChange={(e) => updateItem(item.id, { hours: e.target.value })} />
              <div
                className="demo-drop-zone"
                style={item.image ? { backgroundImage: `url(${item.image})` } : undefined}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const url = e.dataTransfer.getData("text/plain");
                  if (url && /^https?:\/\//i.test(url)) { updateItem(item.id, { image: url }); return; }
                  applyImage(item.id, e.dataTransfer.files?.[0]);
                }}
                onClick={() => fileInputs.current[item.id]?.click()}
              >
                {!item.image && <span>+ Photo</span>}
              </div>
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                ref={(el) => { fileInputs.current[item.id] = el; }}
                onChange={(e) => applyImage(item.id, e.target.files?.[0])}
              />
              {item.image && <button className="demo-remove-photo" onClick={() => updateItem(item.id, { image: undefined })} aria-label="Retirer la photo">×</button>}
            </div>
          ))}
        </div>

        <div className="demo-actions">
          {isProd && <button className="demo-btn outline" onClick={resetDemo}>{resetDone ? "✓ Réinitialisée" : "↺ Réinitialiser la démo"}</button>}
          <button className="demo-btn outline" onClick={() => setOpen(false)}>Annuler</button>
          <button className="demo-btn" onClick={save}>Enregistrer</button>
        </div>
      </div>
    </div>
  );

  if (isProd) {
    return (
      <>
        <div className="demo-secret-zone" aria-hidden="true" onClick={handleSecretTap} />
        {panel}
      </>
    );
  }

  return (
    <div className="demo-controls">
      <button className="demo-link" onClick={openPanel}>⚙ Personnaliser l&apos;hôtel</button>
      <button className="demo-link" onClick={resetDemo}>{resetDone ? "✓ Démo réinitialisée" : "↺ Réinitialiser la démo"}</button>
      {panel}
    </div>
  );
}
