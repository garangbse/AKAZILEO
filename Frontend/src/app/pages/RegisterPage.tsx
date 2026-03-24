import React, { useState } from 'react';
import { Eye, EyeOff, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { api } from '../../services/api';

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Contains a number', test: (p: string) => /\d/.test(p) },
  { label: 'Contains a letter', test: (p: string) => /[a-zA-Z]/.test(p) },
];

export function RegisterPage() {
  const { login } = useAppContext(); 
  const navigate = useNavigate();     

  const [role, setRole] = useState<'worker' | 'employer'>('worker');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);

  const passwordStrength = PASSWORD_RULES.filter((r) => r.test(password)).length;
  const strengthColors = ['#E8E3C8', '#f59e0b', '#BFC897', '#3C3F20'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong'];

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  if (!name.trim() || !email.trim() || !password || !confirm) {
    setError('Please fill in all fields.');
    return;
  }

  if (password !== confirm) {
    setError('Passwords do not match.');
    return;
  }

  if (passwordStrength < 2) {
    setError('Please choose a stronger password.');
    return;
  }

  if (!agreed) {
    setError('Please accept the terms to continue.');
    return;
  }

  setLoading(true);

  try {
    const res = await api('/register', 'POST', {
      username: name,
      email,
      password,
      role, // <-- IMPORTANT: send role
    });

    if (res.status !== 'success') {
      setError(res.message || 'Registration failed');
      return;
    }

    navigate('/login');

  } catch (err) {
    setError('Server error. Try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#FDF9EB' }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-5/12 xl:w-2/5 flex-col justify-between p-10 relative overflow-hidden"
        style={{ backgroundColor: '#3C3F20' }}
      >
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10" style={{ backgroundColor: '#BFC897' }} />
        <div className="absolute bottom-10 -left-24 w-80 h-80 rounded-full opacity-10" style={{ backgroundColor: '#BFC897' }} />
        <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full opacity-5" style={{ backgroundColor: '#BFC897' }} />

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#BFC897' }}>
            <Zap size={18} style={{ color: '#3C3F20' }} />
          </div>
          <span className="text-white text-xl tracking-wide" style={{ fontWeight: 600 }}>TaskFlow</span>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-white mb-3" style={{ lineHeight: 1.15 }}>
              Join thousands of talented professionals
            </h1>
            <p className="text-white/55 text-sm leading-relaxed">
              Whether you're here to hire or get hired, TaskFlow connects you with the right people.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { value: '2,400+', label: 'Active workers' },
              { value: '580+', label: 'Employers' },
              { value: '12K+', label: 'Tasks completed' },
              { value: '98%', label: 'Satisfaction rate' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl p-4" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                <p className="text-white text-xl mb-0.5" style={{ fontWeight: 600 }}>{stat.value}</p>
                <p className="text-white/40 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/25 text-xs">© 2026 TaskFlow. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 overflow-y-auto">
        <div className="w-full max-w-md py-8">

          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#3C3F20' }}>
              <Zap size={15} style={{ color: '#BFC897' }} />
            </div>
            <span className="tracking-wide" style={{ color: '#3C3F20', fontWeight: 600 }}>TaskFlow</span>
          </div>

          <h2 className="mb-1" style={{ color: '#3C3F20' }}>Create your account</h2>
          <p className="text-sm mb-8 opacity-55" style={{ color: '#3C3F20' }}>Get started in less than 2 minutes</p>

          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest opacity-40 mb-2" style={{ color: '#3C3F20' }}>I want to</p>
            <div className="flex rounded-2xl overflow-hidden p-1 gap-1" style={{ backgroundColor: '#E8E3C8' }}>
              <button
                type="button"
                onClick={() => setRole('worker')}
                className="flex-1 py-3 rounded-xl text-sm transition-all cursor-pointer flex flex-col items-center gap-1"
                style={role === 'worker' ? { backgroundColor: '#3C3F20', color: '#FDF9EB' } : { color: '#3C3F20', opacity: 0.5 }}
              >
                <span>🧑‍💻</span>
                <span>Find Work</span>
                <span className="text-xs opacity-60">Worker</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('employer')}
                className="flex-1 py-3 rounded-xl text-sm transition-all cursor-pointer flex flex-col items-center gap-1"
                style={role === 'employer' ? { backgroundColor: '#3C3F20', color: '#FDF9EB' } : { color: '#3C3F20', opacity: 0.5 }}
              >
                <span>🏢</span>
                <span>Hire Talent</span>
                <span className="text-xs opacity-60">Employer</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1.5 opacity-65" style={{ color: '#3C3F20' }}>Full name</label>
              <input
                type="text"
                placeholder="Sarah Mitchell"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none border-2 border-transparent transition-all focus:border-[#BFC897]"
                style={{ backgroundColor: '#E8E3C8', color: '#3C3F20' }}
              />
            </div>

            <div>
              <label className="block text-sm mb-1.5 opacity-65" style={{ color: '#3C3F20' }}>Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none border-2 border-transparent transition-all focus:border-[#BFC897]"
                style={{ backgroundColor: '#E8E3C8', color: '#3C3F20' }}
              />
            </div>

            <div>
              <label className="block text-sm mb-1.5 opacity-65" style={{ color: '#3C3F20' }}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm outline-none border-2 border-transparent transition-all focus:border-[#BFC897]"
                  style={{ backgroundColor: '#E8E3C8', color: '#3C3F20' }}
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70 transition-opacity cursor-pointer">
                  {showPassword ? <EyeOff size={15} style={{ color: '#3C3F20' }} /> : <Eye size={15} style={{ color: '#3C3F20' }} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1.5 opacity-65" style={{ color: '#3C3F20' }}>Confirm password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm outline-none border-2 transition-all focus:border-[#BFC897]"
                  style={{
                    backgroundColor: '#E8E3C8',
                    color: '#3C3F20',
                    borderColor: confirm && password !== confirm ? '#ef4444' : 'transparent',
                  }}
                />
                <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70 transition-opacity cursor-pointer">
                  {showConfirm ? <EyeOff size={15} style={{ color: '#3C3F20' }} /> : <Eye size={15} style={{ color: '#3C3F20' }} />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <button
                type="button"
                onClick={() => setAgreed((v) => !v)}
                className="w-4 h-4 border-2 flex items-center justify-center"
                style={{ backgroundColor: agreed ? '#3C3F20' : 'transparent' }}
              >
                {agreed && <CheckCircle2 size={10} className="text-white" />}
              </button>
              <span className="text-sm opacity-55" style={{ color: '#3C3F20' }}>
                I agree to the Terms of Service and Privacy Policy
              </span>
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3 bg-red-50 border border-red-200">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm text-white mt-2"
              style={{ backgroundColor: '#3C3F20' }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><span>Create Account</span><ArrowRight size={14} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm mt-6 opacity-55" style={{ color: '#3C3F20' }}>
            Already have an account?
            <button
                type="button"
                onClick={() => navigate('/login')}
                className="opacity-100 underline underline-offset-2 hover:opacity-75 transition-opacity cursor-pointer bg-transparent border-none p-0"
                style={{ color: '#3C3F20' }}
              >
                Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;