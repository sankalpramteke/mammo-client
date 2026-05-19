'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setSession } from '@/lib/auth';
import toast from 'react-hot-toast';
import axios from 'axios';

type Mode = 'login' | 'register';

export default function LoginPage() {
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
    if (!email.trim()) e.email = 'Email address is required';
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
      toast.success(mode === 'login' ? `Welcome back, Dr. ${data.name}!` : `Welcome, Dr. ${data.name}`);
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
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(135deg, #0a1628 0%, #0f2744 40%, #1a3a6b 75%, #1e4d8c 100%)',
      fontFamily: 'Inter, -apple-system, sans-serif',
    }}>

      {/* LEFT: Branding panel */}
      <div style={{
        flex: '0 0 45%',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 56px',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* DISHA Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 48 }}>
          <svg width="52" height="52" viewBox="0 0 48 48" fill="none">
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
            <div style={{ color: 'white', fontWeight: 800, fontSize: 22, letterSpacing: '-0.5px' }}>DISHA</div>
            <div style={{ color: 'rgba(245,158,11,0.7)', fontSize: 10, letterSpacing: '0.5px', marginTop: 2 }}>DIAGNOSTIC IMAGING &amp; SCREENING FOR HEALTH ANALYTICS</div>
          </div>
        </div>

        {/* Headline */}
        <h2 style={{ fontSize: 32, fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: 16, letterSpacing: '-0.03em' }}>
          Intelligent<br />Cancer Screening<br />
          <span style={{ background: 'linear-gradient(90deg, #f59e0b, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Built for Doctors
          </span>
        </h2>

        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.7, marginBottom: 40, maxWidth: 340 }}>
          Securely analyze mammograms with AI trained across multiple hospitals using Federated Learning — where patient data never leaves your institution.
        </p>

        {/* Stats */}
        {[
          { num: '92.1%', label: 'Model Accuracy' },
          { num: '10,556', label: 'Training Samples' },
          { num: '<2s', label: 'Inference Time' },
        ].map(s => (
          <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ width: 3, height: 28, background: '#f59e0b', borderRadius: 2, flexShrink: 0 }} />
            <div>
              <div style={{ color: '#fbbf24', fontWeight: 800, fontSize: 18 }}>{s.num}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT: Login card */}
      <div style={{
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px',
      }}>
        <div style={{
          width: '100%', maxWidth: 420,
          background: 'white',
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          overflow: 'hidden',
        }}>
          {/* Card header */}
          <div style={{ background: '#0f2744', padding: '24px 32px 20px', borderBottom: '3px solid #f59e0b' }}>
            <h1 style={{ color: 'white', fontWeight: 700, fontSize: 18, margin: 0 }}>
              {mode === 'login' ? 'Healthcare Professional Login' : 'Create Account'}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 }}>
              {mode === 'login' ? 'Authorised medical practitioners only' : 'Register your institutional account'}
            </p>
          </div>

          {/* Tab switcher */}
          <div style={{ display: 'flex', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            {(['login', 'register'] as Mode[]).map(m => (
              <button key={m} onClick={() => { setMode(m); setErrors({}); }}
                style={{
                  flex: 1, padding: '11px 0', fontSize: 12, fontWeight: 700,
                  border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  color: mode === m ? '#0f2744' : '#94a3b8',
                  background: mode === m ? 'white' : 'transparent',
                  borderBottom: mode === m ? '2.5px solid #f59e0b' : '2.5px solid transparent',
                  transition: 'all 0.2s',
                  letterSpacing: '0.5px',
                }}>
                {m === 'login' ? 'LOGIN' : 'REGISTER'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate style={{ padding: '28px 32px 32px' }}>
            {mode === 'register' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Full Name *</label>
                <input className="disha-input" type="text" placeholder="Dr. Anjali Mehta" value={name} onChange={e => setName(e.target.value)} style={{ borderColor: errors.name ? '#dc2626' : undefined }} />
                {errors.name && <p style={{ color: '#dc2626', fontSize: 11, marginTop: 3 }}>{errors.name}</p>}
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Hospital / Institution *</label>
              <input className="disha-input" type="text" placeholder="e.g. AIIMS Nagpur" value={hospitalName} onChange={e => setHospitalName(e.target.value)} style={{ borderColor: errors.hospitalName ? '#dc2626' : undefined }} />
              {errors.hospitalName && <p style={{ color: '#dc2626', fontSize: 11, marginTop: 3 }}>{errors.hospitalName}</p>}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Official Email *</label>
              <input id="email" className="disha-input" type="email" placeholder="doctor@aiims.in" value={email} onChange={e => setEmail(e.target.value)} style={{ borderColor: errors.email ? '#dc2626' : undefined }} />
              {errors.email && <p style={{ color: '#dc2626', fontSize: 11, marginTop: 3 }}>{errors.email}</p>}
            </div>

            <div style={{ marginBottom: mode === 'register' ? 16 : 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Password *</label>
              <input id="password" className="disha-input" type="password" placeholder={mode === 'register' ? 'Min. 6 characters' : 'Enter password'} value={password} onChange={e => setPassword(e.target.value)} style={{ borderColor: errors.password ? '#dc2626' : undefined }} />
              {errors.password && <p style={{ color: '#dc2626', fontSize: 11, marginTop: 3 }}>{errors.password}</p>}
            </div>

            {mode === 'register' && (
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Confirm Password *</label>
                <input className="disha-input" type="password" placeholder="Re-enter password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{ borderColor: errors.confirmPassword ? '#dc2626' : undefined }} />
                {errors.confirmPassword && <p style={{ color: '#dc2626', fontSize: 11, marginTop: 3 }}>{errors.confirmPassword}</p>}
              </div>
            )}

            <button id="loginBtn" type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '13px', fontSize: 14 }}>
              {loading ? 'Authenticating...' : mode === 'login' ? 'Login to DISHA →' : 'Create Account →'}
            </button>

            <div style={{ marginTop: 16, padding: '10px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, fontSize: 11, color: '#92400e' }}>
              ⚠️ For authorised medical personnel only. Unauthorised access is prohibited.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
