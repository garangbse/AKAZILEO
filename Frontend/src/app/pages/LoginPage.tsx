import React, { useState } from 'react';
import { Eye, EyeOff, Zap, ArrowRight, CheckCircle2, Layers, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { api } from '../../services/api';
import { Role } from '../context/AppContext';

const PERKS = [
  { icon: <CheckCircle2 size={16} />, text: 'Find quality tasks that match your skills' },
  { icon: <Layers size={16} />, text: 'Build a portfolio that stands out' },
  { icon: <Briefcase size={16} />, text: 'Connect with employers who value your work' },
];

const LoginPage = () => {
  const { login } = useAppContext();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'worker' | 'employer'>('worker');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  if (!email.trim() || !password.trim()) {
    setError('Please fill in all fields.');
    return;
  }

  setLoading(true);

  try {
    const res = await api('/login', 'POST', { email, password });

    if (res.status !== 'success') {
      setError(res.message || 'Login failed');
      return;
    }

    const token = res.data.token;

    console.log("TOKEN:", token);

    // store token
    localStorage.setItem('token', token);


    type MeResponse = {
    data: {
      username: string;
      email: string;
      roles: Role[];
    };
  }; 

  const me = await api('/me', 'GET', undefined, token) as MeResponse;

  

  const userRoles = me.data.roles; // e.g. ['worker'] or ['employer']

  if (!userRoles.includes(role)) {
    setError(`Access denied: you are not a ${role}`);
    setLoading(false);
    return;
  }

  login(
  userRoles,   // from backend
  role,        // selected role
  me.data.username,
  me.data.email
);

  navigate('/');

  } catch (err) {
    setError('Server error');
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
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full opacity-10" style={{ backgroundColor: '#BFC897' }} />
        <div className="absolute -bottom-32 -right-16 w-96 h-96 rounded-full opacity-10" style={{ backgroundColor: '#BFC897' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-5" style={{ backgroundColor: '#BFC897' }} />

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#BFC897' }}>
            <Zap size={18} style={{ color: '#3C3F20' }} />
          </div>
          <span className="text-white text-xl tracking-wide" style={{ fontWeight: 600 }}>TaskFlow</span>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <h1 className="text-white mb-3" style={{ lineHeight: 1.15 }}>
              The marketplace for skilled talent
            </h1>
            <p className="text-white/55 text-sm leading-relaxed">
              Connect with employers, complete meaningful work, and grow your career — all in one place.
            </p>
          </div>

          <div className="space-y-3">
            {PERKS.map((perk, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(191,200,151,0.15)', color: '#BFC897' }}
                >
                  {perk.icon}
                </div>
                <span className="text-white/70 text-sm">{perk.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/30 text-xs leading-relaxed border-l-2 pl-3" style={{ borderColor: '#BFC897' }}>
            "TaskFlow helped me find consistent freelance work that matches my expertise."
          </p>
          <p className="text-white/40 text-xs mt-2">— Sarah M., UI/UX Designer</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">

          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#3C3F20' }}>
              <Zap size={15} style={{ color: '#BFC897' }} />
            </div>
            <span className="tracking-wide" style={{ color: '#3C3F20', fontWeight: 600 }}>TaskFlow</span>
          </div>

          <h2 className="mb-1" style={{ color: '#3C3F20' }}>Welcome back</h2>
          <p className="text-sm mb-8 opacity-55" style={{ color: '#3C3F20' }}>
            Sign in to continue to your dashboard
          </p>

          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest opacity-40 mb-2" style={{ color: '#3C3F20' }}>
              Sign in as
            </p>
            <div className="flex rounded-2xl overflow-hidden p-1" style={{ backgroundColor: '#E8E3C8' }}>
              <button
                type="button"
                onClick={() => setRole('worker')}
                className="flex-1 py-2.5 rounded-xl text-sm transition-all cursor-pointer"
                style={role === 'worker' ? { backgroundColor: '#3C3F20', color: '#FDF9EB' } : { color: '#3C3F20', opacity: 0.5 }}
              >
                Worker
              </button>
              <button
                type="button"
                onClick={() => setRole('employer')}
                className="flex-1 py-2.5 rounded-xl text-sm transition-all cursor-pointer"
                style={role === 'employer' ? { backgroundColor: '#3C3F20', color: '#FDF9EB' } : { color: '#3C3F20', opacity: 0.5 }}
              >
                Employer
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1.5 opacity-65" style={{ color: '#3C3F20' }}>
                Email address
              </label>
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm opacity-65" style={{ color: '#3C3F20' }}>Password</label>
                <button type="button" className="text-xs opacity-45 hover:opacity-70 transition-opacity cursor-pointer" style={{ color: '#3C3F20' }}>
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm outline-none border-2 border-transparent transition-all focus:border-[#BFC897]"
                  style={{ backgroundColor: '#E8E3C8', color: '#3C3F20' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70 transition-opacity cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} style={{ color: '#3C3F20' }} /> : <Eye size={15} style={{ color: '#3C3F20' }} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3 bg-red-50 border border-red-200">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm text-white transition-all hover:opacity-90 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              style={{ backgroundColor: '#3C3F20' }}
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Sign In</span><ArrowRight size={14} /></>
              }
            </button>
          </form>

          <div className="mt-4 rounded-xl px-4 py-3 flex items-start gap-2" style={{ backgroundColor: '#E8E3C8' }}>
            <Zap size={13} style={{ color: '#BFC897' }} className="mt-0.5 flex-shrink-0" />
            <p className="text-xs opacity-55" style={{ color: '#3C3F20' }}>
              Demo: enter any email &amp; password to sign in. No real account required.
            </p>
          </div>

          <p className="text-center text-sm mt-6 opacity-55" style={{ color: '#3C3F20' }}>
            Don't have an account?{' '}
             <button
                type="button"
                onClick={() => navigate('/register')}
                className="opacity-100 underline underline-offset-2 hover:opacity-75 transition-opacity cursor-pointer bg-transparent border-none p-0"
                style={{ color: '#3C3F20' }}
              >
                Create one
              </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;