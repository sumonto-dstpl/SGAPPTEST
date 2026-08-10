import { useState } from 'react';
import { Shop } from '../types';
import { CheckCircle, Printer } from 'lucide-react';
import { useData } from '../store/DataContext';
import { useSnackbar } from '../contexts/SnackbarContext';
import Modal from './Modal';
import CollectPaymentModal from './CollectPaymentModal';

interface Props { shop: Shop; onClose: () => void }

function Row({ label, value, red }: { label: string; value: string | number; red?: boolean }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-semibold ${red ? 'text-red-600' : 'text-gray-800'}`}>{value}</span>
    </div>
  );
}

export default function ShopDetailModal({ shop, onClose }: Props) {
  const { updateShop, addPayment } = useData();
  const { showSnackbar } = useSnackbar();
  const [showCollect, setShowCollect] = useState(false);

  const handleCollect = async (amount: number, remark: string) => {
    const newPaid = shop.paidRent + amount;
    const newDue = Math.max(0, shop.currentDue - amount);
    const newStatus = newDue <= 0 ? 'Paid' : 'Due';
    await updateShop(shop.id, { paidRent: newPaid, currentDue: newDue, paymentStatus: newStatus, paymentDate: new Date().toISOString() });
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
    setShowCollect(false);
    onClose();
  };

  const fmtDate = (s: string) => {
    try { return new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return s; }
  };

  return (
    <Modal open={true} onClose={onClose} title="Shop Details">
      <div className="space-y-1">
        {/* Status badge */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-base font-bold text-gray-900">{shop.shopName}</span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
            shop.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
          }`}>
            <span className={`w-2 h-2 rounded-full ${shop.paymentStatus === 'Paid' ? 'bg-green-500' : 'bg-red-500'}`} />
            {shop.paymentStatus}
          </span>
        </div>

        <Row label="Tenant Name"   value={shop.tenantName} />
        <Row label="Phone Number"  value={shop.phoneNumber} />
        <Row label="Shop Type"     value={shop.shopType} />
        <Row label="Monthly Rent"  value={`₹${shop.monthlyRent.toLocaleString('en-IN')}`} />
        <Row label="Shop Area (sqft)" value={shop.shopArea+"sqft" || '—'} />
        <Row label="Paid Rent"     value={`₹${shop.paidRent.toLocaleString('en-IN')}`} />
        <Row label="Current Due"   value={`₹${shop.currentDue.toLocaleString('en-IN')}`} red={shop.currentDue > 0} />
        <Row label="Due Date"      value={fmtDate(shop.dueDate)} />
        <Row label="Start Date"    value={fmtDate(shop.startDate)} />
        <Row label="End Date"      value={fmtDate(shop.endDate)} />
        <Row label="Payment Date" value={shop.paymentDate ? new Date(shop.paymentDate).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '—'} />
        <Row label="Remark"       value={shop.remark || '—'} />
      </div>

      <button
        onClick={() => window.print()}
        className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <Printer size={17} /> Print Details
      </button>

      {shop.paymentStatus === 'Due' && shop.currentDue > 0 && (
        <button
          onClick={() => setShowCollect(true)}
          className="mt-5 w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
        >
          <CheckCircle size={18} />
          Collect Payment — ₹{shop.currentDue.toLocaleString('en-IN')}
        </button>
      )}
      <button onClick={onClose} className="mt-2 w-full py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
        Close
      </button>

      {showCollect && (
        <CollectPaymentModal
          open={true}
          onClose={() => setShowCollect(false)}
          title={`Collect Payment — ${shop.shopName}`}
          currentDue={shop.currentDue}
          onConfirm={handleCollect}
        />
      )}
    </Modal>
  );
}
