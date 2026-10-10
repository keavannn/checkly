export function CheckGlyph({ size = 30 }: { size?: number }) {
  return (
    <svg className="pr-glyph" viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="currentColor" />
      <path d="M9 16.5l4.8 4.8L23.2 11" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CheckCircle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
      <circle cx="10" cy="10" r="8.25" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6.2 10.4l2.5 2.5 5-5.3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DashedCircle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
      <circle cx="10" cy="10" r="8.25" fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2.2 2.6" />
    </svg>
  );
}

export function Arrow({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <path d="M4 10h11M10.5 5.2L15.3 10l-4.8 4.8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
