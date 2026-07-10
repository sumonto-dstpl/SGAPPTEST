import { useState } from 'react';
import { Plus, Trash2, RefreshCw, Search, MoreHorizontal, IndianRupee, Store, Wallet, FileWarning, X, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { useData } from '../store/DataContext';
import { Market } from '../types';
import Modal from '../components/Modal';
import { useSnackbar } from '../contexts/SnackbarContext';

const ITEMS_PER_PAGE = 8;

function AddMarketModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addMarket } = useData();
  const { showSnackbar } = useSnackbar();
  const [form, setForm] = useState({ name: '', phoneNumber: '', monthlyRent: '', address: '' });

  const [saving, setSaving] = useState(false);
  const submit = async () => {
    if (!form.name || !form.phoneNumber || !form.monthlyRent) return;
    setSaving(true);
    try {
      await addMarket({ name: form.name, phoneNumber: form.phoneNumber, monthlyRent: Number(form.monthlyRent), address: form.address });
      showSnackbar(`${form.name} added successfully`, 'success');
      setForm({ name: '', phoneNumber: '', monthlyRent: '', address: '' });
      onClose();
    } catch { showSnackbar('Failed to add market', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add New Market">
      <div className="space-y-4">
        {[
          { label: 'Market Name', key: 'name', placeholder: 'e.g. Market A' },
          { label: 'Phone Number', key: 'phoneNumber', placeholder: '9876543210' },
          { label: 'Monthly Rent (₹)', key: 'monthlyRent', placeholder: '5000', type: 'number' },
          { label: 'Address (Optional)', key: 'address', placeholder: '12 Main Street' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
            <input
              type={f.type || 'text'}
              placeholder={f.placeholder}
              value={form[f.key as keyof typeof form]}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        ))}
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={submit} disabled={saving} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60">{saving ? 'Saving...' : 'Add Market'}</button>
        </div>
      </div>
    </Modal>
  );
}

function EditMarketModal({ market, onClose }: { market: Market; onClose: () => void }) {
  const { updateMarket } = useData();
  const { showSnackbar } = useSnackbar();
  const [form, setForm] = useState({ name: market.name, phoneNumber: market.phoneNumber, monthlyRent: String(market.monthlyRent), address: market.address || '' });

  const [saving, setSaving] = useState(false);
  const submit = async () => {
    setSaving(true);
    try {
      await updateMarket(market.id, { name: form.name, phoneNumber: form.phoneNumber, monthlyRent: Number(form.monthlyRent), address: form.address });
      showSnackbar('Market updated successfully', 'success');
      onClose();
    } catch { showSnackbar('Failed to update market', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <Modal open={true} onClose={onClose} title="Edit Market">
      <div className="space-y-4">
        {[
          { label: 'Market Name', key: 'name' },
          { label: 'Phone Number', key: 'phoneNumber' },
          { label: 'Monthly Rent (₹)', key: 'monthlyRent', type: 'number' },
          { label: 'Address', key: 'address' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
            <input
              type={f.type || 'text'}
              value={form[f.key as keyof typeof form]}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        ))}
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={submit} disabled={saving} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60">{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>
    </Modal>
  );
}

interface Props {
  onViewMarket: (market: Market) => void;
}

export default function Markets({ onViewMarket }: Props) {
  const { markets, shops, deleteMarket } = useData();
  const { showSnackbar } = useSnackbar();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editMarket, setEditMarket] = useState<Market | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const totalRents = markets.reduce((s, m) => s + m.monthlyRent, 0);
  const shopDues = shops.filter(s => s.paymentStatus === 'Due').reduce((s, x) => s + x.currentDue, 0);
  const shopPaid = shops.filter(s => s.paymentStatus === 'Paid').reduce((s, x) => s + x.paidRent, 0);

  const filtered = markets.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.phoneNumber.includes(search)
  );
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this market and all its shops?')) return;
    try { await deleteMarket(id); showSnackbar('Market deleted', 'success'); } catch { showSnackbar('Failed to delete market', 'error'); }
    setMenuOpen(null);
  };

  const handleDeleteSelected = async () => {
    if (!selected.length) return;
    if (!window.confirm(`Delete ${selected.length} selected market(s)?`)) return;
    try {
      await Promise.all(selected.map(id => deleteMarket(id)));
      showSnackbar(`${selected.length} market(s) deleted`, 'success');
      setSelected([]);
    } catch { showSnackbar('Failed to delete some markets', 'error'); }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Markets</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all registered markets</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
            <Plus size={16} /> Add Market
          </button>
          {/* Delete button hidden for now */}
          {/* {selected.length > 0 && (
            <button onClick={handleDeleteSelected} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-xl hover:bg-red-100 transition-colors border border-red-200">
              <Trash2 size={16} /> Delete ({selected.length})
            </button>
          )} */}
          <button onClick={() => setSearch('')} className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Markets', value: markets.length, sub: 'All registered markets', icon: <Store size={20} className="text-blue-600" />, color: 'bg-blue-50', textColor: 'text-blue-700' },
          { label: 'Total Rents', value: `₹ ${totalRents.toLocaleString('en-IN')}`, sub: 'Total expected rent', icon: <IndianRupee size={20} className="text-green-600" />, color: 'bg-green-50', textColor: 'text-green-700' },
          { label: 'Total Paid', value: `₹ ${shopPaid.toLocaleString('en-IN')}`, sub: 'Total amount received', icon: <Wallet size={20} className="text-green-600" />, color: 'bg-green-50', textColor: 'text-green-700' },
          { label: 'Total Due', value: `₹ ${shopDues.toLocaleString('en-IN')}`, sub: 'Total pending amount', icon: <FileWarning size={20} className="text-red-500" />, color: 'bg-red-50', textColor: 'text-red-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`${s.color} w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0`}>{s.icon}</div>
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`text-lg font-bold ${s.textColor} mt-0.5`}>{s.value}</p>
              <p className="text-xs text-gray-400">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-80">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by Market Name or Phone No..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Market Name</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone Number</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Monthly Rent (₹)</th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginated.map(market => (
              <tr
                key={market.id}
                onClick={() => onViewMarket(market)}
                className="hover:bg-gray-50 transition-colors group cursor-pointer"
              >
                <td className="px-5 py-4 font-semibold text-gray-800">{market.name}</td>
                <td className="px-5 py-4 text-gray-600">{market.phoneNumber}</td>
                <td className="px-5 py-4 text-gray-700">₹ {market.monthlyRent.toLocaleString('en-IN')}</td>
                <td className="px-5 py-4" >
                  <div className="flex items-center justify-end gap-2">
                    {/* <button
                      onClick={() => { setEditMarket(market); }}
                      className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button> */}
                    <div className="relative" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={() => setMenuOpen(menuOpen === market.id ? null : market.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {menuOpen === market.id && (
                        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden min-w-[140px]">
                          <button onClick={() => { setEditMarket(market); setMenuOpen(null); }} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(market.id)} className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400 text-sm">No markets found</td></tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-5 py-4 border-t border-gray-50 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {filtered.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1} to {Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} entries
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors">
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(totalPages, 4) }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === n ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{n}</button>
            ))}
            {totalPages > 4 && <span className="px-1 text-gray-400">...</span>}
            {totalPages > 4 && (
              <button onClick={() => setPage(totalPages)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === totalPages ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{totalPages}</button>
            )}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <AddMarketModal open={showAdd} onClose={() => setShowAdd(false)} />
      {editMarket && <EditMarketModal market={editMarket} onClose={() => setEditMarket(null)} />}

      {/* Close dropdown on outside click */}
      {menuOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
      )}
    </div>
  );
}
