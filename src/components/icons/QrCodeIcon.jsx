export default function QrCodeIcon({ className = 'w-6 h-6' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Top-left corner */}
      <rect x="3" y="3" width="7" height="7" />
      <rect x="5" y="5" width="3" height="3" fill="currentColor" stroke="none" />

      {/* Top-right corner */}
      <rect x="14" y="3" width="7" height="7" />
      <rect x="16" y="5" width="3" height="3" fill="currentColor" stroke="none" />

      {/* Bottom-left corner */}
      <rect x="3" y="14" width="7" height="7" />
      <rect x="5" y="16" width="3" height="3" fill="currentColor" stroke="none" />

      {/* Data area dots */}
      <rect x="14" y="14" width="2" height="2" fill="currentColor" stroke="none" />
      <rect x="18" y="14" width="2" height="2" fill="currentColor" stroke="none" />
      <rect x="14" y="18" width="2" height="2" fill="currentColor" stroke="none" />
      <rect x="18" y="18" width="2" height="2" fill="currentColor" stroke="none" />
      <rect x="16" y="16" width="2" height="2" fill="currentColor" stroke="none" />
    </svg>
  );
}
