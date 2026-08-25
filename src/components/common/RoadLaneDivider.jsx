export default function RoadLaneDivider({ className = "", style = {} }) {
  return (
    <div className={`road-lane-track ${className}`} style={style}>
      {/* Animated moving dashed asphalt lane */}
      <div className="road-lane-line" />

      {/* Mini cruising sports car driving along the lane line */}
      <div className="road-mini-car">
        {/* Forward headlight light cone beam */}
        <div className="mini-car-headlight-beam" />

        {/* Mini Vector Car (side profile) */}
        <svg
          viewBox="0 0 46 16"
          width="42"
          height="15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mini-car-svg"
        >
          {/* Car Body Aerodynamic Silhouette */}
          <path
            d="M3 10 C3 8.5, 6 7, 10 6.5 L16 3.5 C19 2, 28 2, 33 4.5 L39 7 C42 7.5, 45 8.5, 45 10.5 C45 11.5, 44 12, 41 12 L38 12 C37 10, 33 10, 32 12 L18 12 C17 10, 13 10, 12 12 L5 12 C3.5 12, 3 11, 3 10 Z"
            fill="#1c222c"
            stroke="var(--signal)"
            strokeWidth="1.2"
          />

          {/* Roof & Windshield Glass */}
          <path
            d="M17 6.5 L19.5 4 C21.5 3, 27.5 3, 31 5 L35 6.5 Z"
            fill="#ffb020"
            fillOpacity="0.35"
            stroke="#ffb020"
            strokeWidth="0.8"
          />

          {/* Front Projector Headlight Lens */}
          <circle cx="43.5" cy="9.5" r="1.6" fill="#ffffff" />
          <path d="M43 8.5 L45 9.5 L43 10.5 Z" fill="#ffb020" />

          {/* Rear Tail Light Glow */}
          <rect x="3" y="8" width="2" height="2.5" rx="0.5" fill="#ff4d4d" />

          {/* Front Wheel */}
          <circle cx="35" cy="12" r="2.8" fill="#0b0e14" stroke="#ffb020" strokeWidth="1" />
          <circle cx="35" cy="12" r="1" fill="#ffffff" />

          {/* Rear Wheel */}
          <circle cx="15" cy="12" r="2.8" fill="#0b0e14" stroke="#ffb020" strokeWidth="1" />
          <circle cx="15" cy="12" r="1" fill="#ffffff" />
        </svg>

        {/* Tail Light Red Trail / Exhaust Glow */}
        <div className="mini-car-tail-glow" />
      </div>
    </div>
  );
}
