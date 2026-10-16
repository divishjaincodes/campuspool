import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Car, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const ForgotPasswordPage: React.FC = () => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.resetPasswordForEmail(
          email.trim().toLowerCase(),
          { redirectTo: `${window.location.origin}/settings` }
        );
        if (error) throw error;
      }
      setIsSubmitted(true);
      showToast('Password recovery instructions sent to your email.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to send recovery email', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#0071E3] text-white flex items-center justify-center mx-auto shadow-md shadow-[#0071E3]/25">
          <Car className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#1D1D1F] tracking-tight">
          Password Recovery
        </h1>
        <p className="text-xs text-[#6E6E73]">
          Enter your university email to reset your access
        </p>
      </div>

      <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/80 p-6 shadow-sm">
        {isSubmitted ? (
          <div className="text-center space-y-3 py-4 text-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-sm text-[#1D1D1F]">Reset Instructions Sent</h3>
            <p className="text-[#6E6E73] leading-relaxed">
              If an active student account exists for <strong>{email}</strong>, a recovery link has been simulated for your session.
            </p>
            <Link
              to="/login"
              className="mt-4 inline-block px-4 py-2 rounded-xl bg-[#0071E3] text-white font-semibold"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#1D1D1F] mb-1">College Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#A1A1A6] absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@vitbhopal.ac.in"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D2D2D7] text-xs text-[#1D1D1F] focus:outline-none focus:border-[#0071E3]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-xs shadow-md shadow-[#0071E3]/20 transition"
            >
              Send Recovery Instructions
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="text-xs font-semibold text-[#6E6E73] hover:text-[#1D1D1F] inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
