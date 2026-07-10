import { useState } from 'react';
import {
  User, Lock, Eye, EyeOff, LogIn, Shield,
  Store, Car, FileText, IndianRupee, Cloud, Building2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from '../contexts/SnackbarContext';

const features = [
  { icon: <Store size={16} />,       title: 'Market Management',    desc: 'Manage all markets in one place' },
  { icon: <Car size={16} />,         title: 'Garage Management',    desc: 'Add and manage garages easily' },
  { icon: <FileText size={16} />,    title: 'Rent & Lease Tracking',desc: 'Track rent, leases and due dates' },
  { icon: <IndianRupee size={16} />, title: 'Payment Monitoring',   desc: 'Monitor payments and outstanding dues' },
  { icon: <Cloud size={16} />,       title: 'Backup & Restore',     desc: 'Secure your data with easy backup and restore' },
];

export default function Login() {
  const { login, loginDemo } = useAuth();
  const { showSnackbar } = useSnackbar();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      showSnackbar('Please enter username and password', 'warning');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const ok = login(username, password);
    setLoading(false);
    if (!ok) showSnackbar('Invalid username or password', 'error');
  };

  const handleDemo = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    loginDemo();
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel ──────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[42%] bg-[#EBF3FF] flex-col px-10 py-8 relative overflow-hidden">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
            <Building2 size={20} className="text-white" />
          </div>
        </div>

        {/* Heading */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-3">
            Property & Garage<br />Management System
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Manage Markets, Shops & Garages Efficiently
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-auto">
          {features.map(f => (
            <div key={f.title} className="flex items-start gap-3">
              <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-600">
                {f.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{f.title}</p>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Building illustration */}
        <div className="mt-8 flex justify-center">
          <svg viewBox="0 0 400 200" className="w-full max-w-sm opacity-80" fill="none">
            {/* Sky circles */}
            <circle cx="350" cy="60"  r="60"  fill="#DBEAFE" opacity="0.5" />
            <circle cx="60"  cy="80"  r="50"  fill="#DBEAFE" opacity="0.4" />
            {/* Trees */}
            <rect x="20"  y="140" width="10" height="50" fill="#93C5FD" rx="2" />
            <circle cx="25" cy="135" r="16" fill="#60A5FA" />
            <rect x="360" y="140" width="10" height="50" fill="#93C5FD" rx="2" />
            <circle cx="365" cy="135" r="16" fill="#60A5FA" />
            <rect x="50"  y="148" width="8"  height="42" fill="#93C5FD" rx="2" />
            <circle cx="54" cy="143" r="12" fill="#BFDBFE" />
            <rect x="340" y="148" width="8"  height="42" fill="#93C5FD" rx="2" />
            <circle cx="344" cy="143" r="12" fill="#BFDBFE" />
            {/* Ground */}
            <rect x="0" y="188" width="400" height="12" fill="#BFDBFE" rx="2" />
            {/* Garage building */}
            <rect x="80" y="90" width="240" height="100" fill="#93C5FD" rx="4" />
            <rect x="80" y="90" width="240" height="100" fill="white" opacity="0.3" rx="4" />
            {/* Garage doors */}
            <rect x="100" y="120" width="70" height="70" fill="#1D4ED8" rx="4" />
            <rect x="100" y="120" width="70" height="70" fill="white" opacity="0.1" rx="4" />
            <line x1="135" y1="120" x2="135" y2="190" stroke="white" strokeWidth="2" opacity="0.5" />
            {/* Horizontal slats */}
            {[130,140,150,160,170,180].map(y => (
              <line key={y} x1="100" y1={y} x2="170" y2={y} stroke="white" strokeWidth="1" opacity="0.3" />
            ))}
            <rect x="230" y="120" width="70" height="70" fill="#1D4ED8" rx="4" />
            <rect x="230" y="120" width="70" height="70" fill="white" opacity="0.1" rx="4" />
            <line x1="265" y1="120" x2="265" y2="190" stroke="white" strokeWidth="2" opacity="0.5" />
            {[130,140,150,160,170,180].map(y => (
              <line key={y} x1="230" y1={y} x2="300" y2={y} stroke="white" strokeWidth="1" opacity="0.3" />
            ))}
            {/* Roof line */}
            <rect x="75" y="84" width="250" height="12" fill="#60A5FA" rx="2" />
            {/* Car */}
            <rect x="110" y="168" width="50" height="18" fill="white" rx="5" />
            <rect x="120" y="160" width="30" height="12" fill="white" opacity="0.8" rx="3" />
            <circle cx="120" cy="188" r="6" fill="#1E3A8A" />
            <circle cx="150" cy="188" r="6" fill="#1E3A8A" />
          </svg>
        </div>
      </div>

      {/* ── Right Panel ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-6">
        <div className="w-full max-w-md">
          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full border-2 border-blue-200 flex items-center justify-center bg-blue-50">
              <User size={28} className="text-blue-500" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-500 text-sm mt-1">Sign in to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Username</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter Username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Enter Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember / Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Remember Me</span>
              </label>
              <button type="button" className="text-sm text-blue-600 font-medium hover:underline">
                Forgot Password?
              </button>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60"
            >
              <LogIn size={18} />
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Demo login */}
          <button
            onClick={handleDemo}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-colors disabled:opacity-60"
          >
            <Shield size={18} className="text-blue-500" />
            Login as Demo
          </button>

          {/* Footer */}
          <div className="text-center mt-10 space-y-1">
            <p className="text-xs text-blue-500 font-medium">Version 1.0</p>
            <p className="text-xs text-gray-400">© 2026 Property &amp; Garage Management System</p>
            <p className="text-xs text-gray-400">Powered by Your Company Name</p>
          </div>
        </div>
      </div>
    </div>
  );
}
