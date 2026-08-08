import { useState } from 'react';
import { Search, Eye, IndianRupee, ShoppingBag, CheckCircle, XCircle, Banknote, Pencil } from 'lucide-react';
import { useData } from '../store/DataContext';
import { useSnackbar } from '../contexts/SnackbarContext';
import { Shop } from '../types';
import ShopDetailModal from '../components/ShopDetailModal';
import CollectPaymentModal from '../components/CollectPaymentModal';
import Modal from '../components/Modal';

const PER_PAGE = 10;

function fmt(n: number) { return `₹${n.toLocaleString('en-IN')}`; }

function fmtDate(s: string) {
  if (!s) return '—';
  try { return new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return s; }
}

function EditShopModal({ shop, onClose, onRequestCollect }: { shop: Shop; onClose: () => void; onRequestCollect: (shop: Shop) => void }) {
  const { updateShop } = useData();
  const { showSnackbar } = useSnackbar();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    shopName: shop.shopName,
    tenantName: shop.tenantName,
    phoneNumber: shop.phoneNumber,
    monthlyRent: String(shop.monthlyRent),
    paidRent: String(shop.paidRent),
    paymentStatus: shop.paymentStatus,
    currentDue: String(shop.currentDue),
    remark: shop.remark ?? '',
  });
  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.shopName || !form.tenantName || !form.phoneNumber || !form.monthlyRent) {
      showSnackbar('Please fill all required fields', 'warning');
      return;
    }
    setSaving(true);
    try {
      const statusChangedToPaid = shop.paymentStatus === 'Due' && form.paymentStatus === 'Paid';
      const statusChangedToDue = shop.paymentStatus === 'Paid' && form.paymentStatus === 'Due';
      const newCurrentDue= statusChangedToDue ? form.monthlyRent : statusChangedToPaid ? shop.currentDue : (Number(form.monthlyRent - shop.monthlyRent) + Number(form.currentDue) || 0;
      await updateShop(shop.id, {
        shopName: form.shopName,
        tenantName: form.tenantName,
        phoneNumber: form.phoneNumber,
        monthlyRent: Number(form.monthlyRent),
        paidRent: Number(form.paidRent) || 0,
        currentDue: newCurrentDue,
        paymentStatus: statusChangedToPaid ? 'Due' : (form.paymentStatus as Shop['paymentStatus']),
        remark: form.remark.trim() || undefined,
      });
      if (statusChangedToPaid) {
        showSnackbar('Shop details saved. Please collect the payment.', 'info');
        onClose();
        onRequestCollect({ ...shop, shopName: form.shopName, tenantName: form.tenantName, monthlyRent: Number(form.monthlyRent) });
      } else {
        showSnackbar('Shop updated successfully', 'success');
        onClose();
      }
    } catch { showSnackbar('Failed to update shop', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <Modal open={true} onClose={onClose} title={`Edit Shop — ${shop.shopName}`}>
      <div className="space-y-4">
        {[
          { label: 'Shop Name *', key: 'shopName', placeholder: 'e.g. Shop A-09' },
          { label: 'Tenant Name *', key: 'tenantName', placeholder: 'Mr. Kumar' },
          { label: 'Phone Number *', key: 'phoneNumber', placeholder: '9876543210' },
          { label: 'Monthly Rent (₹) *', key: 'monthlyRent', placeholder: '5000', type: 'number' },
          { label: 'Paid Rent (₹)', key: 'paidRent', placeholder: '0', type: 'number' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
            <input
              type={f.type ?? 'text'} placeholder={f.placeholder}
              value={form[f.key as keyof typeof form] as string}
              onChange={e => set(f.key as keyof typeof form, e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
          <select
            value={form.paymentStatus}
            onChange={e => set('paymentStatus', e.target.value as Shop['paymentStatus'])}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          >
            <option value="Due">Due</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Due (₹)</label>
          <input
            type="number"
            value={form.currentDue}
            onChange={e => set('currentDue', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
          <textarea
            value={form.remark}
            onChange={e => set('remark', e.target.value)}
            placeholder="Optional remark..."
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={submit} disabled={saving} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60">{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>
    </Modal>
  );
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
  const [collectShop, setCollectShop] = useState<Shop | null>(null);
  const [editShop, setEditShop]   = useState<Shop | null>(null);

  const handleCollect = async (shop: Shop, amount: number, remark: string) => {
    const newPaid = shop.paidRent + amount;
    const newDue = shop.currentDue - amount;
    const newStatus = newDue <= 0 ? 'Paid' : 'Due';
    await updateShop(shop.id, { paidRent: newPaid, currentDue: Math.max(0, newDue), paymentStatus: newStatus });
    await addPayment({
      date: new Date().toISOString().split('T')[0],
      name: `${shop.tenantName} (${shop.shopName})`,
      type: 'Shop',
      amount,
      reference: `COLL-${Date.now().toString(36).toUpperCase()}`,
      remark: remark || undefined,
    });
    showSnackbar(
      `₹${amount.toLocaleString('en-IN')} collected from ${shop.shopName}${newStatus === 'Due' ? ` (Part payment — ₹${newDue.toLocaleString('en-IN')} remaining)` : ''}`,
      'success',
    );
    setCollectShop(null);
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
                {['Shop Name','Market','Tenant','Phone','Type','Monthly Rent','Paid Rent','Current Due','Due Date','Status','Remark','Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {current.length === 0 ? (
                <tr><td colSpan={12} className="text-center py-10 text-gray-400 text-sm">No shops found</td></tr>
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
                  <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate" title={s.remark || ''}>{s.remark || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {s.paymentStatus === 'Due' && s.currentDue > 0 && (
                        <button
                          onClick={() => setCollectShop(s)}
                          className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Banknote size={13} />
                          Collect
                        </button>
                      )}
                      <button onClick={() => setEditShop(s)} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors" title="Edit">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => setSelected(s)} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors" title="View">
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
      {editShop && <EditShopModal shop={editShop} onClose={() => setEditShop(null)} onRequestCollect={(s) => setCollectShop(s)} />}
      {collectShop && (
        <CollectPaymentModal
          open={true}
          onClose={() => setCollectShop(null)}
          title={`Collect Payment — ${collectShop.shopName}`}
          currentDue={collectShop.currentDue}
          onConfirm={(amt, rem) => handleCollect(collectShop, amt, rem)}
        />
      )}
    </div>
  );
}
