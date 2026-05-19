// DishLayout — Shared layout wrapper for authenticated DISHA pages
import DishHeader from '@/components/DishHeader';
import DishNavbar from '@/components/DishNavbar';
import NewsTicker from '@/components/NewsTicker';

export default function DishLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <DishHeader />
      <NewsTicker />
      <DishNavbar />
      <main style={{ flex: 1, maxWidth: 1280, margin: '0 auto', width: '100%', padding: '24px 20px' }}>
        {children}
      </main>
      <footer style={{
        background: '#0f2744',
        borderTop: '2px solid #f59e0b',
        padding: '10px 20px',
        textAlign: 'center',
      }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'Inter, sans-serif' }}>
          © 2026 DISHA — Diagnostic Imaging &amp; Screening for Health Analytics &nbsp;|&nbsp; AI-assisted analysis only — not a substitute for radiologist diagnosis
        </p>
      </footer>
    </div>
  );
}
