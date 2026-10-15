import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Car, Lock, Mail, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, allUsers, switchUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('Please enter your university email.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
      showToast('Welcome back to CampusPool!', 'success');
      navigate(from, { replace: true });
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = (userId: string) => {
    switchUser(userId);
    showToast('Signed in with demo student account.', 'success');
    navigate(from, { replace: true });
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#0071E3] text-white flex items-center justify-center mx-auto shadow-md shadow-[#0071E3]/25">
          <Car className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#1D1D1F] tracking-tight">
          Sign In to CampusPool
        </h1>
        <p className="text-xs text-[#6E6E73]">
          Ride Together. Pay Less. Travel Safer.
        </p>
      </div>

      {/* Quick Demo Student Access Cards */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/80 p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#0071E3]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>One-Click Demo Student Sign-In</span>
        </div>
        <p className="text-[11px] text-[#6E6E73]">
          Select any student account below to test the platform instantly:
        </p>

        <div className="space-y-1.5 text-xs">
          {allUsers.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => handleQuickDemoLogin(u.id)}
              className="w-full p-2.5 rounded-xl border border-[#D2D2D7]/60 hover:border-[#0071E3] hover:bg-[#0071E3]/5 text-left flex items-center justify-between transition cursor-pointer"
            >
              <div className="truncate">
                <span className="font-semibold text-[#1D1D1F]">{u.fullName}</span>
                <span className="text-[11px] text-[#6E6E73] ml-1.5">
                  ({u.gender === 'female' ? 'Female' : u.gender === 'male' ? 'Male' : 'Admin'} • {u.role === 'admin' ? 'Admin' : 'Student'})
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#0071E3] shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Manual Login Form */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/80 p-6 shadow-sm space-y-4">
        <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-[#1D1D1F] mb-1">College Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#A1A1A6] absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@vitbhopal.ac.in"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D2D2D7] text-xs text-[#1D1D1F] focus:outline-none focus:border-[#0071E3]"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-[#1D1D1F]">Password</label>
              <Link to="/forgot-password" className="text-[11px] text-[#0071E3] hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#A1A1A6] absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D2D2D7] text-xs text-[#1D1D1F] focus:outline-none focus:border-[#0071E3]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-[#0071E3]/20 transition mt-2"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-xs text-[#6E6E73] pt-2 border-t border-[#F5F5F7]">
          Don't have an account yet?{' '}
          <Link to="/signup" className="font-semibold text-[#0071E3] hover:underline">
            Register as Student
          </Link>
        </div>
      </div>
    </div>
  );
};
