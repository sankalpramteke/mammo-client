'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSession, clearSession } from '@/lib/auth';

export default function DishHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [doctorName, setDoctorName] = useState('');
  const [hospital, setHospital] = useState('');

  useEffect(() => {
    const s = getSession();
    if (s) {
      setDoctorName(s.name || s.doctorId || '');
      setHospital(s.hospitalName || '');
    } else {
      setDoctorName('');
      setHospital('');
    }
  }, [pathname]);

  const handleLogout = () => {
    clearSession();
    router.push('/');
  };

  return (
    <header style={{
      background: 'linear-gradient(90deg, #0f2744 0%, #1a3a6b 100%)',
      borderBottom: '3px solid #f59e0b',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Left: DISHA Logo + Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Hexagon Logo */}
          <svg width="42" height="42" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.5" />
            <circle cx="24" cy="24" r="17" stroke="#f59e0b" strokeWidth="2" fill="rgba(245,158,11,0.1)" />
            <path d="M 24 7 A 17 17 0 0 1 41 24" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <line x1="24" y1="2" x2="24" y2="6" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="46" y1="24" x2="42" y2="24" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="24" y1="46" x2="24" y2="42" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="2" y1="24" x2="6" y2="24" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
            <text x="24" y="29" textAnchor="middle" fill="#f59e0b" fontSize="14" fontWeight="800" fontFamily="Inter,sans-serif">D</text>
          </svg>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 18, letterSpacing: '-0.3px', lineHeight: 1 }}>
              DISHA
            </div>
            <div style={{ color: 'rgba(245,158,11,0.85)', fontSize: 10, fontWeight: 500, letterSpacing: '0.4px', marginTop: 2 }}>
              Diagnostic Imaging &amp; Screening for Health Analytics
            </div>
          </div>
        </div>

        {/* Right: User info or Login */}
        {doctorName ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Avatar circle */}
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(245,158,11,0.2)',
              border: '2px solid rgba(245,158,11,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#f59e0b', fontWeight: 700, fontSize: 13,
            }}>
              {doctorName.charAt(0).toUpperCase()}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#fbbf24', fontWeight: 600, fontSize: 13 }}>Dr. {doctorName}</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>{hospital}</div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '7px 16px',
                background: 'rgba(245,158,11,0.15)',
                border: '1px solid rgba(245,158,11,0.4)',
                borderRadius: 20,
                color: '#fbbf24',
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'Inter, sans-serif',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.28)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.15)')}
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => router.push('/login')}
            style={{
              padding: '8px 20px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              border: 'none',
              borderRadius: 20,
              color: 'white',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(245,158,11,0.4)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}
