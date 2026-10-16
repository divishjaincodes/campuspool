import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Car, Lock, Mail, Sparkles, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, loginWithGoogle, allUsers, switchUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      // Supabase redirects automatically to Google OAuth page
    } catch (err: any) {
      showToast(err.message || 'Failed to initialize Google Sign-In', 'error');
      setIsGoogleLoading(false);
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

      {/* Optional Demo Student Access (Disabled in production database mode) */}
      {import.meta.env.VITE_ENABLE_DEMO === 'true' && allUsers.length > 0 && (
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
      )}

      {/* Login Options Card */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/80 p-6 shadow-sm space-y-4">
        {/* Google Authentication Button */}
        <div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full py-2.5 px-4 rounded-xl border border-[#D2D2D7] bg-[#FFFFFF] hover:bg-[#F5F5F7] active:bg-[#E8E8ED] text-[#1D1D1F] font-semibold text-xs flex items-center justify-center gap-2.5 transition shadow-sm cursor-pointer disabled:opacity-60"
          >
            {isGoogleLoading ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-[#1D1D1F] border-t-transparent" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>{isGoogleLoading ? 'Redirecting to Google...' : 'Continue with Google'}</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-3">
          <div className="border-t border-[#D2D2D7]/60 w-full" />
          <span className="bg-[#FFFFFF] px-2 text-[10px] font-medium uppercase tracking-wider text-[#6E6E73] shrink-0">
            Or sign in with email
          </span>
          <div className="border-t border-[#D2D2D7]/60 w-full" />
        </div>

        {/* Manual Login Form */}
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
            className="w-full py-2.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-[#0071E3]/20 transition mt-2 cursor-pointer"
          >
            {isLoading ? 'Signing In...' : 'Sign In with Email'}
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
