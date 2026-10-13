export default function HatArt({ color, accent, label, large = false }: { color: string; accent: string; label?: string; large?: boolean }) {
  return (
    <svg className={large ? "hat-art hat-art-large" : "hat-art"} viewBox="0 0 360 270" role="img" aria-label={`${label ?? "모자"} 상품 이미지`}>
      <defs>
        <filter id={`shadow-${color.replace("#", "")}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="9" stdDeviation="8" floodOpacity=".18" />
        </filter>
        <linearGradient id={`cap-${color.replace("#", "")}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={accent} stopOpacity=".8" />
          <stop offset=".35" stopColor={color} />
          <stop offset="1" stopColor={color} stopOpacity=".86" />
        </linearGradient>
      </defs>
      <ellipse cx="180" cy="225" rx="118" ry="20" fill="#0b0b0b" opacity=".09" />
      <g filter={`url(#shadow-${color.replace("#", "")})`}>
        <path d="M82 166c4-76 45-119 105-119 58 0 94 43 96 119-50 18-150 18-201 0Z" fill={`url(#cap-${color.replace("#", "")})`} />
        <path d="M187 47c3 42 3 81 0 118" stroke="#fff" strokeOpacity=".22" strokeWidth="2" fill="none" />
        <path d="M103 91c28 18 140 18 160 0" stroke="#fff" strokeOpacity=".1" strokeWidth="2" fill="none" />
        <path d="M83 166c57 13 138 12 199 0 25 10 43 25 49 46-75 23-196 26-281-4 3-18 14-32 33-42Z" fill={color} />
        <path d="M58 201c86 24 191 20 265 3" stroke={accent} strokeOpacity=".55" strokeWidth="3" fill="none" />
        <path d="M154 104c16-10 49-10 65 0v38c-18 8-48 8-65 0Z" fill="#fff" opacity=".92" />
        <text x="186" y="130" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="21" fill={color}>DSB</text>
        <circle cx="187" cy="46" r="5" fill={accent} />
      </g>
    </svg>
  );
}
