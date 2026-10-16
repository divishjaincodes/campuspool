import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Car, Mail, Lock, User, Phone, CheckCircle2, Shield } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState<'female' | 'male' | 'undisclosed'>('female');
  const [college, setCollege] = useState('VIT Bhopal University');
  const [regNumber, setRegNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim() || !password) {
      showToast('Please complete all required fields.', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    if (!agreed) {
      showToast('Please accept the campus safety and carpooling guidelines.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await signup({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        college: college.trim(),
        gender,
        phone: phone.trim(),
        regNumber: regNumber.trim(),
      });

      showToast('Welcome to CampusPool! Student account created.', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Signup failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#0071E3] text-white flex items-center justify-center mx-auto shadow-md shadow-[#0071E3]/25">
          <Car className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#1D1D1F] tracking-tight">
          Create Student Account
        </h1>
        <p className="text-xs text-[#6E6E73]">
          One unified account to both offer and book campus rides
        </p>
      </div>

      <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/80 p-6 shadow-sm space-y-4">
        <form onSubmit={handleSignupSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#1D1D1F] mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D2D7] text-xs text-[#1D1D1F] focus:outline-none focus:border-[#0071E3]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#1D1D1F] mb-1">University Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name.branch2024@vitbhopal.ac.in"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D2D7] text-xs text-[#1D1D1F] focus:outline-none focus:border-[#0071E3]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#1D1D1F] mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D2D7] text-xs text-[#1D1D1F] focus:outline-none focus:border-[#0071E3]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1D1D1F] mb-1">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D2D7] text-xs text-[#1D1D1F] focus:outline-none focus:border-[#0071E3]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#1D1D1F] mb-1">Self-Declared Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D2D7] bg-white text-xs text-[#1D1D1F]"
              >
                <option value="female">Female (Eligible for Women-Only rides)</option>
                <option value="male">Male</option>
                <option value="undisclosed">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#1D1D1F] mb-1">
                Phone Number <span className="font-normal text-[#6E6E73]">(Optional)</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98260 00000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D2D7] text-xs text-[#1D1D1F]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#1D1D1F] mb-1">Institution</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D2D7] text-xs text-[#1D1D1F]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1D1D1F] mb-1">
                Registration No. <span className="font-normal text-[#6E6E73]">(Optional)</span>
              </label>
              <input
                type="text"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                placeholder="e.g. 24BCE10001"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D2D2D7] text-xs text-[#1D1D1F]"
              />
            </div>
          </div>

          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="agreeTerms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 accent-[#0071E3]"
            />
            <label htmlFor="agreeTerms" className="text-[11px] text-[#6E6E73] leading-normal">
              I agree to the{' '}
              <Link to="/terms" className="text-[#0071E3] hover:underline">
                Community Code of Conduct
              </Link>{' '}
              and{' '}
              <Link to="/safety" className="text-[#0071E3] hover:underline">
                Safety Guidelines
              </Link>
              . I understand CampusPool is a non-commercial student cost-sharing network.
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-[#0071E3]/20 transition mt-2"
          >
            {isLoading ? 'Creating Account...' : 'Complete Student Registration'}
          </button>
        </form>

        <div className="text-center text-xs text-[#6E6E73] pt-2 border-t border-[#F5F5F7]">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#0071E3] hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
