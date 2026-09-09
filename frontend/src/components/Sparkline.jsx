/** Last few contest results as a bare line. No axes: it is shape, not values. */
function Sparkline({ points, color, width = 72, height = 20 }) {
  if (!points || points.length < 2) {
    return (
      <svg width={width} height={height} aria-hidden="true">
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="#262b33"
          strokeWidth="1"
          strokeDasharray="2 3"
        />
      </svg>
    );
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const step = width / (points.length - 1);

  const d = points
    .map((value, index) => {
      const x = index * step;
      const y = height - 2 - ((value - min) / span) * (height - 4);
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} aria-hidden="true" className="overflow-visible">
      <path d={d} fill="none" stroke={color} strokeWidth="1.4" strokeLinejoin="round" opacity="0.85" />
      <circle
        cx={width}
        cy={height - 2 - ((points[points.length - 1] - min) / span) * (height - 4)}
        r="2"
        fill={color}
      />
    </svg>
  );
}

export default Sparkline;
