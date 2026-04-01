import React from 'react';

// ── Paper plane ───────────────────────────────────────────────────────────────
interface PaperPlaneProps { x: number; y: number; size?: number; delay: number; rotate?: number; }

export const PaperPlane = ({ x, y, size = 1, delay, rotate = 15 }: PaperPlaneProps) => (
  <g transform={`translate(${x},${y}) rotate(${rotate}) scale(${size})`}
    style={{ animation: `planeFloat 5s ease-in-out infinite ${delay}s` }}>
    <path d="M-12 0 L0 -8 L12 0 L0 8 Z" fill="rgba(255,220,160,0.65)" stroke="rgba(255,200,150,0.4)" strokeWidth="1" />
    <line x1="0" y1="-8" x2="0" y2="8" stroke="rgba(255,200,150,0.3)" strokeWidth="1" strokeDasharray="2 2" />
  </g>
);

// ── Skyscraper ────────────────────────────────────────────────────────────────
interface SkyscraperProps { x: number; height: number; width?: number; windows: number; delay: number; }

const BUILDING_COLORS = [
  'rgba(100,70,50,0.75)', 'rgba(110,75,55,0.8)',  'rgba(90,65,45,0.7)',
  'rgba(120,85,60,0.75)', 'rgba(105,72,52,0.8)',
];

export const Skyscraper = ({ x, height, width = 30, windows, delay }: SkyscraperProps) => {
  const color         = BUILDING_COLORS[x % BUILDING_COLORS.length];
  const windowColor   = 'rgba(255,200,120,0.7)';
  const windowSpacing = height / (windows + 1);

  return (
    <g transform={`translate(${x}, 320)`} style={{ animation: `buildingGlow ${4 + delay}s ease-in-out infinite ${delay}s` }}>
      <rect x={-width / 2} y={-height} width={width} height={height} fill={color} rx="2" />
      <rect x={-width / 2} y={-height} width="4" height={height} fill="rgba(255,180,100,0.25)" />
      {Array.from({ length: windows }).map((_, i) => (
        <g key={i}>
          <rect x={-width / 2 + 5}  y={-height + (i + 1) * windowSpacing - 4} width="6" height="6" fill={windowColor} rx="1" style={{ animation: `windowTwinkle ${3 + i * 0.4}s ease-in-out infinite ${i * 0.2}s` }} />
          <rect x={-width / 2 + 18} y={-height + (i + 1) * windowSpacing - 4} width="6" height="6" fill={windowColor} rx="1" style={{ animation: `windowTwinkle ${3 + i * 0.5}s ease-in-out infinite ${i * 0.3}s` }} />
        </g>
      ))}
      <line x1="0" y1={-height} x2="0" y2={-height - 12} stroke="rgba(200,140,80,0.6)" strokeWidth="1.5" />
      <circle cx="0" cy={-height - 15} r="2" fill="rgba(255,150,80,0.6)" style={{ animation: 'antennaBlink 2s ease-in-out infinite' }} />
    </g>
  );
};

// ── Bridge ────────────────────────────────────────────────────────────────────
interface BridgeProps { x: number; span: number; delay: number; }

export const Bridge = ({ x, span, delay }: BridgeProps) => (
  <g transform={`translate(${x}, 300)`} style={{ animation: `bridgeLight ${6 + delay}s ease-in-out infinite` }}>
    <path d={`M0 0 Q${span / 4} -10 ${span / 2} 0 Q${span * 3 / 4} 10 ${span} 0`} fill="none" stroke="rgba(255,180,120,0.4)" strokeWidth="3" strokeDasharray="8 8" />
    {[0, span / 4, span / 2, span * 3 / 4, span].map((pos, i) => (
      <circle key={i} cx={pos} cy="0" r="3" fill="rgba(255,160,80,0.7)" style={{ animation: `bridgeLightPulse ${3 + i * 0.5}s infinite` }} />
    ))}
  </g>
);