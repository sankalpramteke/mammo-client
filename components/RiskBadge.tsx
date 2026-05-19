// RiskBadge — 5-level clinical risk classification component
// Based on malignant probability from AI model output

interface RiskBadgeProps {
  malignantProb: number; // 0–100
  showDescription?: boolean;
}

const RISK_LEVELS = [
  {
    level: 1,
    label: 'Very Low Risk',
    description: 'No immediate action required. Routine screening in 12 months.',
    bg: '#dcfce7', border: '#86efac', text: '#15803d', dot: '#16a34a',
    min: 0, max: 30,
  },
  {
    level: 2,
    label: 'Low Risk',
    description: 'Follow-up recommended in 6 months.',
    bg: '#cffafe', border: '#67e8f9', text: '#0e7490', dot: '#0891b2',
    min: 30, max: 45,
  },
  {
    level: 3,
    label: 'Moderate Risk',
    description: 'Borderline result. Clinical consultation advised.',
    bg: '#fef9c3', border: '#fde047', text: '#854d0e', dot: '#ca8a04',
    min: 45, max: 55,
  },
  {
    level: 4,
    label: 'High Risk',
    description: 'Biopsy recommended. Refer to specialist.',
    bg: '#ffedd5', border: '#fdba74', text: '#c2410c', dot: '#ea580c',
    min: 55, max: 75,
  },
  {
    level: 5,
    label: 'Critical',
    description: 'Immediate specialist referral required.',
    bg: '#fee2e2', border: '#fca5a5', text: '#991b1b', dot: '#dc2626',
    min: 75, max: 101,
  },
];

export default function RiskBadge({ malignantProb, showDescription = false }: RiskBadgeProps) {
  const risk = RISK_LEVELS.find(r => malignantProb >= r.min && malignantProb < r.max) || RISK_LEVELS[0];

  return (
    <div style={{ display: 'inline-block' }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: showDescription ? '10px 16px' : '5px 14px',
          background: risk.bg,
          border: `1.5px solid ${risk.border}`,
          borderRadius: 10,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* Dot indicator */}
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: risk.dot,
          flexShrink: 0,
        }} />

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 12, color: risk.text, letterSpacing: '0.3px' }}>
              LEVEL {risk.level}
            </span>
            <span style={{ fontWeight: 600, fontSize: 13, color: risk.text }}>
              {risk.label}
            </span>
          </div>
          {showDescription && (
            <p style={{ fontSize: 11, color: risk.text, opacity: 0.8, marginTop: 3 }}>
              {risk.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function getRiskLevel(malignantProb: number) {
  return RISK_LEVELS.find(r => malignantProb >= r.min && malignantProb < r.max) || RISK_LEVELS[0];
}
