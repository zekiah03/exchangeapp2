export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-label="反転 ロゴ"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="hanten-axis" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fda4af" />
          <stop offset="50%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#6ee7b7" />
        </linearGradient>
      </defs>
      <rect x="4" y="30" width="56" height="4" rx="2" fill="url(#hanten-axis)" />
      <circle cx="8" cy="32" r="6" fill="#f43f5e" />
      <circle cx="56" cy="32" r="6" fill="#10b981" />
      <circle
        cx="32"
        cy="32"
        r="9"
        fill="#f59e0b"
        stroke="white"
        strokeWidth="2"
      />
    </svg>
  )
}
