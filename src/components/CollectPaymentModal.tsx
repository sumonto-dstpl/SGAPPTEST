import { useState } from 'react';
import { Banknote, AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import { useSnackbar } from '../contexts/SnackbarContext';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  currentDue: number;
  remarks?: string;
  onConfirm: (amount: number, remark: string) => Promise<void>;
}

export default function CollectPaymentModal({ open, onClose, title, currentDue, remarks, onConfirm }: Props) {
  const { showSnackbar } = useSnackbar();
  const [amount, setAmount] = useState(String(currentDue));
  const [remark, setRemark] = useState(remarks?? '');
  const [saving, setSaving] = useState(false);

  const numericAmount = Number(amount) || 0;
  const isPartPayment = numericAmount > 0 && numericAmount < currentDue;

  const handleConfirm = async () => {
    if (numericAmount <= 0) {
      showSnackbar('Please enter a valid amount', 'warning');
      return;
    }
    setSaving(true);
    try {
      await onConfirm(numericAmount, remark.trim());
      onClose();
    } catch {
      showSnackbar('Failed to collect payment', 'error');
    }
    setSaving(false);
  };

  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-md">
      <div className="space-y-4">
        <div className="bg-blue-50 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-700">Current Due</span>
          <span className="text-lg font-bold text-blue-700">₹{currentDue.toLocaleString('en-IN')}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Amount</label>
          <div className="relative">
            <Banknote size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>
          {isPartPayment && (
            <div className="mt-2 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
              <AlertTriangle size={13} className="flex-shrink-0" />
              Part payment — remaining due will be ₹{(currentDue - numericAmount).toLocaleString('en-IN')}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Remark (Optional)</label>
          <textarea
            value={remark}
            onChange={e => setRemark(e.target.value)}
            placeholder="e.g. Part payment for this month, cheque pending, etc."
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleConfirm} disabled={saving}
            className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-60">
            {saving ? 'Collecting...' : `Collect ₹${numericAmount.toLocaleString('en-IN')}`}
          </button>
        </div>
      </div>
    </Modal>
  );
}
