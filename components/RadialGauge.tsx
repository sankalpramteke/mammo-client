'use client';
import { useEffect, useState } from 'react';

interface RadialGaugeProps {
  benignProb: number;    // 0–100
  malignantProb: number; // 0–100
  size?: number;
}

export default function RadialGauge({ benignProb, malignantProb, size = 160 }: RadialGaugeProps) {
  const isMalignant = malignantProb > 50;

  // Show the dominant probability so the number matches the label
  const displayProb = isMalignant ? malignantProb : benignProb;
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(displayProb), 100);
    return () => clearTimeout(timer);
  }, [displayProb]);

  const radius = (size / 2) - 14;
  const circumference = 2 * Math.PI * radius;

  // Arc fill always represents the displayed (dominant) probability
  const arcOffset = circumference - (animated / 100) * circumference;
  const primaryColor = malignantProb > 75 ? '#dc2626'
    : malignantProb > 55 ? '#ea580c'
    : malignantProb > 45 ? '#ca8a04'
    : malignantProb > 30 ? '#0891b2'
    : '#16a34a';

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-block' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#e2e8f0" strokeWidth={12}
        />
        {/* Background fill (lighter) */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={isMalignant ? '#fee2e2' : '#dcfce7'} strokeWidth={12}
          strokeDasharray={circumference}
          strokeDashoffset={0}
          strokeLinecap="round"
        />
        {/* Dominant probability arc (animated) */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={primaryColor} strokeWidth={12}
          strokeDasharray={circumference}
          strokeDashoffset={arcOffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1), stroke 0.3s' }}
        />
      </svg>

      {/* Center label */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{
          fontSize: size > 130 ? 24 : 18,
          fontWeight: 800,
          color: isMalignant ? '#dc2626' : '#15803d',
          lineHeight: 1,
        }}>
          {Math.round(animated)}%
        </div>
        <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, marginTop: 3, letterSpacing: '0.4px' }}>
          {isMalignant ? 'MALIGNANT' : 'BENIGN'}
        </div>
      </div>
    </div>
  );
}
