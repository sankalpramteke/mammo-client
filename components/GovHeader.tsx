'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AshokaChakra from './AshokaChakra';
import { getSession, clearSession } from '@/lib/auth';

export default function GovHeader() {
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
    <header style={{ background: '#1a3a6b', borderBottom: '4px solid #f7941d' }}>
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-3">
          <AshokaChakra size={52} />
          <div>
            <div className="text-white font-bold text-base leading-tight" style={{ letterSpacing: '0.3px' }}>
              National Mammogram AI Detection System
            </div>
            <div className="text-orange-300 text-xs mt-0.5" style={{ letterSpacing: '0.2px' }}>
              Ministry of Health &amp; Family Welfare | Government of India
            </div>
          </div>
        </div>

        {/* Right: User info */}
        {doctorName && (
          <div className="text-right text-sm text-white flex items-center gap-3">
            <div>
              <div className="font-semibold text-orange-200">Dr. {doctorName}</div>
              <div className="text-xs text-blue-200">{hospital}</div>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs bg-gov-orange hover:bg-gov-orange-dark text-white px-3 py-1.5 font-semibold transition-colors"
              style={{ borderRadius: '2px' }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
