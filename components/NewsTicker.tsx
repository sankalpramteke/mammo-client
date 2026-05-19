// NewsTicker — Persistent status bar showing DISHA model & network stats
export default function NewsTicker() {
  const items = [
    '🔬 DISHA AI Model v2.0 — ResNet101 architecture',
    '🎯 Validation Accuracy: 92.1% on CBIS-DDSM dataset',
    '🏥 3 hospital nodes active in the federated network',
    '🔒 Federated Learning — patient data never leaves the hospital',
    '📊 10,556 mammogram samples trained across 15 FL rounds',
    '⚡ Average inference time: <2 seconds per scan',
    '🎗️ Early detection saves lives — screen regularly',
  ];
  const text = items.join('   ·   ');

  return (
    <div style={{
      background: '#0f2744',
      borderBottom: '1px solid rgba(245,158,11,0.25)',
      overflow: 'hidden',
      height: 28,
      display: 'flex',
      alignItems: 'center',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
        padding: '0 12px',
        background: '#f59e0b',
        height: '100%',
        fontSize: 10,
        fontWeight: 800,
        color: '#0f2744',
        letterSpacing: '0.8px',
        fontFamily: 'Inter, sans-serif',
        whiteSpace: 'nowrap',
      }}>
        LIVE
      </div>
      <div style={{ overflow: 'hidden', flex: 1 }}>
        <span
          className="ticker-content"
          style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.65)',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            letterSpacing: '0.2px',
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
}
