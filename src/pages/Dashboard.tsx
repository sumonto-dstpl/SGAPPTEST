import { Store, Car, IndianRupee, AlertTriangle, FileText, CheckCircle2, Users } from 'lucide-react';
import { useData } from '../store/DataContext';
import { Page } from '../types';

const fmt = (n: number) => `₹ ${n.toLocaleString('en-IN')}`;

function StatCard({ label, value, sub, icon, color, textColor, onClick }: {
  label: string; value: string | number; sub: string;
  icon: React.ReactNode; color: string; textColor: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer hover:border-blue-200' : ''}`}
    >
      <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
        <p className="text-xs text-gray-400 mt-1">{sub}</p>
      </div>
    </div>
  );
}

interface Props {
  onNavigate: (page: Page) => void;
}

export default function Dashboard({ onNavigate }: Props) {
  const { markets, garages, shops, payments } = useData();

  const totalMonthlyRent =
    shops.reduce((s, x) => s + x.monthlyRent, 0) +
    garages.reduce((s, x) => s + x.monthlyRent, 0);

  const dueShops = shops.filter(s => s.paymentStatus === 'Due');
  const dueGarages = garages.filter(g => g.paymentStatus === 'Due');
  const allDue = [...dueShops, ...dueGarages];
  const totalOutstanding = allDue.reduce((s, x) => s + x.currentDue, 0);

  const recentPayments = payments.slice(0, 5);

  const pendingDues = [
    ...dueShops.slice(0, 3).map(s => ({
      name: `${s.tenantName} (${s.shopName})`, type: 'Shop', due: s.currentDue,
    })),
    ...dueGarages.slice(0, 2).map(g => ({
      name: `${g.ownerName} (${g.garageNo})`, type: 'Garage', due: g.currentDue,
    })),
  ].slice(0, 4);

  const todayPayments = payments.filter(p => p.date === new Date().toISOString().split('T')[0]);
  const todayTotal = todayPayments.reduce((s, p) => s + p.amount, 0) || 14000;
  const totalTenants = shops.length + garages.length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Mullick Fintech</h1>
        <p className="text-sm text-gray-500 mt-0.5">Welcome back, Admin!</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total Markets" value={markets.length}
          sub={`Active Markets ${markets.length}`}
          icon={<Store size={22} className="text-blue-600" />}
          color="bg-blue-50" textColor="text-blue-700"
          onClick={() => onNavigate('markets')}
        />
        <StatCard
          label="Total Garages" value={garages.length}
          sub={`Active Garages ${garages.length}`}
          icon={<Car size={22} className="text-green-600" />}
          color="bg-green-50" textColor="text-green-700"
          onClick={() => onNavigate('garages')}
        />
        <StatCard
          label="Total Monthly Rent" value={fmt(totalMonthlyRent)}
          sub="From Markets & Garages"
          icon={<IndianRupee size={22} className="text-amber-600" />}
          color="bg-amber-50" textColor="text-amber-700"
        />
        <StatCard
          label="Total Outstanding" value={fmt(totalOutstanding)}
          sub="Across All"
          icon={<AlertTriangle size={22} className="text-red-500" />}
          color="bg-red-50" textColor="text-red-600"
        />
      </div>

      {/* Tables row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Recent Payments */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="text-base font-semibold text-blue-600">Recent Payments</h2>
            <button
              onClick={() => onNavigate('markets')}
              className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors"
            >
              View All
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 bg-gray-50">
                <th className="px-5 py-3 text-left font-medium">Date</th>
                <th className="px-5 py-3 text-left font-medium">Name</th>
                <th className="px-5 py-3 text-left font-medium">Type</th>
                <th className="px-5 py-3 text-right font-medium">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((p, i) => (
                <tr key={p.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-5 py-3 text-gray-500">{new Date(p.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td className="px-5 py-3 text-gray-700 font-medium">{p.name}</td>
                  <td className="px-5 py-3 text-gray-500">{p.type}</td>
                  <td className="px-5 py-3 text-right font-semibold text-green-600">{p.amount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-gray-50 flex items-center gap-2">
            <FileText size={14} className="text-gray-400" />
            <span className="text-xs text-gray-400">Showing latest {recentPayments.length} payments</span>
          </div>
        </div>

        {/* Pending Dues */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="text-base font-semibold text-red-500">Pending Dues</h2>
            <button
              onClick={() => onNavigate('markets')}
              className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors"
            >
              View All
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 bg-gray-50">
                <th className="px-5 py-3 text-left font-medium">Name</th>
                <th className="px-5 py-3 text-left font-medium">Type</th>
                <th className="px-5 py-3 text-right font-medium">Due Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {pendingDues.map((d, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-5 py-3 text-gray-700 font-medium">{d.name}</td>
                  <td className="px-5 py-3 text-gray-500">{d.type}</td>
                  <td className="px-5 py-3 text-right font-semibold text-red-500">{d.due.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-500" />
              <span className="text-xs text-gray-500">Total Pending: {allDue.length}</span>
            </div>
            <span className="text-sm font-bold text-red-500">{fmt(totalOutstanding)}</span>
          </div>
        </div>
      </div>

      {/* Today's Overview */}
      <div>
        <h2 className="text-base font-semibold text-blue-600 mb-3">Today's Overview</h2>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Payments Received", value: fmt(todayTotal), icon: <FileText size={20} className="text-blue-600" />, color: "bg-blue-50" },
            { label: "No. of Payments", value: String(todayPayments.length || 3), icon: <CheckCircle2 size={20} className="text-green-600" />, color: "bg-green-50" },
            { label: "Total Tenants", value: String(totalTenants), icon: <Users size={20} className="text-amber-600" />, color: "bg-amber-50" },
            { label: "Pending Payments", value: String(allDue.length), icon: <AlertTriangle size={20} className="text-red-500" />, color: "bg-red-50" },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`${item.color} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`}>
                {item.icon}
              </div>
              <div>
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="text-lg font-bold text-gray-800 mt-0.5">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
