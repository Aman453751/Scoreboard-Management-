import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, Mail, Lock, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success && res.data?.user) {
        const user = res.data.user;
        if (from) {
          navigate(from, { replace: true });
        } else if (user.role === 'ADMIN') {
          navigate('/dashboard/admin');
        } else if (user.role === 'SCORER') {
          navigate('/dashboard/scorer');
        } else {
          navigate('/dashboard/student');
        }
      } else {
        setError(res.message || 'Login failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md space-y-5">
        {/* Card (Stitch Surface) */}
        <div className="rounded-xl bg-[#1a1f2c] border border-[#252a37] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Logo & Heading */}
          <div className="text-center space-y-1.5 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#252a37] border border-[#343947] flex items-center justify-center mx-auto text-[#4cd7f6] shadow">
              <Trophy className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Sign In to OmniScore
            </h2>
            <p className="text-xs text-[#8c909f]">
              Collegiate Sports Scoreboard & Tournament Platform
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#dee2f4] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8c909f] absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@omniscore.edu"
                  className="w-full bg-[#090e1a] border border-[#252a37] rounded pl-9 pr-3 py-2 text-xs text-white placeholder-[#8c909f] focus:outline-none focus:border-[#4d8eff]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#dee2f4] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8c909f] absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#090e1a] border border-[#252a37] rounded pl-9 pr-3 py-2 text-xs text-white placeholder-[#8c909f] focus:outline-none focus:border-[#4d8eff]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded bg-[#4d8eff] hover:bg-[#3b82f6] text-[#00285d] font-bold text-xs shadow transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Credentials Strip */}
          <div className="mt-6 pt-5 border-t border-[#252a37] space-y-2">
            <span className="text-[10px] font-bold text-[#8c909f] uppercase tracking-wider block text-center">
              Quick One-Click Demo Sign-In
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('admin@omniscore.edu', 'password123')}
                className="py-1.5 px-2 rounded bg-[#090e1a] hover:bg-[#252a37] border border-[#252a37] text-center transition-colors"
              >
                <span className="block text-[11px] font-bold text-[#4cd7f6]">Admin</span>
                <span className="block text-[9px] text-[#8c909f] font-mono">Full Access</span>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('scorer@omniscore.edu', 'password123')}
                className="py-1.5 px-2 rounded bg-[#090e1a] hover:bg-[#252a37] border border-[#252a37] text-center transition-colors"
              >
                <span className="block text-[11px] font-bold text-[#4edea3]">Scorer</span>
                <span className="block text-[9px] text-[#8c909f] font-mono">Live Scoring</span>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('viewer@omniscore.edu', 'password123')}
                className="py-1.5 px-2 rounded bg-[#090e1a] hover:bg-[#252a37] border border-[#252a37] text-center transition-colors"
              >
                <span className="block text-[11px] font-bold text-[#adc6ff]">Student</span>
                <span className="block text-[9px] text-[#8c909f] font-mono">Spectator</span>
              </button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-[#8c909f]">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-[#4cd7f6] font-semibold hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
