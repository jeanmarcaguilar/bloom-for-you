const SHAPES: Record<string, { n: number; rx: number; ry: number; cy: number; center: string }> = {
  peony: { n: 14, rx: 14, ry: 24, cy: -22, center: "#F7D774" },
  rose: { n: 8, rx: 16, ry: 26, cy: -22, center: "#7A1236" },
  tulip: { n: 3, rx: 18, ry: 34, cy: -26, center: "#F7D774" },
  sunflower: { n: 16, rx: 7, ry: 24, cy: -30, center: "#5B3A1E" },
  daisy: { n: 12, rx: 7, ry: 22, cy: -26, center: "#F7C948" },
  lily: { n: 6, rx: 10, ry: 34, cy: -30, center: "#F5A623" },
  cherry_blossom: { n: 5, rx: 15, ry: 22, cy: -22, center: "#FFE8EE" },
  lavender: { n: 7, rx: 6, ry: 16, cy: -20, center: "#6B4E9B" },
  custom: { n: 6, rx: 12, ry: 26, cy: -24, center: "#F7D774" },
};

export default function FlowerSvg({ type, color, size = 160, animate = false }: { type: string; color: string; size?: number; animate?: boolean }) {
  const s = SHAPES[type] ?? SHAPES.custom;
  return (
    <svg viewBox="-60 -60 120 170" width={size} height={size * 1.4} role="img" aria-label={`${type.replace("_", " ")} flower`} className={animate ? "bloom" : undefined}>
      <path d="M0 0 C-4 30 4 60 0 105" stroke="#A8BFA5" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M0 70 C-22 60 -28 76 -30 80 C-14 84 -4 80 0 70Z" fill="#A8BFA5" />
      <g>
        {Array.from({ length: s.n }).map((_, i) => (
          <ellipse key={i} cx="0" cy={s.cy} rx={s.rx} ry={s.ry} fill={color} fillOpacity=".85" stroke="#fff" strokeOpacity=".5" transform={`rotate(${(360 / s.n) * i})`} />
        ))}
        <circle r={type === "sunflower" ? 14 : 8} fill={s.center} />
      </g>
    </svg>
  );
}
