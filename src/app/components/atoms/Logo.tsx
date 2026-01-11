interface LogoProps {
  width?: number;
  height?: number;
}

export const Logo = ({ width = 50, height = 50 }: LogoProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 320"
      width={width}
      height={height}
    >
      {/* Central Symbol Only: Hourglass / Veil Shape */}
      <g transform="translate(160,160) scale(1,1)">
        {/* Outer glow (circle for perfect ratio) */}
        <circle r="150" fill="none" stroke="#c7bdb3" strokeWidth="8" />
        {/* Hourglass core (symmetrical within square) */}
        <path
          d="M-60,-150 Q0,-90 60,-150 Q0,-20 -60,-150 Z M-60,150 Q0,90 60,150 Q0,20 -60,150 Z"
          fill="none"
          stroke="#e2d6b3"
          strokeWidth="8"
        />
        {/* Veil-like shimmer (balanced vertically and horizontally) */}
        <path
          d="M-40,-150 C0,-100 0,100 -40,150"
          stroke="#a09588"
          strokeWidth="8"
          fill="none"
        />
        <path
          d="M40,-150 C0,-100 0,100 40,150"
          stroke="#a09588"
          strokeWidth="8"
          fill="none"
        />
      </g>
    </svg>
  );
};
