type LogoProps = {
  variant?: 'full' | 'compact' | 'mark';
  tone?: 'light' | 'dark';
};

export function Logo({ variant = 'full', tone = 'light' }: LogoProps) {
  return (
    <span className={`brand brand-${variant} brand-${tone}`}>
      <svg className="brand-mark" viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="18" className="mark-plate" />
        <path d="M32 8.5c12.4 0 22.6 9.4 23.8 21.5H32V8.5z" className="mark-slice" />
        <path d="M14 36.5h36" className="mark-road" />
        <text x="32" y="46" textAnchor="middle" className="mark-letters">S&amp;G</text>
      </svg>
      {variant !== 'mark' && (
        <span className="brand-words">
          <span className="wordmark">
            <span>STOP</span>
            <span className="amp">&amp;</span>
            <span>GO</span>
          </span>
          {variant === 'full' && <span className="brand-sub">Pizza &amp; Doner</span>}
        </span>
      )}
    </span>
  );
}
