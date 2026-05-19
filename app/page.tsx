'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setSession } from '@/lib/auth';
import toast from 'react-hot-toast';
import axios from 'axios';

type Mode = 'login' | 'register';

const STATS = [
  { num: '1,40,000+', label: 'New breast cancer cases annually in India', color: '#dc2626' },
  { num: '92.1%',     label: 'Screening model validation accuracy',       color: '#16a34a' },
  { num: '10,556',    label: 'Mammogram samples processed',                color: '#1d4ed8' },
  { num: '<2s',       label: 'Average scan analysis time',                 color: '#7c3aed' },
];

export default function LandingPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!hospitalName.trim()) e.hospitalName = 'Hospital name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = 'Enter a valid email';
    if (!password.trim()) e.password = 'Password is required';
    if (mode === 'register') {
      if (!name.trim()) e.name = 'Full name is required';
      if (password.length < 6) e.password = 'Minimum 6 characters';
      if (confirmPassword !== password) e.confirmPassword = 'Passwords do not match';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login'
        ? { email, password }
        : { name, email, password, hospitalName };
      const res = await axios.post(endpoint, body);
      const data = res.data;
      setSession({ token: data.token, doctorId: data.doctorId, name: data.name, email: data.email, hospitalName: data.hospitalName });
      toast.success(mode === 'login' ? `Welcome, Dr. ${data.name}!` : `Account created! Welcome, Dr. ${data.name}`);
      router.push('/dashboard');
    } catch (err) {
      if (axios.isAxiosError(err)) toast.error(err.response?.data?.error || 'Authentication failed.');
      else toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh',
      overflow: 'hidden',
      display: 'flex',
      fontFamily: 'Inter, -apple-system, sans-serif',
      background: '#f8fafc',
    }}>

      {/* ══════════════ LEFT PANEL — Branding & Info ══════════════ */}
      <div style={{
        flex: '0 0 50%',
        background: 'linear-gradient(145deg, #0f2744 0%, #1a3a6b 50%, #1e4d8c 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 56px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle background circles */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(245,158,11,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(29,78,216,0.15)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 44 }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            {/* Outer ring */}
            <circle cx="24" cy="24" r="22" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.5" />
            {/* Inner filled ring */}
            <circle cx="24" cy="24" r="17" stroke="#f59e0b" strokeWidth="2" fill="rgba(245,158,11,0.1)" />
            {/* Scan arc top */}
            <path d="M 24 7 A 17 17 0 0 1 41 24" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Four tick marks */}
            <line x1="24" y1="2" x2="24" y2="6" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="46" y1="24" x2="42" y2="24" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="24" y1="46" x2="24" y2="42" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="2" y1="24" x2="6" y2="24" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
            {/* D letter */}
            <text x="24" y="29" textAnchor="middle" fill="#f59e0b" fontSize="14" fontWeight="800" fontFamily="Inter,sans-serif">D</text>
          </svg>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 22, letterSpacing: '-0.5px', lineHeight: 1 }}>DISHA</div>
            <div style={{ color: 'rgba(245,158,11,0.75)', fontSize: 9.5, letterSpacing: '0.8px', marginTop: 3, textTransform: 'uppercase' }}>Diagnostic Imaging &amp; Screening for Health Analytics</div>
          </div>
        </div>

        {/* Hero text */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: 800, color: 'white', lineHeight: 1.15, marginBottom: 16, letterSpacing: '-0.03em' }}>
            Advanced<br />
            <span style={{ background: 'linear-gradient(90deg, #f59e0b, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Mammogram
            </span>
            <br />Screening
          </h1>
          <div style={{ width: 48, height: 3, background: 'linear-gradient(90deg, #f59e0b, transparent)', borderRadius: 2, marginBottom: 16 }} />
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: 380 }}>
            <strong style={{ color: 'rgba(255,255,255,0.85)' }}>Precision screening for every diagnosis.</strong><br />
            Secure, fast, and reliable mammogram analysis — designed exclusively for healthcare professionals.
          </p>
        </div>

        {/* Stat grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 36 }}>
          {STATS.map(s => (
            <div key={s.num} style={{
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderLeft: `3px solid ${s.color}`,
              borderRadius: 8,
            }}>
              <div style={{ color: '#fbbf24', fontWeight: 800, fontSize: 18, lineHeight: 1 }}>{s.num}</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10.5, marginTop: 4, lineHeight: 1.4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div style={{ position: 'absolute', bottom: 20, left: 56, right: 56 }}>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>
            © 2026 DISHA · Not a substitute for radiological diagnosis
          </p>
        </div>
      </div>

      {/* ══════════════ RIGHT PANEL — Login Form ══════════════ */}
      <div style={{
        flex: '0 0 50%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f8fafc',
        backgroundImage: [
          'radial-gradient(circle, rgba(15,39,68,0.13) 1.2px, transparent 1.2px)',
        ].join(', '),
        backgroundSize: '28px 28px',
        padding: '0 48px',
        overflow: 'hidden',
        position: 'relative',
      }}>

        {/* Soft vignette to fade dots near edges */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(248,250,252,0.92) 100%)',
          pointerEvents: 'none',
        }} />

        <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>

          {/* Header */}
          <div style={{ marginBottom: 28, textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 52, height: 52, borderRadius: 14,
              background: 'linear-gradient(135deg, #0f2744, #1a3a6b)',
              marginBottom: 16,
            }}>
              <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="22" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.5" />
                <circle cx="24" cy="24" r="17" stroke="#f59e0b" strokeWidth="2" fill="rgba(245,158,11,0.1)" />
                <path d="M 24 7 A 17 17 0 0 1 41 24" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <line x1="24" y1="2" x2="24" y2="6" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="46" y1="24" x2="42" y2="24" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="24" y1="46" x2="24" y2="42" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="2" y1="24" x2="6" y2="24" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
                <text x="24" y="29" textAnchor="middle" fill="#f59e0b" fontSize="14" fontWeight="800" fontFamily="Inter,sans-serif">D</text>
              </svg>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f2744', margin: 0, letterSpacing: '-0.5px' }}>
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p style={{ color: '#64748b', fontSize: 13, marginTop: 6 }}>
              {mode === 'login' ? 'Sign in to your DISHA portal' : 'Register as a healthcare professional'}
            </p>
          </div>

          {/* Mode tabs */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 10, padding: 4, marginBottom: 24, gap: 4 }}>
            {(['login', 'register'] as Mode[]).map(m => (
              <button key={m} onClick={() => { setMode(m); setErrors({}); }}
                style={{
                  flex: 1, padding: '8px 0', fontSize: 12.5, fontWeight: 700,
                  border: 'none', cursor: 'pointer', borderRadius: 8,
                  fontFamily: 'Inter, sans-serif', letterSpacing: '0.3px',
                  transition: 'all 0.2s',
                  background: mode === m ? 'white' : 'transparent',
                  color: mode === m ? '#0f2744' : '#94a3b8',
                  boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                }}>
                {m === 'login' ? 'Login' : 'Register'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {mode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Full Name *</label>
                <input className="disha-input" type="text" placeholder="Dr. Anjali Mehta"
                  value={name} onChange={e => setName(e.target.value)}
                  style={{ borderColor: errors.name ? '#dc2626' : undefined }} />
                {errors.name && <p style={{ color: '#dc2626', fontSize: 11, marginTop: 3 }}>{errors.name}</p>}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Hospital / Institution *</label>
              <input className="disha-input" type="text" placeholder="e.g. AIIMS Nagpur"
                value={hospitalName} onChange={e => setHospitalName(e.target.value)}
                style={{ borderColor: errors.hospitalName ? '#dc2626' : undefined }} />
              {errors.hospitalName && <p style={{ color: '#dc2626', fontSize: 11, marginTop: 3 }}>{errors.hospitalName}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Official Email *</label>
              <input id="email" className="disha-input" type="email" placeholder="doctor@aiims.in"
                value={email} onChange={e => setEmail(e.target.value)}
                style={{ borderColor: errors.email ? '#dc2626' : undefined }} />
              {errors.email && <p style={{ color: '#dc2626', fontSize: 11, marginTop: 3 }}>{errors.email}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Password *</label>
              <input id="password" className="disha-input" type="password"
                placeholder={mode === 'register' ? 'Min. 6 characters' : 'Enter password'}
                value={password} onChange={e => setPassword(e.target.value)}
                style={{ borderColor: errors.password ? '#dc2626' : undefined }} />
              {errors.password && <p style={{ color: '#dc2626', fontSize: 11, marginTop: 3 }}>{errors.password}</p>}
            </div>

            {mode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Confirm Password *</label>
                <input className="disha-input" type="password" placeholder="Re-enter password"
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  style={{ borderColor: errors.confirmPassword ? '#dc2626' : undefined }} />
                {errors.confirmPassword && <p style={{ color: '#dc2626', fontSize: 11, marginTop: 3 }}>{errors.confirmPassword}</p>}
              </div>
            )}

            <button id="loginBtn" type="submit" disabled={loading} className="btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: 14, marginTop: 4 }}>
              {loading ? 'Authenticating...' : mode === 'login' ? 'Login to DISHA →' : 'Create Account →'}
            </button>
          </form>

          {/* Warning */}
          <div style={{ marginTop: 16, padding: '10px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, fontSize: 11, color: '#92400e', textAlign: 'center' }}>
            ⚠️ Authorised medical personnel only. Unauthorised access is prohibited.
          </div>

          {/* Status badge */}
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span style={{ width: 7, height: 7, background: '#22c55e', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 6px #22c55e' }} />
            <span style={{ fontSize: 11, color: '#64748b' }}>System Online · Secure Connection</span>
          </div>
        </div>
      </div>
    </div>
  );
}
