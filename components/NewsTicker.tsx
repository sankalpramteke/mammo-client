'use client';
export default function NewsTicker() {
  return (
    <div className="bg-gov-orange overflow-hidden py-1.5 relative" style={{ borderBottom: '2px solid #d97a0a' }}>
      <div className="flex items-center">
        <span
          className="bg-gov-navy text-white text-xs font-bold px-3 py-0.5 mr-3 shrink-0 z-10"
          style={{ letterSpacing: '0.5px' }}
        >
          NOTICE
        </span>
        <div className="overflow-hidden flex-1">
          <span className="ticker-content text-white text-xs font-semibold">
            Global model updated — Round 8 complete | Accuracy: 81.4% | New model deployed successfully
            &nbsp;&nbsp;&nbsp;★&nbsp;&nbsp;&nbsp;
            System operational | All nodes active | Next training round scheduled in 2 hours
            &nbsp;&nbsp;&nbsp;★&nbsp;&nbsp;&nbsp;
            FL Training Round 8/10 complete | Participating hospitals: 12 | Data privacy ensured via differential privacy
            &nbsp;&nbsp;&nbsp;★&nbsp;&nbsp;&nbsp;
            National Mammogram AI Detection System v2.1 — Ministry of Health &amp; Family Welfare, Government of India
          </span>
        </div>
      </div>
    </div>
  );
}
