import { useState } from 'react';
import { Search, Eye, IndianRupee, ShoppingBag, CheckCircle, XCircle, Banknote } from 'lucide-react';
import { useData } from '../store/DataContext';
import { useSnackbar } from '../contexts/SnackbarContext';
import { Shop } from '../types';
import ShopDetailModal from '../components/ShopDetailModal';

const PER_PAGE = 8;

function fmt(n: number) { return `₹${n.toLocaleString('en-IN')}`; }

function fmtDate(s: string) {
  if (!s) return '—';
  try { return new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return s; }
}

export default function Shops() {
  const { shops, markets, updateShop, addPayment } = useData();
  const { showSnackbar } = useSnackbar();
  const [search, setSearch]       = useState('');
  const [marketF, setMarketF]     = useState('');
  const [typeF, setTypeF]         = useState('');
  const [statusF, setStatusF]     = useState('');
  const [page, setPage]           = useState(1);
  const [selected, setSelected]   = useState<Shop | null>(null);
  const [collecting, setCollecting] = useState<string | null>(null);

  const handleCollect = async (shop: Shop) => {
    setCollecting(shop.id);
    try {
      await updateShop(shop.id, { paidRent: shop.monthlyRent, currentDue: 0, paymentStatus: 'Paid' });
      await addPayment({
        date: new Date().toISOString().split('T')[0],
        name: `${shop.tenantName} (${shop.shopName})`,
        type: 'Shop',
        amount: shop.currentDue,
        reference: `COLL-${Date.now().toString(36).toUpperCase()}`,
      });
      showSnackbar(`₹${shop.currentDue.toLocaleString('en-IN')} collected from ${shop.shopName}`, 'success');
    } catch { showSnackbar('Failed to collect payment', 'error'); }
    finally { setCollecting(null); }
  };

  const filtered = shops.filter(s => {
    const q = search.toLowerCase();
    const matchQ = !q || s.shopName.toLowerCase().includes(q) || s.tenantName.toLowerCase().includes(q) || s.phoneNumber.includes(q);
    const matchM = !marketF || s.marketId === marketF;
    const matchT = !typeF || s.shopType === typeF;
    const matchS = !statusF || s.paymentStatus === statusF;
    return matchQ && matchM && matchT && matchS;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current    = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const getMarketName = (id: string) => markets.find(m => m.id === id)?.name ?? '—';

  // Stats
  const totalRent  = shops.reduce((s, x) => s + x.monthlyRent, 0);
  const totalPaid  = shops.reduce((s, x) => s + x.paidRent, 0);
  const totalDue   = shops.reduce((s, x) => s + x.currentDue, 0);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Shops</h1>
        <p className="text-sm text-gray-500 mt-0.5">All rented and leased shops across all markets</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Shops',  value: shops.length,         sub: 'Across all markets',    icon: <ShoppingBag size={22} />, color: 'text-blue-600',  bg: 'bg-blue-50' },
          { label: 'Total Rent',   value: fmt(totalRent),       sub: 'Total expected rent',   icon: <IndianRupee size={22} />, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total Paid',   value: fmt(totalPaid),       sub: 'Amount received',       icon: <CheckCircle size={22} />, color: 'text-teal-600',  bg: 'bg-teal-50' },
          { label: 'Total Due',    value: fmt(totalDue),        sub: 'Pending amount',        icon: <XCircle size={22} />,     color: 'text-red-600',   bg: 'bg-red-50' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-3 shadow-sm">
            <div className={`w-11 h-11 rounded-xl ${c.bg} ${c.color} flex items-center justify-center flex-shrink-0`}>{c.icon}</div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{c.label}</p>
              <p className={`text-xl font-bold mt-0.5 ${c.color}`}>{c.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search by shop name, tenant, phone..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>
          <select value={marketF} onChange={e => { setMarketF(e.target.value); setPage(1); }}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Markets</option>
            {markets.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <select value={typeF} onChange={e => { setTypeF(e.target.value); setPage(1); }}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Types</option>
            <option value="Rented">Rented</option>
            <option value="Leased">Leased</option>
          </select>
          <select value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1); }}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Due">Due</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Shop Name','Market','Tenant','Phone','Type','Monthly Rent','Paid Rent','Current Due','Due Date','Status','Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {current.length === 0 ? (
                <tr><td colSpan={11} className="text-center py-10 text-gray-400 text-sm">No shops found</td></tr>
              ) : current.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{s.shopName}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{getMarketName(s.marketId)}</td>
                  <td className="px-4 py-3 text-gray-700">{s.tenantName}</td>
                  <td className="px-4 py-3 text-gray-600">{s.phoneNumber}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${s.shopType === 'Rented' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{s.shopType}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{s.monthlyRent.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-gray-700">{s.paidRent.toLocaleString('en-IN')}</td>
                  <td className={`px-4 py-3 font-semibold ${s.currentDue > 0 ? 'text-red-600' : 'text-gray-700'}`}>{s.currentDue.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtDate(s.dueDate)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${s.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.paymentStatus === 'Paid' ? 'bg-green-500' : 'bg-red-500'}`} />
                      {s.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {s.paymentStatus === 'Due' && s.currentDue > 0 && (
                        <button
                          onClick={() => handleCollect(s)}
                          disabled={collecting === s.id}
                          className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
                        >
                          <Banknote size={13} />
                          {collecting === s.id ? '...' : 'Collect'}
                        </button>
                      )}
                      <button onClick={() => setSelected(s)} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors">
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
          <span>Showing {filtered.length === 0 ? 0 : (page-1)*PER_PAGE+1} to {Math.min(page*PER_PAGE, filtered.length)} of {filtered.length} entries</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">‹</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = totalPages <= 5 ? i+1 : page <= 3 ? i+1 : page >= totalPages-2 ? totalPages-4+i : page-2+i;
              return (
                <button key={pg} onClick={() => setPage(pg)} className={`px-3 py-1.5 rounded-lg border ${page===pg ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 hover:bg-gray-50'}`}>{pg}</button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">›</button>
          </div>
        </div>
      </div>

      {selected && <ShopDetailModal shop={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
