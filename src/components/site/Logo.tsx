export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative h-9 w-9 rounded-xl bg-hero flex items-center justify-center shadow-soft">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v18M3 12h18" />
        </svg>
      </div>
      <div className="leading-tight">
        <div className="font-display font-bold text-base tracking-tight">PharmaLink</div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Tunisia</div>
      </div>
    </div>
  );
}
