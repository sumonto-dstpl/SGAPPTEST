import { ReactNode, useState, useEffect } from 'react';
import {
  LayoutDashboard, Store, Car, Settings, Cloud, LogOut,
  Bell, ChevronDown, Calendar, Menu, Building2
} from 'lucide-react';
import { Page } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface NavItem { id: Page; label: string; icon: ReactNode }

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'markets',   label: 'Markets',   icon: <Store size={20} /> },
  { id: 'garages',   label: 'Garages',   icon: <Car size={20} /> },
  // Shops screen hidden for now
  // { id: 'shops',     label: 'Shops',     icon: <ShoppingBag size={20} /> },
  { id: 'settings',  label: 'Settings',  icon: <Settings size={20} /> },
  { id: 'backup',    label: 'Backup',    icon: <Cloud size={20} /> },
];

interface Props {
  children: ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const day     = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const weekday = now.toLocaleDateString('en-GB', { weekday: 'long' });
  const time    = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const [hm, ampm] = time.split(' ');
  return (
    <div className="mx-3 mb-4 bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
      <div className="flex items-center justify-center gap-2 text-gray-400 mb-1">
        <Calendar size={14} />
        <span className="text-xs">{day}</span>
      </div>
      <p className="text-xs text-gray-400 mb-2">{weekday}</p>
      <p className="text-2xl font-bold text-gray-800 tracking-tight">
        {hm} <span className="text-sm font-medium text-gray-500">{ampm}</span>
      </p>
    </div>
  );
}

export default function Layout({ children, currentPage, onNavigate }: Props) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const activePage = currentPage === 'market-detail' ? 'markets' : currentPage;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-52' : 'w-16'} transition-all duration-300 bg-white border-r border-gray-100 flex flex-col shadow-sm flex-shrink-0`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 size={16} className="text-white" />
          </div>
          {sidebarOpen && (
            <span className="text-sm font-bold text-gray-800 leading-tight">
              Property &<br />Garage Mgmt.
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map(item => {
            const active = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={active ? 'text-white' : 'text-gray-400'}>{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Clock */}
        {sidebarOpen && <Clock />}

        {/* Logout */}
        <div className="px-2 pb-4">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-5 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
            >
              <Menu size={18} />
            </button>
            <span className="text-sm font-semibold text-gray-700 hidden sm:block">
              Property &amp; Garage Management System
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
              <Bell size={18} />
              {/* <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">5</span> */}
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg">
              <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600">{(user?.username?.[0] ?? 'A').toUpperCase()}</span>
              </div>
              <span className="text-sm font-medium text-gray-700">{user?.username ?? 'Admin'}</span>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
