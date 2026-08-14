import { useState, useEffect } from 'react';
import {
  ArrowLeft, Plus, Trash2, RefreshCw, Search, Eye, MoreHorizontal, X, Pencil,
  Store, IndianRupee, Wallet, FileWarning, ChevronLeft, ChevronRight, Banknote
} from 'lucide-react';
import { Market, Shop, PaymentDate } from '../types';
import { useData } from '../store/DataContext';
import { useSnackbar } from '../contexts/SnackbarContext';
import Modal from '../components/Modal';
import ShopDetailModal from '../components/ShopDetailModal';
import CollectPaymentModal from '../components/CollectPaymentModal';

const PER_PAGE = 10;

function fmt(n: number) { return n.toLocaleString('en-IN'); }
function fmtDate(s: string) {
  if (!s) return '—';
  try { return new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return s; }
}

// ─── Add Shop Modal ───────────────────────────────────────────────────────────

function AddShopModal({ open, onClose, market }: { open: boolean; onClose: () => void; market: Market }) {
  const { addShop, shops } = useData();
  const { showSnackbar } = useSnackbar();
  const [shopType, setShopType] = useState<'Rented' | 'Leased'>('Rented');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    shopName: '', tenantName: '', phoneNumber: '', monthlyRent: '',currentDue: '',
    dueDate: '', startDate: '', endDate: '', shopArea: '',
  });

  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  // // Autofill end date and due date based on start date
  // useEffect(() => {
  //   if (form.startDate) {
  //     const startDate = new Date(form.startDate);
  //     let endDate: Date;
  //     let dueDate: Date;

  //     if (shopType === 'Rented') {
  //       // Monthly: end date = one day before same date next month, due date = same date next month
  //       endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate());
  //       dueDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()+1);
  //     } else {
  //       // Yearly: end date = one day before same date next year, due date = same date next year
  //       endDate = new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate() );
  //       dueDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()+1);
  //     }

  //     const formatDate = (d: Date) => d.toISOString().split('T')[0];
  //     setForm(p => ({ ...p, endDate: formatDate(endDate), dueDate: formatDate(dueDate) }));
  //   }
  // }, [form.startDate, shopType]);

const formatDate = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};
useEffect(() => {
  if (form.startDate) {
    const startDate = new Date(form.startDate);

    let endDate: Date;

    if (shopType === 'Rented') {
      endDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        startDate.getDate() - 1
      );
    } else {
      endDate = new Date(
        startDate.getFullYear() + 1,
        startDate.getMonth(),
        startDate.getDate() - 1
      );
    }

    setForm(p => ({
      ...p,
      endDate: formatDate(endDate),
    }));
  }
}, [form.startDate, shopType]);
useEffect(() => {
  if (form.endDate) {
    const endDate = new Date(form.endDate);

    const dueDate = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate() + 1
    );

    setForm(p => ({
      ...p,
      dueDate: formatDate(dueDate),
    }));
  }
}, [form.endDate]);
  useEffect(() => {
  if (!form.startDate || !form.endDate || !form.monthlyRent) {
    setForm(p => ({ ...p, currentDue: '' }));
    return;
  }

  const [startYear, startMonth, startDay] = form.startDate
    .split('-')
    .map(Number);

  const [endYear, endMonth, endDay] = form.endDate
    .split('-')
    .map(Number);

  let totalMonths =
    (endYear - startYear) * 12 +
    (endMonth - startMonth);

  // Same day or later = next billing month has started
  if (endDay >= startDay) {
    totalMonths += 1;
  }

  // At least 1 month
  totalMonths = Math.max(1, totalMonths);

  const currentDue = Number(form.monthlyRent) * totalMonths;

  setForm(p => ({
    ...p,
    currentDue: String(currentDue),
  }));
}, [
  form.startDate,
  form.endDate,
  form.monthlyRent,  
]);


  // Reset dates when shop type changes
  useEffect(() => {
    setForm(p => ({ ...p, startDate: '', endDate: '', dueDate: '' }));
  }, [shopType]);

  const submit = async () => {
    if (!form.shopName || !form.tenantName || !form.phoneNumber || !form.monthlyRent) {
      showSnackbar('Please fill all required fields', 'warning');
      return;
    }
    if (shops.some(s => s.shopName.toLowerCase() === form.shopName.trim().toLowerCase())) {
      showSnackbar(`Shop name "${form.shopName.trim()}" already exists`, 'warning');
      return;
    }
    setSaving(true);
    try {
      await addShop({
        marketId: market.id, shopName: form.shopName, tenantName: form.tenantName,
        phoneNumber: form.phoneNumber, monthlyRent: Number(form.monthlyRent),
        paidRent: 0, currentDue: Number(form.currentDue), dueDate: form.dueDate,
        paymentStatus: 'Due', shopType, startDate: form.startDate, endDate: form.endDate,
        shopArea: form.shopArea.trim() || undefined,
      });
      showSnackbar(`${form.shopName} added successfully`, 'success');
      setForm({ shopName: '', tenantName: '', phoneNumber: '', monthlyRent: '',currentDue: '', dueDate: '', startDate: '', endDate: '', shopArea: '' });
      onClose();
    } catch { showSnackbar('Failed to add shop', 'error'); }
    finally { setSaving(false); }
  };

  const rentLabel = shopType === 'Rented' ? 'Monthly Rent (₹) *' : 'Yearly Rent (₹) *';

  return (
    <Modal open={open} onClose={onClose} title="Add New Shop">
      <div className="space-y-4">
        {/* Shop Type toggle */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
          {(['Rented', 'Leased'] as const).map(t => (
            <button key={t} onClick={() => setShopType(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${shopType === t ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>
              {t}
            </button>
          ))}
        </div>

        {[
          { label: 'Shop Name *',        key: 'shopName',     placeholder: 'e.g. Shop A-09' },
          { label: 'Tenant Name *',      key: 'tenantName',   placeholder: 'Mr. Kumar' },
          { label: 'Phone Number *',     key: 'phoneNumber',  placeholder: '9876543210' },
          { label: rentLabel,            key: 'monthlyRent',  placeholder: shopType === 'Rented' ? '5000' : '60000', type: 'number' },
      { label: "Current Due (₹)", key: 'currentDue',  placeholder: '5000', type: 'number' },
          { label: 'Shop Area (sqft)',     key: 'shopArea',     placeholder: 'e.g. 250' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
            <input
              type={f.type ?? 'text'} placeholder={f.placeholder}
              value={form[f.key as keyof typeof form]}
              onChange={e => set(f.key as keyof typeof form, e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>
        ))}

        {/* Start Date - only editable date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            value={form.startDate}
            onChange={e => set('startDate', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          />
        </div>

        {/* End Date - auto-filled, read-only */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            value={form.endDate}
             onChange={e => set('endDate', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          />
        </div>

        {/* Due Date - auto-filled, read-only */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
          <input
            type="date"
            value={form.dueDate}
             onChange={e => set('dueDate', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={submit} disabled={saving}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
            {saving ? 'Saving...' : 'Add Shop'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Edit Shop Modal ───────────────────────────────────────────────────────────

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
    endDate: shop.endDate,
    dueDate: shop.dueDate,
    shopArea: shop.shopArea ?? '',
    // paymentDate: shop.paymentDate ?? '',
    remark: shop.remark ?? '',
  });

  const formatDate = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};
//   useEffect(() => {
//   if (form.endDate) {
//     const endDate = new Date(form.endDate);

//     const dueDate = new Date(
//       endDate.getFullYear(),
//       endDate.getMonth(),
//       endDate.getDate() + 1
//     );

//     setForm(p => ({
//       ...p,
//       dueDate: formatDate(dueDate),
//     }));
//   }
// }, [form.endDate]);
  useEffect(() => {
  if (form.endDate) {
    const [year, month, day] = form.endDate.split('-').map(Number);

    const dueDate = new Date(year, month - 1, day + 1);

    setForm(p => ({
      ...p,
      dueDate: formatDate(dueDate),
    }));
  }
}, [form.endDate]);

  useEffect(() => {
  if (!shop.startDate || !form.endDate || !form.monthlyRent) {
    return;
  }

  const [startYear, startMonth, startDay] =
    shop.startDate.split('-').map(Number);

  const [endYear, endMonth, endDay] =
    form.endDate.split('-').map(Number);

  let totalPeriods: number;

  if (shop.shopType === 'Rented') {
    // Monthly calculation
    totalPeriods =
      (endYear - startYear) * 12 +
      (endMonth - startMonth);

    // If end date reaches the start day,
    // another month has started.
    if (endDay >= startDay) {
      totalPeriods += 1;
    }
  } else {
    // Yearly calculation for Leased
    totalPeriods = endYear - startYear;

    // If end date reaches the anniversary date,
    // another year has started.
    const reachedAnniversary =
      endMonth > startMonth ||
      (endMonth === startMonth && endDay >= startDay);

    if (reachedAnniversary) {
      totalPeriods += 1;
    }
  }

  totalPeriods = Math.max(1, totalPeriods);

  const currentDue = (Number(form.monthlyRent) * totalPeriods)-shop.paidRent;

  setForm(p => ({
    ...p,
    currentDue: String(currentDue),
  }));
}, [
    form.paidRent,
  shop.startDate,
  shop.shopType,
  form.endDate,
  form.monthlyRent,
    
]);


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
      const newCurrentDue= statusChangedToDue ? form.currentDue : statusChangedToPaid ? shop.currentDue : Number(form.currentDue) || 0;
      await updateShop(shop.id, {
        shopName: form.shopName,
        tenantName: form.tenantName,
        phoneNumber: form.phoneNumber,
        monthlyRent: Number(form.monthlyRent),
        paidRent: Number(form.paidRent) || 0,
        currentDue: newCurrentDue,
        endDate: form.endDate,        
        dueDate: form.dueDate,
        paymentStatus: statusChangedToPaid ? 'Due' : (form.paymentStatus as Shop['paymentStatus']),
        shopArea: form.shopArea.trim() || undefined,
        // paymentDate: form.paymentDate || undefined,
        remark: form.remark.trim() || "",
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
    <Modal open={true} onClose={onClose} title="Edit Shop">
      <div className="space-y-4">
        {[
          { label: 'Shop Name *', key: 'shopName', placeholder: 'e.g. Shop A-09' },
          { label: 'Tenant Name *', key: 'tenantName', placeholder: 'Mr. Kumar' },
          { label: 'Phone Number *', key: 'phoneNumber', placeholder: '9876543210' },
          { label: 'Monthly Rent (₹) *', key: 'monthlyRent', placeholder: '5000', type: 'number' },
          { label: "Current Due (₹)", key: 'currentDue',  placeholder: '5000', type: 'number' },
          { label: 'Shop Area (sqft)',     key: 'shopArea',    placeholder: 'e.g. 250' },
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
            onChange={e => setForm(p => ({ ...p, paymentStatus: e.target.value as Shop['paymentStatus'] }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          >
            <option value="Due">Due</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
         <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            value={form.endDate}
             onChange={e => set('endDate', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          />
        </div>

        {/* Due Date - auto-filled, read-only */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
          <input
            type="date"
            value={form.dueDate}
             onChange={e => set('dueDate', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          />
        </div>
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
          <input type="datetime-local" value={form.paymentDate ? form.paymentDate.slice(0, 16) : ''} onChange={e => set('paymentDate', e.target.value ? new Date(e.target.value).toISOString() : '')}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
        </div> */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Due (₹)</label
          <input
            type="number"
            value={form.currentDue}
            onChange={e => set('currentDue', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          />
        </div> */}
        {/* {shop.paymentDate && (
          <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Payment Date</span>
            <span className="text-sm font-semibold text-gray-800">{new Date(shop.paymentDate).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span>
          </div>
        )} */}
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
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={submit} disabled={saving}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props { market: Market; onBack: () => void }

export default function MarketDetail({ market, onBack }: Props) {
  const { shops, deleteShop, updateShop, addPayment, refresh } = useData();
  const { showSnackbar } = useSnackbar();
  const [collectShop, setCollectShop] = useState<Shop | null>(null);

  const [tab, setTab]         = useState<'Rented' | 'Leased'>('Rented');
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [selected, setSelected] = useState<Shop | null>(null);
  const [editShop, setEditShop] = useState<Shop | null>(null);

  const marketShops = shops.filter(s => s.marketId === market.id);
  const tabShops    = marketShops.filter(s => s.shopType === tab);
  const filtered    = tabShops.filter(s => {
    const q = search.toLowerCase();
    return !q || s.shopName.toLowerCase().includes(q) || s.phoneNumber.includes(q) || s.tenantName.toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageShops  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Stat computations
  const totalShops = marketShops.length;
  const totalRent  = marketShops.reduce((s, x) => s + x.monthlyRent, 0);
  const totalPaid  = marketShops.reduce((s, x) => s + x.paidRent, 0);
  const totalDue   = marketShops.reduce((s, x) => s + x.currentDue, 0);

  const handleCollect = async (shop: Shop, amount: number, remark: string) => {
    const newPaid = shop.paidRent + amount;
    const newDue = Math.max(0, shop.currentDue - amount);
    const newStatus = newDue <= 0 ? 'Paid' : 'Due';
    const newPayment: PaymentDate = {
  amount: amount,
  paymentDate: new Date().toISOString(),
  remark: remark || shop.currentDue==amount ? "Fully Paid" : "Partially Paid",
};
    await updateShop(shop.id, { paidRent: newPaid, currentDue: newDue, paymentStatus: newStatus, payments: [
    ...(shop.payments || []),
    newPayment,
  ], remark: remark || shop.currentDue==amount ? "Fully Paid" : "Partially Paid", });
    await addPayment({
      date: new Date().toISOString().split('T')[0],
      name: `${shop.tenantName} (${shop.shopName})`,
      type: 'Shop',
      amount,
      reference: `COLL-${Date.now().toString(36).toUpperCase()}`,
      remark: remark || "",
    });
    showSnackbar(
      `₹${amount.toLocaleString('en-IN')} collected from ${shop.shopName}${newStatus === 'Due' ? ` (Part payment — ₹${newDue.toLocaleString('en-IN')} remaining)` : ''}`,
      'success',
    );
    setCollectShop(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteShop(id);
      showSnackbar('Shop deleted successfully', 'success');
    } catch { showSnackbar('Failed to delete shop', 'error'); }
    setMenuOpen(null);
  };

  const handleDeleteMarket = async () => {
    showSnackbar('Please delete the market from the Markets page', 'info');
  };

  const handleRefresh = async () => {
    await refresh();
    showSnackbar('Data refreshed', 'success');
  };
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

const handleMenuClick = (e, shopId) => {
  const rect = e.currentTarget.getBoundingClientRect();

  setMenuOpen(menuOpen === shopId ? null : shopId);

  setMenuPosition({
    top: rect.bottom + 4,
    left: rect.right - 120,
  });
};

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <button onClick={onBack} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600">
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{market.name} Details</h1>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500 ml-11">
            <button onClick={onBack} className="text-blue-600 hover:underline font-medium">Markets</button>
            <span>›</span>
            <span className="text-gray-700 font-medium">{market.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
            <Plus size={16} /> Add Shop
          </button>
          {/* <button onClick={handleDeleteMarket}
            className="flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors">
            <Trash2 size={16} /> Delete
          </button> */}
          <button onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Shops', value: totalShops, sub: `All shops under ${market.name}`, icon: <Store size={22} />, color: 'text-blue-600', bg: 'bg-blue-50', valClass: 'text-gray-900' },
          { label: 'Total Rent',  value: `₹ ${fmt(totalRent)}`, sub: 'Total expected rent', icon: <IndianRupee size={22} />, color: 'text-green-600', bg: 'bg-green-50', valClass: 'text-green-600' },
          { label: 'Total Paid',  value: `₹ ${fmt(totalPaid)}`, sub: 'Total amount received', icon: <Wallet size={22} />,     color: 'text-teal-600',  bg: 'bg-teal-50',  valClass: 'text-teal-600' },
          { label: 'Total Due',   value: `₹ ${fmt(totalDue)}`,  sub: 'Total pending amount', icon: <FileWarning size={22} />, color: 'text-red-600',   bg: 'bg-red-50',   valClass: 'text-red-600' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-3 shadow-sm">
            <div className={`w-12 h-12 rounded-xl ${c.bg} ${c.color} flex items-center justify-center flex-shrink-0`}>{c.icon}</div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{c.label}</p>
              <p className={`text-xl font-bold mt-0.5 ${c.valClass}`}>{c.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs + Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Tab header */}
        <div className="flex border-b border-gray-100">
          {(['Rented', 'Leased'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setPage(1); setSearch(''); }}
              className={`px-6 py-4 text-sm font-semibold transition-colors relative ${
                tab === t ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t} Shop List
              {tab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search by Shop Name or Phone Number..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Shop Name</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone Number</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{tab==="Leased"? "Yearly Rent (₹)" : "Monthly Rent (₹)"}</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Paid Rent (₹)</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Current Due (₹)</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Due Date</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Remark</th>
                <th className="text-right    px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pageShops.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-gray-400">No {tab.toLowerCase()} shops found</td></tr>
              ) : pageShops.map(shop => (
                <tr key={shop.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-gray-900">{shop.shopName}</td>
                  <td className="px-5 py-3.5 text-gray-600">{shop.phoneNumber}</td>
                  <td className="px-5 py-3.5 text-right text-gray-700">{fmt(shop.monthlyRent)}</td>
                  <td className="px-5 py-3.5 text-right text-gray-700">{fmt(shop.paidRent)}</td>
                  <td className={`px-5 py-3.5 text-right font-semibold ${shop.currentDue > 0 ? 'text-red-600' : 'text-gray-700'}`}>{fmt(shop.currentDue)}</td>
                  <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">{fmtDate(shop.dueDate)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      shop.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${shop.paymentStatus === 'Paid' ? 'bg-green-500' : 'bg-red-500'}`} />
                      {shop.paymentStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 max-w-[200px] truncate" title={shop.remark || ''}>{shop.remark || '—'}</td>
                  <td className="px-5 py-3.5 relative">
                    <div className="flex items-center justify-end gap-1">
                      {shop.paymentStatus === 'Due' && (
                        <button
                          onClick={() => setCollectShop(shop)}
                          title={`Collect ₹${shop.currentDue.toLocaleString('en-IN')}`}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
                        >
                          <Banknote size={13} />
                          Collect
                        </button>
                      )}
                      {/* <button onClick={() => setSelected(shop)}
                        className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors">
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => { setEditShop(shop); setMenuOpen(null); }}
                        className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button> */}
                      <div >
                       <button
      onClick={(e) => handleMenuClick(e, shop.id)}
      className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
    >
                          <MoreHorizontal size={16} />
                        </button>
                        {/* {menuOpen === shop.id && (
                          <div className="absolute right-10 bottom-5 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 min-w-[120px] animate-fade-in">
                            <button onClick={() => { setSelected(shop); setMenuOpen(null); }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                              <Eye size={14} /> View
                            </button>
                            <button onClick={() => { setEditShop(shop); setMenuOpen(null); }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                              <Pencil size={14} /> Edit
                            </button>
                            <button onClick={() => handleDelete(shop.id)}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                              <X size={14} /> Delete
                            </button>
                          </div>
                        )} */}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {menuOpen && (() => {
  const shop = pageShops.find(s => s.id === menuOpen);

  if (!shop) return null;

  return (
    <div
      className="fixed bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-[9999] min-w-[120px] animate-fade-in"
      style={{
        top: menuPosition.top,
        left: menuPosition.left,
      }}
    >
      <button
        onClick={() => {
          setSelected(shop);
          setMenuOpen(null);
        }}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
      >
        <Eye size={14} />
        View
      </button>

      <button
        onClick={() => {
          setEditShop(shop);
          setMenuOpen(null);
        }}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
      >
        <Pencil size={14} />
        Edit
      </button>

      <button
        onClick={() => {
          handleDelete(shop.id);
          setMenuOpen(null);
        }}
        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
      >
        <X size={14} />
        Delete
      </button>
    </div>
  );
})()}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 text-xs text-gray-500">
          <span>Showing {filtered.length === 0 ? 0 : (page-1)*PER_PAGE+1} to {Math.min(page*PER_PAGE, filtered.length)} of {filtered.length} entries</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:bg-gray-50">
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = totalPages <= 5 ? i+1 : page <= 3 ? i+1 : page >= totalPages-2 ? totalPages-4+i : page-2+i;
              return (
                <button key={pg} onClick={() => setPage(pg)}
                  className={`w-8 h-8 rounded-lg border text-xs font-semibold ${page===pg ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}>
                  {pg}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:bg-gray-50">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {addOpen  && <AddShopModal open={addOpen} onClose={() => setAddOpen(false)} market={market} />}
      {selected && <ShopDetailModal shop={selected} onClose={() => setSelected(null)} />}
      {editShop && <EditShopModal shop={editShop} onClose={() => setEditShop(null)} onRequestCollect={(s) => setCollectShop(s)} />}
      {collectShop && (
        <CollectPaymentModal
          open={true}
          onClose={() => setCollectShop(null)}
          title={`Collect Payment — ${collectShop.shopName}`}
          currentDue={collectShop.currentDue}
          remarks={collectShop.remark ?? ''}
          onConfirm={(amt, rem) => handleCollect(collectShop, amt, rem)}
        />
      )}

      {/* Click outside to close menu */}
      {menuOpen && <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />}
    </div>
  );
}
