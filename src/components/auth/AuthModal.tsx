import React, { useState } from 'react';
import { loginWithGoogle, loginWithEmail, registerWithEmail } from '../../services/firebase';
import { User } from 'firebase/auth';
import { X, Sparkles, LogIn, UserPlus, Mail, Lock, User as UserIcon, ShieldAlert } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const user = await loginWithGoogle();
      onAuthSuccess(user);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Google Social Login failed. Please check popup permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      let user: User;
      if (isSignUp) {
        if (!displayName.trim()) {
          setErrorMsg('Please enter your Coach or Display Name.');
          setIsLoading(false);
          return;
        }
        user = await registerWithEmail(email, password, displayName.trim());
      } else {
        user = await loginWithEmail(email, password);
      }
      onAuthSuccess(user);
    } catch (e: any) {
      console.error(e);
      let msg = e.message || 'Authentication failed.';
      if (e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password') {
        msg = 'Invalid email or password. Please try again.';
      } else if (e.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Try logging in instead.';
      } else if (e.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      }
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500 text-slate-950 rounded-2xl font-black shadow-lg shadow-emerald-500/20">
              TS
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                {isSignUp ? 'Create Coach Account' : 'Sign In / Cloud Sync'}
              </h2>
              <p className="text-xs text-slate-400">Sync rosters, tactics, and drills across all your devices</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {/* Guest Sync Banner */}
          <div className="p-3 bg-emerald-950/50 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 flex items-center gap-2 font-medium">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>All your current local teams, scenarios, and custom drills will automatically sync to your cloud account!</span>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-2xl text-xs text-red-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Social Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-3 shadow-lg shadow-white/10 active:scale-95 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.04 0 12s.47 3.79 1.29 5.42l3.99-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.23 0 12 0 7.31 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-slate-800"></div>
            <span className="bg-slate-900 px-3 text-[11px] font-semibold text-slate-500 uppercase">Or Email</span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {isSignUp && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" /> Full Name / Display Name
                </label>
                <input
                  type="text"
                  required={isSignUp}
                  placeholder="e.g. Coach Lawrence"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
              </label>
              <input
                type="email"
                required
                placeholder="coach@soccer.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-slate-400" /> Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 mt-2"
            >
              {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              <span>{isLoading ? 'Processing...' : (isSignUp ? 'Create Coach Account' : 'Sign In')}</span>
            </button>
          </form>

          {/* Toggle Sign Up vs Sign In */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg(null);
              }}
              className="text-xs text-slate-400 hover:text-emerald-400 transition font-medium"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
