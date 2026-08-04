import { useState, useEffect } from 'react';
import { Plus, Trash2, Search, Car, IndianRupee, Wallet, FileWarning, X, ChevronLeft, ChevronRight, Banknote, MoreHorizontal, Eye, Pencil } from 'lucide-react';
import { useData } from '../store/DataContext';
import { Garage } from '../types';
import Modal from '../components/Modal';
import CollectPaymentModal from '../components/CollectPaymentModal';
import { useSnackbar } from '../contexts/SnackbarContext';

const ITEMS_PER_PAGE = 10;

function AddGarageModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { garages, addGarage } = useData();
  const { showSnackbar } = useSnackbar();
  const [form, setForm] = useState({
    ownerName: '', mobileNumber: '', vehicleNumber: '', vehicleType: 'Car',
    monthlyRent: '', leaseEndDate: '', leaseType: 'Monthly', startDate: '', dueDate: '',
  });

  const nextNo = `G-${String(garages.length + 1).padStart(2, '0')}`;
  const [garageNo, setGarageNo] = useState(nextNo);

  // Autofill end date based on lease type and start date
  useEffect(() => {
    if (form.startDate && form.leaseType !== 'Long-term') {
      const startDate = new Date(form.startDate);
      let endDate: Date;
      let dueDate: Date;

      if (form.leaseType === 'Monthly') {
        endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate());
        dueDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate()+1);
      } else {
        // Yearly
        endDate = new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate());
        dueDate = new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate()+1);
      }

      const formatDate = (d: Date) => d.toISOString().split('T')[0];
      setForm(p => ({ ...p, leaseEndDate: formatDate(endDate), dueDate: formatDate(dueDate) }));
    }
  }, [form.startDate, form.leaseType]);

  // Reset dates when lease type changes
  useEffect(() => {
    if (form.leaseType === 'Long-term') {
      setForm(p => ({ ...p, leaseEndDate: '', dueDate: '' }));
    } else if (form.startDate) {
      const startDate = new Date(form.startDate);
      let endDate: Date;
      let dueDate: Date;

      if (form.leaseType === 'Monthly') {
        endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate() - 1);
        dueDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate());
      } else {
        endDate = new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate() - 1);
        dueDate = new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate());
      }

      const formatDate = (d: Date) => d.toISOString().split('T')[0];
      setForm(p => ({ ...p, leaseEndDate: formatDate(endDate), dueDate: formatDate(dueDate) }));
    }
  }, [form.leaseType]);

  // Keep garageNo in sync with default when modal reopens
  useEffect(() => { if (open) setGarageNo(nextNo); }, [open]);

  const [saving, setSaving] = useState(false);
  const submit = async () => {
    if (!garageNo.trim() || !form.ownerName || !form.mobileNumber || !form.vehicleNumber || !form.monthlyRent || !form.startDate || (form.leaseType === 'Long-term' && !form.leaseEndDate)) {
      showSnackbar('Please fill all required fields', 'warning');
      return;
    }
    if (garages.some(g => g.garageNo.toLowerCase() === garageNo.trim().toLowerCase())) {
      showSnackbar(`Garage No "${garageNo.trim()}" already exists`, 'warning');
      return;
    }
    setSaving(true);
    try {
      await addGarage({
        garageNo: garageNo.trim(),
        ownerName: form.ownerName, mobileNumber: form.mobileNumber, vehicleNumber: form.vehicleNumber,
        vehicleType: form.vehicleType as Garage['vehicleType'],
        monthlyRent: Number(form.monthlyRent), paidRent: 0, paymentStatus: 'Due',
        currentDue: Number(form.monthlyRent),
        leaseEndDate: form.leaseEndDate, leaseType: form.leaseType as Garage['leaseType'],
        startDate: form.startDate, dueDate: form.dueDate,
      });
      showSnackbar(`${garageNo.trim()} added successfully`, 'success');
      setForm({ ownerName: '', mobileNumber: '', vehicleNumber: '', vehicleType: 'Car', monthlyRent: '', leaseEndDate: '', leaseType: 'Monthly', startDate: '', dueDate: '' });
      onClose();
    } catch { showSnackbar('Failed to add garage', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add New Garage">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Garage No *</label>
          <input
            type="text"
            value={garageNo}
            onChange={e => setGarageNo(e.target.value)}
            placeholder={nextNo}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          />
          <p className="text-xs text-gray-400 mt-1">Auto-suggested: {nextNo} — you can change it</p>
        </div>
        {[
          { label: 'Owner Name', key: 'ownerName', placeholder: 'Mr. Roy' },
          { label: 'Mobile Number', key: 'mobileNumber', placeholder: '9876543210' },
          { label: 'Vehicle Number', key: 'vehicleNumber', placeholder: 'WB 02 AB 1234' },
          { label: 'Monthly Rent (₹)', key: 'monthlyRent', placeholder: '5000', type: 'number' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
            <input
              type={f.type || 'text'} placeholder={f.placeholder}
              value={form[f.key as keyof typeof form]}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
          <select value={form.vehicleType} onChange={e => setForm(p => ({ ...p, vehicleType: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            {['Car', 'Bike', 'Truck', 'Other'].map(v => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lease Type</label>
          <select value={form.leaseType} onChange={e => setForm(p => ({ ...p, leaseType: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            {['Monthly', 'Yearly', 'Long-term'].map(v => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            value={form.startDate}
            onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date {form.leaseType === 'Long-term' && '*'}</label>
          <input
            type="date"
            value={form.leaseEndDate}
            onChange={e => setForm(p => ({ ...p, leaseEndDate: e.target.value }))}
            readOnly={form.leaseType !== 'Long-term'}
            className={`w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${form.leaseType !== 'Long-term' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-gray-50'}`}
          />
          {form.leaseType !== 'Long-term' && (
            <p className="text-xs text-gray-400 mt-1">Auto-calculated based on lease type</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={submit} disabled={saving} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60">{saving ? 'Saving...' : 'Add Garage'}</button>
        </div>
      </div>
    </Modal>
  );
}

function GarageDetailModal({ garage, onClose }: { garage: Garage; onClose: () => void }) {
  const { updateGarage } = useData();
  const { showSnackbar } = useSnackbar();

  const handlePayment = async () => {
    try {
      await updateGarage(garage.id, { currentDue: 0, paymentStatus: 'Paid' });
      showSnackbar(`Payment marked as Paid for ${garage.garageNo}`, 'success');
      onClose();
    } catch { showSnackbar('Failed to update payment status', 'error'); }
  };

  return (
    <Modal open={true} onClose={onClose} title={`${garage.garageNo} — ${garage.ownerName}`} width="max-w-xl">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Garage No.', value: garage.garageNo },
            { label: 'Owner Name', value: garage.ownerName },
            { label: 'Mobile Number', value: garage.mobileNumber },
            { label: 'Vehicle Number', value: garage.vehicleNumber },
            { label: 'Vehicle Type', value: garage.vehicleType },
            { label: 'Monthly Rent', value: `₹ ${garage.monthlyRent.toLocaleString('en-IN')}` },
            { label: 'Paid Rent', value: `₹ ${(garage.paidRent ?? 0).toLocaleString('en-IN')}` },
            { label: 'Current Due', value: `₹ ${garage.currentDue.toLocaleString('en-IN')}` },
            { label: 'Lease Type', value: garage.leaseType },
            { label: 'Start Date', value: garage.startDate },
            { label: 'Lease End Date', value: garage.leaseEndDate },
            { label: 'Remark', value: garage.remark || '—' },
          ].map(f => (
            <div key={f.label}>
              <p className="text-xs text-gray-500 mb-1">{f.label}</p>
              <p className="text-sm font-semibold text-gray-800">{f.value}</p>
            </div>
          ))}
          <div>
            <p className="text-xs text-gray-500 mb-1">Payment Status</p>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${garage.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${garage.paymentStatus === 'Paid' ? 'bg-green-500' : 'bg-red-500'}`} />
              {garage.paymentStatus}
            </span>
          </div>
        </div>
        {garage.paymentStatus === 'Due' && (
          <button onClick={handlePayment} className="w-full px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">
            Mark as Paid (₹ {garage.monthlyRent.toLocaleString('en-IN')})
          </button>
        )}
      </div>
    </Modal>
  );
}

function EditGarageModal({ garage, onClose, onRequestCollect }: { garage: Garage; onClose: () => void; onRequestCollect: (garage: Garage) => void }) {
  const { updateGarage, garages } = useData();
  const { showSnackbar } = useSnackbar();
  const [form, setForm] = useState({
    garageNo: garage.garageNo,
    ownerName: garage.ownerName,
    mobileNumber: garage.mobileNumber,
    vehicleNumber: garage.vehicleNumber,
    vehicleType: garage.vehicleType,
    monthlyRent: String(garage.monthlyRent),
    paidRent: String(garage.paidRent ?? 0),
    leaseType: garage.leaseType,
    startDate: garage.startDate,
    leaseEndDate: garage.leaseEndDate,
    paymentStatus: garage.paymentStatus,
    currentDue: String(garage.currentDue),
    remark: garage.remark ?? '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.garageNo.trim() || !form.ownerName.trim()) {
      showSnackbar('Garage No. and Owner Name are required', 'warning');
      return;
    }
    if (garages.some(g => g.id !== garage.id && g.garageNo.toLowerCase() === form.garageNo.trim().toLowerCase())) {
      showSnackbar(`Garage No "${form.garageNo.trim()}" already exists`, 'warning');
      return;
    }
    setSaving(true);
    try {
      const statusChangedToPaid = garage.paymentStatus === 'Due' && form.paymentStatus === 'Paid';
      await updateGarage(garage.id, {
        garageNo: form.garageNo.trim(),
        ownerName: form.ownerName.trim(),
        mobileNumber: form.mobileNumber.trim(),
        vehicleNumber: form.vehicleNumber.trim(),
        vehicleType: form.vehicleType as Garage['vehicleType'],
        monthlyRent: Number(form.monthlyRent) || 0,
        paidRent: Number(form.paidRent) || 0,
        leaseType: form.leaseType as Garage['leaseType'],
        startDate: form.startDate,
        leaseEndDate: form.leaseEndDate,
        paymentStatus: statusChangedToPaid ? 'Due' : (form.paymentStatus as Garage['paymentStatus']),
        currentDue: statusChangedToPaid ? garage.currentDue : (Number(form.currentDue) || 0),
        remark: form.remark.trim() || undefined,
      });
      if (statusChangedToPaid) {
        showSnackbar('Garage details saved. Please collect the payment.', 'info');
        onClose();
        onRequestCollect({ ...garage, garageNo: form.garageNo.trim(), ownerName: form.ownerName.trim(), monthlyRent: Number(form.monthlyRent) || 0 });
      } else {
        showSnackbar(`Garage "${form.garageNo}" updated successfully`, 'success');
        onClose();
      }
    } catch { showSnackbar('Failed to update garage', 'error'); }
    setSaving(false);
  };

  // const F = ({ label, name, type = 'text' }: { label: string; name: string; type?: string }) => (
  //   <div>
  //     <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
  //     <input
  //       type={type}
  //       value={(form as Record<string, string>)[name]}
  //       onChange={e => set(name, e.target.value)}
  //       className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
  //     />
  //   </div>
  // );
  interface FieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}

function Field({ label, name, type = "text", value, onChange }: FieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
      />
    </div>
  );
}

  return (
    <Modal open={true} onClose={onClose} title={`Edit — ${garage.garageNo}`} width="max-w-xl">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Garage No. *" name="garageNo" value={form.garageNo}
  onChange={(value) => set("garageNo", value)}/>
          <Field label="Owner Name *" name="ownerName" value={form.ownerName}
  onChange={(value) => set("ownerName", value)}/>
          <Field label="Mobile Number" name="mobileNumber" type="number" value={form.mobileNumber}
  onChange={(value) => set("mobileNumber", value)}/>
          <Field label="Vehicle Number" name="vehicleNumber" value={form.vehicleNumber}
  onChange={(value) => set("vehicleNumber", value)}/>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Vehicle Type</label>
            <select value={form.vehicleType} onChange={e => set('vehicleType', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50">
              {['Two Wheeler', 'Four Wheeler', 'Truck', 'Bus', 'Other'].map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
          <Field label="Monthly Rent (₹)" name="monthlyRent" type="number" value={form.monthlyRent}
  onChange={(value) => set("monthlyRent", value)}/>
          {/* <F label="Paid Rent (₹)" name="paidRent" type="number" /> */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Lease Type</label>
            <select value={form.leaseType} onChange={e => set('leaseType', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50">
              {['Monthly', 'Quarterly', 'Annual'].map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
          <Field label="Start Date" name="startDate" type="date" value={form.startDate}
  onChange={(value) => set("startDate", value)}/>
          <Field label="Lease End Date" name="leaseEndDate" type="date" value={form.leaseEndDate}
  onChange={(value) => set("leaseEndDate", value)}/>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Payment Status</label>
            <select value={form.paymentStatus} onChange={e => set('paymentStatus', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50">
              {['Paid', 'Due'].map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
          {/* <F label="Current Due (₹)" name="currentDue" type="number" /> */}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Remark</label>
          <textarea
            value={form.remark}
            onChange={e => set('remark', e.target.value)}
            placeholder="Optional remark..."
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none"
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function Garages() {
  const { garages, deleteGarage, updateGarage, addPayment } = useData();
  const { showSnackbar } = useSnackbar();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [vehicleFilter, setVehicleFilter] = useState('All Vehicle Type');
  const [leaseFilter, setLeaseFilter] = useState('All Leases');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [viewGarage, setViewGarage] = useState<Garage | null>(null);
  const [editGarage, setEditGarage] = useState<Garage | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [collectGarage, setCollectGarage] = useState<Garage | null>(null);

  const handleCollect = async (garage: Garage, amount: number, remark: string) => {
    const newPaid = (garage.paidRent ?? 0) + amount;
    const newDue = Math.max(0, garage.currentDue - amount);
    const newStatus = newDue <= 0 ? 'Paid' : 'Due';
    await updateGarage(garage.id, { paidRent: newPaid, currentDue: newDue, paymentStatus: newStatus, remark: remark || undefined, });
    await addPayment({
      date: new Date().toISOString().split('T')[0],
      name: `${garage.ownerName} (${garage.garageNo})`,
      type: 'Garage',
      amount,
      reference: `COLL-${Date.now().toString(36).toUpperCase()}`,
      remark: remark || undefined,
    });
    showSnackbar(
      `₹${amount.toLocaleString('en-IN')} collected from ${garage.garageNo}${newStatus === 'Due' ? ` (Part payment — ₹${newDue.toLocaleString('en-IN')} remaining)` : ''}`,
      'success',
    );
    setCollectGarage(null);
  };

  const totalRent = garages.reduce((s, g) => s + g.monthlyRent, 0);
  const totalPaid = garages.filter(g => g.paymentStatus === 'Paid').reduce((s, g) => s + g.monthlyRent, 0);
  const totalDue = garages.filter(g => g.paymentStatus === 'Due').reduce((s, g) => s + g.currentDue, 0);

  const filtered = garages.filter(g => {
    const matchSearch = g.garageNo.toLowerCase().includes(search.toLowerCase()) ||
      g.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      g.vehicleNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All Status' || g.paymentStatus === statusFilter;
    const matchVehicle = vehicleFilter === 'All Vehicle Type' || g.vehicleType === vehicleFilter;
    const matchLease = leaseFilter === 'All Leases' || g.leaseType === leaseFilter;
    return matchSearch && matchStatus && matchVehicle && matchLease;
  });
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this garage?')) return;
    try { await deleteGarage(id); showSnackbar('Garage deleted', 'success'); } catch { showSnackbar('Failed to delete garage', 'error'); }
    setMenuOpen(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Garages</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all registered garages</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
            <Plus size={16} /> Add Garage
          </button>
          {/* Edit/Delete buttons hidden for now */}
          {/* <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
            <PenLine size={15} /> Edit
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 bg-red-50 text-sm font-medium rounded-xl hover:bg-red-100 transition-colors">
            <Trash2 size={15} /> Delete
          </button> */}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Garages', value: garages.length, sub: 'All registered garages', icon: <Car size={20} className="text-blue-600" />, color: 'bg-blue-50', textColor: 'text-blue-700' },
          { label: 'Total Rents', value: `₹ ${totalRent.toLocaleString('en-IN')}`, sub: 'Total expected rent', icon: <IndianRupee size={20} className="text-green-600" />, color: 'bg-green-50', textColor: 'text-green-700' },
          { label: 'Total Paid', value: `₹ ${totalPaid.toLocaleString('en-IN')}`, sub: 'Total amount received', icon: <Wallet size={20} className="text-green-600" />, color: 'bg-green-50', textColor: 'text-green-700' },
          { label: 'Total Due', value: `₹ ${totalDue.toLocaleString('en-IN')}`, sub: 'Total pending amount', icon: <FileWarning size={20} className="text-red-500" />, color: 'bg-red-50', textColor: 'text-red-600' },
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

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative w-full max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by Garage No., Owner Name or Vehicle No..."
            className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={14} /></button>}
        </div>
        {[
          { value: statusFilter, set: setStatusFilter, options: ['All Status', 'Paid', 'Due'] },
          { value: vehicleFilter, set: setVehicleFilter, options: ['All Vehicle Type', 'Car', 'Bike', 'Truck', 'Other'] },
          { value: leaseFilter, set: setLeaseFilter, options: ['All Leases', 'Monthly', 'Yearly', 'Long-term'] },
        ].map((f, i) => (
          <select key={i} value={f.value} onChange={e => { f.set(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            {f.options.map(o => <option key={o}>{o}</option>)}
          </select>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Garage No.', 'Owner Name', 'Mobile Number', 'Vehicle Number', 'Monthly Rent (₹)', 'Paid Rent (₹)', 'Current Due (₹)', 'Due Date', 'Payment Status', 'Remark', 'Action'].map(h => (
                <th key={h} className={`px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide ${h === 'Action' ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginated.map(garage => (
              <tr key={garage.id} className={`hover:bg-gray-50/60 transition-colors ${garage.paymentStatus === 'Due' ? 'bg-red-50/30' : ''}`}>
                <td className="px-4 py-4 font-bold text-gray-800">{garage.garageNo}</td>
                <td className="px-4 py-4 text-gray-700">{garage.ownerName}</td>
                <td className="px-4 py-4 text-gray-600">{garage.mobileNumber}</td>
                <td className="px-4 py-4 text-gray-600">{garage.vehicleNumber}</td>
                <td className="px-4 py-4 text-gray-700">₹ {garage.monthlyRent.toLocaleString('en-IN')}</td>
                <td className="px-4 py-4 text-gray-700">₹ {(garage.paidRent ?? 0).toLocaleString('en-IN')}</td>
                <td className="px-4 py-4 text-gray-700">₹ {garage.currentDue.toLocaleString('en-IN')}</td>
                <td className="px-4 py-4 text-gray-600">{garage.dueDate || '—'}</td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${garage.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${garage.paymentStatus === 'Paid' ? 'bg-green-500' : 'bg-red-500'}`} />
                    {garage.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-4 text-gray-600 max-w-[200px] truncate" title={garage.remark || ''}>{garage.remark || '—'}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-1">
                    {garage.paymentStatus === 'Due' && garage.currentDue > 0 && (
                      <button
                        onClick={() => setCollectGarage(garage)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
                      >
                        <Banknote size={13} />
                        Collect
                      </button>
                    )}
                    <div className="relative">
                      <button onClick={() => setMenuOpen(menuOpen === garage.id ? null : garage.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                      {menuOpen === garage.id && (
                        <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 min-w-[120px] animate-fade-in">
                          <button onClick={() => { setViewGarage(garage); setMenuOpen(null); }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <Eye size={14} /> View
                          </button>
                          <button onClick={() => { setEditGarage(garage); setMenuOpen(null); }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <Pencil size={14} /> Edit
                          </button>
                          <button onClick={() => handleDelete(garage.id)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                            <X size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr><td colSpan={10} className="px-5 py-10 text-center text-gray-400 text-sm">No garages found</td></tr>
            )}
          </tbody>
        </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-4 border-t border-gray-50 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {filtered.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1} to {Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} entries
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors">
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(totalPages || 1, 3) }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === n ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{n}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <AddGarageModal open={showAdd} onClose={() => setShowAdd(false)} />
      {viewGarage && <GarageDetailModal garage={viewGarage} onClose={() => setViewGarage(null)} />}
      {editGarage && <EditGarageModal garage={editGarage} onClose={() => setEditGarage(null)} onRequestCollect={(g) => setCollectGarage(g)} />}
      {collectGarage && (
        <CollectPaymentModal
          open={true}
          onClose={() => setCollectGarage(null)}
          title={`Collect Payment — ${collectGarage.garageNo}`}
          currentDue={collectGarage.currentDue}
          remarks={collectGarage.remark ?? ''}
          onConfirm={(amt, rem) => handleCollect(collectGarage, amt, rem)}
        />
      )}
      {menuOpen && <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />}
    </div>
  );
}
