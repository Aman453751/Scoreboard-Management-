import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, Mail, Lock, User, Building, Phone, AlertCircle, ArrowRight } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'VIEWER',
    college: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await register(formData);
      if (res.success && res.data?.user) {
        const user = res.data.user;
        if (user.role === 'ADMIN') {
          navigate('/dashboard/admin');
        } else if (user.role === 'SCORER') {
          navigate('/dashboard/scorer');
        } else {
          navigate('/dashboard/student');
        }
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not register account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-lg space-y-5">
        <div className="rounded-xl bg-[#1a1f2c] border border-[#252a37] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="text-center space-y-1.5 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#252a37] border border-[#343947] flex items-center justify-center mx-auto text-[#4cd7f6] shadow">
              <Trophy className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Create Account</h2>
            <p className="text-xs text-[#8c909f]">
              Join the official OmniScore athletics operations platform
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
              <label className="block text-xs font-semibold text-[#dee2f4] mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8c909f] absolute left-3 top-3" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className="w-full bg-[#090e1a] border border-[#252a37] rounded pl-9 pr-3 py-2 text-xs text-white placeholder-[#8c909f] focus:outline-none focus:border-[#4d8eff]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#dee2f4] mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8c909f] absolute left-3 top-3" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@college.edu"
                  className="w-full bg-[#090e1a] border border-[#252a37] rounded pl-9 pr-3 py-2 text-xs text-white placeholder-[#8c909f] focus:outline-none focus:border-[#4d8eff]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#dee2f4] mb-1">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8c909f] absolute left-3 top-3" />
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-[#090e1a] border border-[#252a37] rounded pl-9 pr-3 py-2 text-xs text-white placeholder-[#8c909f] focus:outline-none focus:border-[#4d8eff]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#dee2f4] mb-1">Account Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full bg-[#090e1a] border border-[#252a37] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4d8eff]"
                >
                  <option value="VIEWER">Student / Viewer (Spectator)</option>
                  <option value="SCORER">Official Scorer (Live Logging)</option>
                  <option value="ADMIN">Tournament Admin (Full Control)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#dee2f4] mb-1">College / University</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-[#8c909f] absolute left-3 top-3" />
                  <input
                    type="text"
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    placeholder="Apex Institute"
                    className="w-full bg-[#090e1a] border border-[#252a37] rounded pl-9 pr-3 py-2 text-xs text-white placeholder-[#8c909f] focus:outline-none focus:border-[#4d8eff]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#dee2f4] mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#8c909f] absolute left-3 top-3" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    className="w-full bg-[#090e1a] border border-[#252a37] rounded pl-9 pr-3 py-2 text-xs text-white placeholder-[#8c909f] focus:outline-none focus:border-[#4d8eff]"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded bg-[#4d8eff] hover:bg-[#3b82f6] text-[#00285d] font-bold text-xs shadow transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating Account...' : 'Register Account'}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-[#252a37] text-center">
            <p className="text-xs text-[#8c909f]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#4cd7f6] font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
