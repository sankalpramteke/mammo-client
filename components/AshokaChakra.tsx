// Ashoka Chakra SVG used in government header
export default function AshokaChakra({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Ashoka Chakra"
    >
      {/* Outer circle */}
      <circle cx="50" cy="50" r="48" fill="none" stroke="#f7941d" strokeWidth="3" />
      {/* Inner circle */}
      <circle cx="50" cy="50" r="10" fill="none" stroke="#f7941d" strokeWidth="2" />
      {/* Center dot */}
      <circle cx="50" cy="50" r="3" fill="#f7941d" />
      {/* 24 spokes */}
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i * 360) / 24;
        const rad = (angle * Math.PI) / 180;
        const x1 = 50 + 10 * Math.cos(rad);
        const y1 = 50 + 10 * Math.sin(rad);
        const x2 = 50 + 44 * Math.cos(rad);
        const y2 = 50 + 44 * Math.sin(rad);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#f7941d"
            strokeWidth="1.5"
          />
        );
      })}
    </svg>
  );
}
