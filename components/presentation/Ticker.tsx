const isArabic = (s: string) => /[؀-ۿ]/.test(s);

export default function Ticker({ items }: { items: string[] }) {
  return (
    <div className="pr-ticker">
      <div className="pr-ticker-track">
        {[0, 1].map((k) => (
          <ul key={k} aria-hidden={k === 1 ? true : undefined}>
            {items.map((item) => (
              <li key={item}>
                <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M4.5 10.5l3.6 3.6 7.4-7.8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span lang={isArabic(item) ? "ar" : undefined} dir={isArabic(item) ? "rtl" : undefined}>{item}</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
