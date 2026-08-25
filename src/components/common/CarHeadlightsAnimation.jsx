import { useState, useEffect } from "react";

export default function CarHeadlightsAnimation() {
  const [stage, setStage] = useState(0); // 0: off/entering, 1: DRL on, 2: Headlights ignition, 3: Full beams & steady
  const [highBeam, setHighBeam] = useState(false);
  const [hazard, setHazard] = useState(false);

  useEffect(() => {
    // Sequence timing
    const t1 = setTimeout(() => setStage(1), 400);   // DRL ignites
    const t2 = setTimeout(() => setStage(2), 1000);  // Xenon projector startup flash
    const t3 = setTimeout(() => setStage(3), 1600);  // Beams steady & glowing
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  function handleFlash() {
    setHighBeam(true);
    setTimeout(() => setHighBeam(false), 350);
  }

  function toggleHazard() {
    setHazard((prev) => !prev);
  }

  const isDrl = stage >= 1;
  const isLightsOn = stage >= 2;
  const isSteady = stage >= 3;

  return (
    <div className="car-anim-wrapper">
      <div className={`car-scene ${isSteady ? "car-scene--ready" : ""}`}>
        {/* Ground illumination beam */}
        <div
          className={`car-light-beams ${isLightsOn ? "car-light-beams--on" : ""} ${highBeam ? "car-light-beams--high" : ""}`}
        />

        {/* The Vector Car Front */}
        <svg
          viewBox="0 0 520 230"
          className={`car-svg ${stage > 0 ? "car-svg--visible" : ""}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="bodyGrad" x1="260" y1="40" x2="260" y2="210" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2a303c" />
              <stop offset="40%" stopColor="#1a1e26" />
              <stop offset="100%" stopColor="#0f1217" />
            </linearGradient>

            <linearGradient id="hoodHighlight" x1="260" y1="70" x2="260" y2="140" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#404859" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#1f242d" stopOpacity="0.2" />
            </linearGradient>

            <linearGradient id="windshieldGrad" x1="260" y1="30" x2="260" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0b0e13" />
              <stop offset="60%" stopColor="#151b24" />
              <stop offset="100%" stopColor="#252f3e" />
            </linearGradient>

            <linearGradient id="grilleGrad" x1="260" y1="140" x2="260" y2="195" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0a0c0f" />
              <stop offset="100%" stopColor="#141820" />
            </linearGradient>

            <radialGradient id="xenonGlowLeft" cx="130" cy="140" r="70" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="25%" stopColor="#ffb020" stopOpacity="0.85" />
              <stop offset="65%" stopColor="#ff9000" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ff9000" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="xenonGlowRight" cx="390" cy="140" r="70" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="25%" stopColor="#ffb020" stopOpacity="0.85" />
              <stop offset="65%" stopColor="#ff9000" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ff9000" stopOpacity="0" />
            </radialGradient>

            {/* Filter Glows */}
            <filter id="drlGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="intenseGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur2" />
              <feMerge>
                <feMergeNode in="blur1" />
                <feMergeNode in="blur2" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Roof & Windshield */}
          <path
            d="M175 75 C190 38, 330 38, 345 75 L375 105 L145 105 Z"
            fill="url(#windshieldGrad)"
            stroke="#3a4252"
            strokeWidth="1.5"
          />
          {/* Windshield glare line */}
          <path d="M190 55 Q 260 46 330 55" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M210 70 Q 260 62 310 70" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeLinecap="round" />

          {/* Rearview mirrors */}
          <path d="M130 92 C115 88, 105 95, 115 104 C125 110, 140 102, 140 96 Z" fill="#1b2028" stroke="#373e4b" strokeWidth="1" />
          <path d="M390 92 C405 88, 415 95, 405 104 C395 110, 380 102, 380 96 Z" fill="#1b2028" stroke="#373e4b" strokeWidth="1" />
          {/* Mirror Turn Signals */}
          <path
            d="M112 96 L124 101"
            stroke={hazard ? "#ff9f1a" : "rgba(255,160,30,0.3)"}
            strokeWidth="2"
            strokeLinecap="round"
            className={hazard ? "turn-signal-flash" : ""}
          />
          <path
            d="M408 96 L396 101"
            stroke={hazard ? "#ff9f1a" : "rgba(255,160,30,0.3)"}
            strokeWidth="2"
            strokeLinecap="round"
            className={hazard ? "turn-signal-flash" : ""}
          />

          {/* Main Car Body & Fender Arches */}
          <path
            d="M60 178 C60 148, 90 120, 138 112 L180 106 C210 100, 310 100, 340 106 L382 112 C430 120, 460 148, 460 178 C460 198, 440 206, 400 208 L120 208 C80 206, 60 198, 60 178 Z"
            fill="url(#bodyGrad)"
            stroke="#3a4252"
            strokeWidth="1.5"
          />

          {/* Hood Sculpted Character Creases */}
          <path d="M165 106 Q 195 142 205 158" stroke="url(#hoodHighlight)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M355 106 Q 325 142 315 158" stroke="url(#hoodHighlight)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M225 106 L228 152" stroke="#2c3340" strokeWidth="1.5" />
          <path d="M295 106 L292 152" stroke="#2c3340" strokeWidth="1.5" />

          {/* Lower Front Lip & Aero Splitter */}
          <path
            d="M80 200 L120 204 L400 204 L440 200 L448 212 L396 216 L124 216 L72 212 Z"
            fill="#0a0c10"
            stroke="#2b313d"
            strokeWidth="1"
          />
          {/* Carbon splitter accents */}
          <path d="M140 215 L144 206" stroke="var(--signal)" strokeWidth="1.5" />
          <path d="M380 215 L376 206" stroke="var(--signal)" strokeWidth="1.5" />

          {/* Central Air Intake / Grille */}
          <polygon
            points="180,162 340,162 360,198 160,198"
            fill="url(#grilleGrad)"
            stroke="#262c38"
            strokeWidth="1.5"
          />
          {/* Grille Honeycomb Mesh Lines */}
          <line x1="175" y1="172" x2="345" y2="172" stroke="#1c212b" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="168" y1="182" x2="352" y2="182" stroke="#1c212b" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="163" y1="192" x2="357" y2="192" stroke="#1c212b" strokeWidth="1" strokeDasharray="3 3" />

          {/* Glowing Brand Emblem */}
          <circle cx="260" cy="155" r="9" fill="#141820" stroke={isDrl ? "var(--signal)" : "#3a4252"} strokeWidth="1.5" />
          <path
            d="M255 158 L260 150 L265 158 M257 154 L263 154"
            stroke={isDrl ? "var(--signal)" : "#6a7282"}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Side Air Inlets / Fog lamp recesses */}
          <polygon points="85,170 145,168 152,196 90,194" fill="#0c0e12" stroke="#1e242e" strokeWidth="1" />
          <polygon points="435,170 375,168 368,196 430,194" fill="#0c0e12" stroke="#1e242e" strokeWidth="1" />

          {/* Lower DRL Fog Light Accent Bars */}
          <path
            d="M95 186 L135 186"
            stroke={isDrl ? "var(--signal)" : "#2a303c"}
            strokeWidth="2.5"
            strokeLinecap="round"
            filter={isDrl ? "url(#drlGlow)" : undefined}
            className={isDrl ? "light-pulse" : ""}
          />
          <path
            d="M425 186 L385 186"
            stroke={isDrl ? "var(--signal)" : "#2a303c"}
            strokeWidth="2.5"
            strokeLinecap="round"
            filter={isDrl ? "url(#drlGlow)" : undefined}
            className={isDrl ? "light-pulse" : ""}
          />

          {/* ==========================================================
              HEADLIGHT HOUSINGS & DRL BARS
              ========================================================== */}
          {/* Left Headlight Housing Frame */}
          <path
            d="M95 142 C115 130, 160 134, 185 145 C180 158, 140 162, 100 156 Z"
            fill="#090b0e"
            stroke="#303746"
            strokeWidth="1.5"
          />
          {/* Right Headlight Housing Frame */}
          <path
            d="M425 142 C405 130, 360 134, 335 145 C340 158, 380 162, 420 156 Z"
            fill="#090b0e"
            stroke="#303746"
            strokeWidth="1.5"
          />

          {/* Left Signature DRL Wing/Blade (Daytime Running Light) */}
          <path
            d="M98 142 C120 132, 160 136, 180 144"
            stroke={isDrl ? (highBeam ? "#ffffff" : "var(--signal)") : "#262b36"}
            strokeWidth={isDrl ? "3.5" : "2"}
            strokeLinecap="round"
            filter={isDrl ? "url(#drlGlow)" : undefined}
            className={isDrl ? "drl-ignited" : ""}
          />
          <path
            d="M102 152 C125 158, 165 154, 178 146"
            stroke={isDrl ? (highBeam ? "#ffffff" : "var(--signal)") : "#262b36"}
            strokeWidth={isDrl ? "2.5" : "1.5"}
            strokeLinecap="round"
            filter={isDrl ? "url(#drlGlow)" : undefined}
          />

          {/* Right Signature DRL Wing/Blade */}
          <path
            d="M422 142 C400 132, 360 136, 340 144"
            stroke={isDrl ? (highBeam ? "#ffffff" : "var(--signal)") : "#262b36"}
            strokeWidth={isDrl ? "3.5" : "2"}
            strokeLinecap="round"
            filter={isDrl ? "url(#drlGlow)" : undefined}
            className={isDrl ? "drl-ignited" : ""}
          />
          <path
            d="M418 152 C395 158, 355 154, 342 146"
            stroke={isDrl ? (highBeam ? "#ffffff" : "var(--signal)") : "#262b36"}
            strokeWidth={isDrl ? "2.5" : "1.5"}
            strokeLinecap="round"
            filter={isDrl ? "url(#drlGlow)" : undefined}
          />

          {/* ==========================================================
              XENON DUAL PROJECTORS & HIGH BEAM GLOW
              ========================================================== */}
          {/* Left Projectors */}
          <circle cx="126" cy="146" r="7" fill={isLightsOn ? "#ffffff" : "#1a1f29"} stroke="#3e4758" strokeWidth="1.5" />
          <circle cx="152" cy="148" r="6" fill={isLightsOn ? "#ffffff" : "#141820"} stroke="#3e4758" strokeWidth="1" />

          {/* Right Projectors */}
          <circle cx="394" cy="146" r="7" fill={isLightsOn ? "#ffffff" : "#1a1f29"} stroke="#3e4758" strokeWidth="1.5" />
          <circle cx="368" cy="148" r="6" fill={isLightsOn ? "#ffffff" : "#141820"} stroke="#3e4758" strokeWidth="1" />

          {/* Intense Xenon Projector Flares & Rings (When Headlights ON) */}
          {isLightsOn && (
            <g className={`headlight-glow-group ${highBeam ? "headlight-glow-group--high" : ""}`}>
              {/* Left Halo & Flare */}
              <circle cx="126" cy="146" r="18" fill="url(#xenonGlowLeft)" filter="url(#intenseGlow)" opacity="0.95" />
              <circle cx="126" cy="146" r="6" fill="#ffffff" filter="url(#drlGlow)" />
              <circle cx="152" cy="148" r="12" fill="url(#xenonGlowLeft)" opacity="0.6" />
              <circle cx="152" cy="148" r="4" fill="#fff" />

              {/* Right Halo & Flare */}
              <circle cx="394" cy="146" r="18" fill="url(#xenonGlowRight)" filter="url(#intenseGlow)" opacity="0.95" />
              <circle cx="394" cy="146" r="6" fill="#ffffff" filter="url(#drlGlow)" />
              <circle cx="368" cy="148" r="12" fill="url(#xenonGlowRight)" opacity="0.6" />
              <circle cx="368" cy="148" r="4" fill="#fff" />

              {/* Beam Horizontal Flare Anamorphic Streak */}
              <ellipse cx="130" cy="146" rx="55" ry="3.5" fill="#fff" opacity={highBeam ? "0.95" : "0.75"} filter="url(#drlGlow)" />
              <ellipse cx="390" cy="146" rx="55" ry="3.5" fill="#fff" opacity={highBeam ? "0.95" : "0.75"} filter="url(#drlGlow)" />
            </g>
          )}

          {/* Turn Signal Indicators (Hazard Mode) */}
          {hazard && (
            <g className="turn-signal-flash">
              <circle cx="98" cy="144" r="5" fill="#ff9f1a" filter="url(#drlGlow)" />
              <circle cx="422" cy="144" r="5" fill="#ff9f1a" filter="url(#drlGlow)" />
            </g>
          )}
        </svg>

        {/* Dynamic Road Reflection Flare */}
        <div className={`road-reflection ${isLightsOn ? "road-reflection--active" : ""}`} />
      </div>

      {/* Interactive Micro-Controls for Wow Factor */}
      <div className="car-anim-controls">
        <button
          type="button"
          className="btn btn-outline btn-sm car-control-btn"
          onClick={handleFlash}
          title="Nhấp để nháy đèn pha"
        >
          ⚡ Nháy đèn pha
        </button>
        <button
          type="button"
          className={`btn btn-outline btn-sm car-control-btn ${hazard ? "car-control-btn--active" : ""}`}
          onClick={toggleHazard}
          title="Bật/Tắt đèn xi-nhan khẩn cấp"
        >
          🚨 {hazard ? "Tắt xi-nhan" : "Đèn ưu tiên"}
        </button>
      </div>
    </div>
  );
}
