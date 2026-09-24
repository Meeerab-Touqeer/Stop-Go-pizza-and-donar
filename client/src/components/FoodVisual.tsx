import { useId } from 'react';

type FoodVisualProps = {
  image: string;
  name: string;
  className?: string;
};

export function FoodVisual({ image, name, className }: FoodVisualProps) {
  if (image.startsWith('/')) {
    return <img src={image} alt={name} className={className} />;
  }
  const kind = image.split(':')[1] || 'pepperoni';
  return (
    <span className={`art ${className || ''}`} role="img" aria-label={name}>
      {image.startsWith('burger') ? <BurgerArt kind={kind} /> : null}
      {image.startsWith('fries') ? <FriesArt /> : null}
      {image.startsWith('drink') ? <DrinkArt kind={kind} /> : null}
      {image.startsWith('dessert') ? <DessertArt kind={kind} /> : null}
      {image.startsWith('side') ? <SideArt kind={kind} /> : null}
      {(image.startsWith('pizza') || image.startsWith('deal')) && <PizzaArt kind={kind} />}
    </span>
  );
}

function PizzaArt({ kind }: { kind: string }) {
  const id = useId().replace(/:/g, '');
  const pepperoni = kind === 'pepperoni' || kind === 'feast' || kind === 'custom';
  const basil = kind === 'margherita' || kind === 'cheese' || kind === 'custom';
  const chicken = kind === 'chicken';
  const bbq = kind === 'bbq';
  return (
    <svg viewBox="0 0 200 200" className="art-svg">
      <defs>
        <radialGradient id={`${id}-c`} cx="48%" cy="42%" r="62%">
          <stop offset="0%" stopColor="#ffe7a8" />
          <stop offset="55%" stopColor={bbq ? '#e0a15a' : '#f2c14e'} />
          <stop offset="100%" stopColor={bbq ? '#b86a32' : '#e09a34'} />
        </radialGradient>
        <radialGradient id={`${id}-r`} cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="#e2a45a" />
          <stop offset="100%" stopColor="#a86b32" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="104" r="78" fill="rgba(0,0,0,.28)" />
      <circle cx="100" cy="100" r="92" fill={`url(#${id}-r)`} />
      <circle cx="100" cy="100" r="76" fill={`url(#${id}-c)`} />
      <circle cx="100" cy="100" r="76" fill="none" stroke="rgba(255,236,190,.35)" strokeWidth="3" />
      {pepperoni && [[58, 78], [96, 62], [138, 84], [70, 118], [112, 108], [146, 126], [86, 146], [128, 150]].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <ellipse cx={x} cy={y} rx="16" ry="14" fill="#b42318" />
          <ellipse cx={x - 3} cy={y - 3} rx="6" ry="4" fill="#e06a55" opacity=".7" />
        </g>
      ))}
      {chicken && [[70, 90], [112, 74], [140, 112], [84, 132], [124, 142]].map(([x, y]) => (
        <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="18" ry="11" fill="#e7c29a" transform={`rotate(${x} ${x} ${y})`} />
      ))}
      {bbq && [[74, 96], [118, 80], [138, 122], [90, 140]].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="22" height="10" rx="4" fill="#7a3b28" transform={`rotate(${y / 8} ${x} ${y})`} />
      ))}
      {basil && [[120, 70], [64, 108], [150, 120], [96, 150]].map(([x, y]) => (
        <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="10" ry="5" fill="#2f6b3a" transform={`rotate(-30 ${x} ${y})`} />
      ))}
      {kind === 'cheese' && <ellipse cx="100" cy="100" rx="48" ry="40" fill="#fff1c2" opacity=".45" />}
    </svg>
  );
}

function BurgerArt({ kind }: { kind: string }) {
  const spicy = kind === 'chicken';
  return (
    <svg viewBox="0 0 200 200" className="art-svg">
      <ellipse cx="100" cy="168" rx="62" ry="10" fill="rgba(0,0,0,.25)" />
      <path d="M46 92c0-28 24-46 54-46s54 18 54 46v8H46v-8z" fill="#e1b15a" />
      <path d="M52 78c8-16 28-24 48-24 18 0 36 8 46 22" fill="none" stroke="#f3d48a" strokeWidth="4" />
      <rect x="44" y="102" width="112" height="14" rx="6" fill={spicy ? '#f0d2a4' : '#6b3a28'} />
      <rect x="44" y="118" width="112" height="10" rx="4" fill="#3f7a3a" />
      <rect x="48" y="130" width="104" height="16" rx="6" fill={spicy ? '#d4542e' : '#8a4a2c'} />
      <path d="M42 150c6 16 22 24 58 24s52-8 58-24H42z" fill="#c9843a" />
    </svg>
  );
}

function FriesArt() {
  return (
    <svg viewBox="0 0 200 200" className="art-svg">
      <ellipse cx="100" cy="168" rx="50" ry="10" fill="rgba(0,0,0,.25)" />
      <path d="M58 150l10-70h64l10 70H58z" fill="#d7d2cb" />
      {[70, 86, 102, 118, 134].map((x, i) => (
        <rect key={x} x={x} y={48 + (i % 2) * 10} width="12" height="78" rx="6" fill={i % 2 ? '#f0b429' : '#e39a3c'} />
      ))}
    </svg>
  );
}

function DrinkArt({ kind }: { kind: string }) {
  const color = kind === 'cola' ? '#4a2a24' : kind === 'ayran' ? '#f4efe6' : '#a3203a';
  return (
    <svg viewBox="0 0 200 200" className="art-svg">
      <ellipse cx="100" cy="170" rx="36" ry="8" fill="rgba(0,0,0,.25)" />
      <path d="M70 58h60l-8 104H78L70 58z" fill={color} />
      <path d="M74 70h52" stroke="rgba(255,255,255,.35)" strokeWidth="6" />
      <rect x="64" y="46" width="72" height="12" rx="4" fill="#e7dfd2" />
      {kind === 'cooler' && <circle cx="118" cy="40" r="8" fill="#8fb573" />}
    </svg>
  );
}

function DessertArt({ kind }: { kind: string }) {
  if (kind === 'lava') {
    return (
      <svg viewBox="0 0 200 200" className="art-svg">
        <ellipse cx="100" cy="150" rx="48" ry="16" fill="#5a342c" />
        <path d="M62 86c0 40 16 62 38 62s38-22 38-62c-12 10-24 8-38-4-14 12-26 14-38 4z" fill="#3a241e" />
        <ellipse cx="100" cy="92" rx="16" ry="8" fill="#6b2a22" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 200 200" className="art-svg">
      <path d="M48 140l52-78 52 78H48z" fill="#e7c27a" />
      <path d="M70 140l30-46 30 46H70z" fill="#c9843a" />
      <circle cx="100" cy="78" r="6" fill="#7d9a4a" />
    </svg>
  );
}

function SideArt({ kind }: { kind: string }) {
  if (kind === 'salad') {
    return (
      <svg viewBox="0 0 200 200" className="art-svg">
        <ellipse cx="100" cy="118" rx="70" ry="36" fill="#efe6d6" />
        <ellipse cx="78" cy="108" rx="26" ry="16" fill="#3f7a3a" />
        <ellipse cx="118" cy="100" rx="28" ry="18" fill="#2f6b3a" />
        <circle cx="132" cy="124" r="10" fill="#c4452d" />
        <circle cx="96" cy="128" r="7" fill="#e07a3d" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 200 200" className="art-svg">
      <ellipse cx="100" cy="150" rx="54" ry="12" fill="rgba(0,0,0,.2)" />
      <rect x="46" y="92" width="108" height="28" rx="14" fill="#e1b15a" />
      <rect x="54" y="100" width="92" height="8" rx="4" fill="#f3d48a" />
    </svg>
  );
}
