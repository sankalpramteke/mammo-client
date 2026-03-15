'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AshokaChakra from '@/components/AshokaChakra';
import { setSession } from '@/lib/auth';
import toast from 'react-hot-toast';
import axios from 'axios';

type Mode = 'login' | 'register';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Shared fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hospitalName, setHospitalName] = useState('');

  // Register-only fields
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!hospitalName.trim()) e.hospitalName = 'Hospital Name is required';
    if (!email.trim()) e.email = 'Email address is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = 'Enter a valid email address';
    if (!password.trim()) e.password = 'Password is required';
    if (mode === 'register') {
      if (!name.trim()) e.name = 'Full name is required';
      if (password.length < 6) e.password = 'Password must be at least 6 characters';
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

      // Persist session
      setSession({
        token: data.token,
        doctorId: data.doctorId,
        name: data.name,
        email: data.email,
        hospitalName: data.hospitalName,
      });

      toast.success(mode === 'login' ? `Welcome back, Dr. ${data.name}!` : `Account created! Welcome, Dr. ${data.name}`);
      router.push('/dashboard');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.error || (mode === 'login' ? 'Login failed.' : 'Registration failed.');
        toast.error(msg);
      } else {
        toast.error('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setErrors({});
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #0d2347 0%, #1a3a6b 40%, #2c5f9e 100%)' }}
    >
      {/* Top bar */}
      <div style={{ background: '#122a52', borderBottom: '3px solid #f7941d' }}>
        <div className="max-w-screen-xl mx-auto px-4 py-2 flex items-center gap-2">
          <AshokaChakra size={28} />
          <span className="text-white text-xs font-semibold tracking-wide">
            Ministry of Health &amp; Family Welfare | Government of India
          </span>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div
                className="p-4 rounded-full"
                style={{ background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(247,148,29,0.4)' }}
              >
                <AshokaChakra size={72} />
              </div>
            </div>
            <h1 className="text-white text-xl font-bold tracking-wide mb-1">
              National Mammogram AI Detection System
            </h1>
            <p className="text-orange-300 text-sm">Federated Learning Based Cancer Detection Portal</p>
            <p className="text-blue-300 text-xs mt-1">Ministry of Health &amp; Family Welfare, Government of India</p>
          </div>

          {/* Card */}
          <div
            className="p-6"
            style={{
              background: 'white',
              border: '1px solid #c8d0dc',
              borderTop: '3px solid #f7941d',
              borderRadius: '2px',
            }}
          >
            {/* Mode tabs */}
            <div className="flex mb-5 border-b border-gray-200">
              {(['login', 'register'] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className="flex-1 py-2 text-xs font-bold transition-colors"
                  style={{
                    color: mode === m ? '#1a3a6b' : '#999',
                    borderBottom: mode === m ? '2px solid #f7941d' : '2px solid transparent',
                    background: 'none',
                  }}
                >
                  {m === 'login' ? 'LOGIN' : 'NEW REGISTRATION'}
                </button>
              ))}
            </div>

            <div className="mb-4 pb-3" style={{ borderBottom: '1px solid #e0e6ef' }}>
              <h2 className="text-sm font-bold" style={{ color: '#1a3a6b' }}>
                {mode === 'login' ? 'Authorised Healthcare Professional Login' : 'Register as Healthcare Professional'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {mode === 'login' ? 'Access restricted to registered medical practitioners only' : 'Create your institutional account'}
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {/* Name — register only */}
              {mode === 'register' && (
                <div className="mb-3">
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#333' }}>
                    Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    className="gov-input"
                    placeholder="e.g. Dr. Anjali Mehta"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ borderColor: errors.name ? '#dc3545' : undefined }}
                  />
                  {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
                </div>
              )}

              {/* Hospital name */}
              <div className="mb-3">
                <label className="block text-xs font-semibold mb-1" style={{ color: '#333' }}>
                  Hospital / Institution Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  className="gov-input"
                  placeholder="e.g. AIIMS Mumbai"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  style={{ borderColor: errors.hospitalName ? '#dc3545' : undefined }}
                />
                {errors.hospitalName && <p className="text-red-600 text-xs mt-1">{errors.hospitalName}</p>}
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="block text-xs font-semibold mb-1" style={{ color: '#333' }}>
                  Official Email Address <span className="text-red-600">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  className="gov-input"
                  placeholder="e.g. doctor@aiims.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ borderColor: errors.email ? '#dc3545' : undefined }}
                />
                {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="mb-3">
                <label className="block text-xs font-semibold mb-1" style={{ color: '#333' }}>
                  Password <span className="text-red-600">*</span>
                </label>
                <input
                  id="password"
                  type="password"
                  className="gov-input"
                  placeholder={mode === 'register' ? 'Minimum 6 characters' : 'Enter password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ borderColor: errors.password ? '#dc3545' : undefined }}
                />
                {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
              </div>

              {/* Confirm password — register only */}
              {mode === 'register' && (
                <div className="mb-3">
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#333' }}>
                    Confirm Password <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    className="gov-input"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ borderColor: errors.confirmPassword ? '#dc3545' : undefined }}
                  />
                  {errors.confirmPassword && <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              )}

              <div className="mt-5">
                <button
                  id="loginBtn"
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 font-bold text-sm text-white transition-colors disabled:opacity-70"
                  style={{
                    background: loading ? '#4a7fc1' : '#1a3a6b',
                    border: '1px solid #122a52',
                    borderRadius: '2px',
                    letterSpacing: '0.3px',
                  }}
                >
                  {loading
                    ? 'Please wait...'
                    : mode === 'login' ? 'LOGIN TO PORTAL' : 'CREATE ACCOUNT'}
                </button>
              </div>
            </form>

            <div
              className="mt-4 p-2.5 text-xs"
              style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '2px', color: '#856404' }}
            >
              ⚠️ This system is for authorised medical personnel only. Unauthorised access is prohibited under IT Act 2000.
            </div>
          </div>

          <p className="text-blue-300 text-xs text-center mt-4">
            For technical support, contact NIC Helpdesk: 1800-111-0888
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#0d2347', borderTop: '2px solid #f7941d' }} className="py-2 text-center">
        <p className="text-blue-400 text-xs">
          © 2026 Ministry of Health &amp; Family Welfare, Government of India | NIC | Website Policy | Help
        </p>
      </div>
    </div>
  );
}
