import { useState } from 'react';
import { Shop,PaymentDate } from '../types';
import { CheckCircle, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
function PaymentRows({ payments }: { payments?: PaymentDate[] }) {
  return (
    <>
       <div className="grid grid-cols-3 gap-4 px-3 py-2 font-semibold bg-gray-100">
  <span>Amount</span>
  <span>Payment Date</span>
  <span>Remark</span>
</div>
      {payments?.length ? (
        payments.map((payment, index) => (
          <div
            key={index}
            className="grid grid-cols-3 gap-4 px-3 py-2 border-b"
          >
            <span>
              ₹{payment.amount.toLocaleString('en-IN')}
            </span>

            <span>
              {new Date(payment.paymentDate).toLocaleString('en-GB', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>

            <span>
              {payment.remark || '—'}
            </span>
          </div>
        ))
      ) : (
        <div className="px-3 py-2 text-gray-500">
          No payments
        </div>
      )}
    </>
  );
}

export default function ShopDetailModal({ shop, onClose }: Props) {
  const { updateShop, addPayment } = useData();
  const { showSnackbar } = useSnackbar();
  const [showCollect, setShowCollect] = useState(false);

  const handleCollect = async (amount: number, remark: string) => {
    const currentDue = Number(shop.currentDue) || 0;
const paymentAmount = Number(amount) || 0;
const paidRent = Number(shop.paidRent) || 0;

const newPaid = paidRent + paymentAmount;
const newDue = Math.max(0, currentDue - paymentAmount);

const isFullyPaid = paymentAmount >= currentDue;
const newStatus = isFullyPaid ? 'Paid' : 'Due';

const paymentRemark =
  remark.trim() ||
  (isFullyPaid ? 'Fully Paid' : 'Partially Paid');

const newPayment: PaymentDate = {
  amount: paymentAmount,
  paymentDate: new Date().toISOString(),
  remark: paymentRemark,
};

     await updateShop(shop.id, { paidRent: newPaid, currentDue: newDue, paymentStatus: newStatus, payments: [
    ...(shop.payments || []),
    newPayment,
  ], remark: paymentRemark,});
      // remark || shop.currentDue===amount ? "Fully Paid" : "Partially Paid", 
    await addPayment({
      date: new Date().toISOString().split('T')[0],
      name: `${shop.tenantName} (${shop.shopName})`,
      type: 'Shop',
      paymentAmount,
      reference: `COLL-${Date.now().toString(36).toUpperCase()}`,
      remark: remark || "",
    });
  //   await updateShop(shop.id, { paidRent: newPaid, currentDue: newDue, paymentStatus: newStatus, payments: [
  //   ...(shop.payments || []),
  //   newPayment,
  // ], remark: remark || shop.currentDue==amount ? "Fully Paid" : "Partially Paid", });
  //   // await updateShop(shop.id, { paidRent: newPaid, currentDue: newDue, paymentStatus: newStatus, paymentDate: new Date().toISOString() });
  //   await addPayment({
  //     date: new Date().toISOString().split('T')[0],
  //     name: `${shop.tenantName} (${shop.shopName})`,
  //     type: 'Shop',
  //     amount,
  //     reference: `COLL-${Date.now().toString(36).toUpperCase()}`,
  //     remark: remark || undefined,
  //   });
    showSnackbar(
      `₹${amount.toLocaleString('en-IN')} collected from ${shop.shopName}${newStatus === 'Due' ? ` (Part payment — ₹${newDue.toLocaleString('en-IN')} remaining)` : ''}`,
      'success',
    );
    setShowCollect(false);
    onClose();
  };

  const handleDownloadPDF = () => {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Shop Details', pageWidth / 2, 18, { align: 'center' });

  // Shop name + status
  doc.setFontSize(13);
  doc.text(shop.shopName || 'Shop', 14, 30);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Payment Status: ${shop.paymentStatus}`, 14, 37);

  // Shop details
  autoTable(doc, {
    startY: 44,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [243, 244, 246],
      textColor: [31, 41, 55],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55 },
      1: { cellWidth: 125 },
    },
    body: [
      ['Tenant Name', shop.tenantName || '—'],
      ['Phone Number', String(shop.phoneNumber || '—')],
      ['Shop Type', shop.shopType || '—'],
      ['Monthly Rent', `INR ${Number(shop.monthlyRent || 0).toLocaleString('en-IN')}`],
      ['Shop Area', `${shop.shopArea || '—'} sqft`],
      ['Paid Rent', `INR ${Number(shop.paidRent || 0).toLocaleString('en-IN')}`],
      ['Current Due', `INR ${Number(shop.currentDue || 0).toLocaleString('en-IN')}`],
      ['Due Date', fmtDate(shop.dueDate)],
      ['Start Date', fmtDate(shop.startDate)],
      ['End Date', fmtDate(shop.endDate)],
      ['Remark', shop.remark || '—'],
    ],
  });

  // Payment history
  const paymentStartY =
    (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment History', 14, paymentStartY);

  const paymentRows = (shop.payments || []).map((payment) => {
    const paymentDate = new Date(payment.paymentDate);

    return [
      `INR ${Number(payment.amount || 0).toLocaleString('en-IN')}`,
      paymentDate.toLocaleString('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      payment.remark || '—',
    ];
  });

  autoTable(doc, {
    startY: paymentStartY + 5,
    head: [['Amount', 'Payment Date', 'Remark']],
    body: paymentRows.length
      ? paymentRows
      : [['—', '—', 'No payments']],
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 3,
      valign: 'middle',
    },
    headStyles: {
      fillColor: [243, 244, 246],
      textColor: [17, 24, 39],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 65 },
      2: { cellWidth: 75 },
    },

    // Automatically repeat table header on every page
    showHead: 'everyPage',
  });

  // Footer on every page
  const pageCount = doc.getNumberOfPages();

  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);

    doc.text(
      `Page ${page} of ${pageCount}`,
      pageWidth - 14,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'right' }
    );
  }

  // Download PDF
  const safeShopName = (shop.shopName || 'shop')
    .replace(/[^a-z0-9]/gi, '_');

  doc.save(`${safeShopName}_details.pdf`);
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
        <Row label="Shop Area (sqft)" value={shop.shopArea+" sqft" || '—'} />
        <Row label="Paid Rent"     value={`₹${shop.paidRent.toLocaleString('en-IN')}`} />
        <Row label="Current Due"   value={`₹${shop.currentDue.toLocaleString('en-IN')}`} red={shop.currentDue > 0} />
        <Row label="Due Date"      value={fmtDate(shop.dueDate)} />
        <Row label="Start Date"    value={fmtDate(shop.startDate)} />
        <Row label="End Date"      value={fmtDate(shop.endDate)} />        
        <Row label="Remark"       value={shop.remark || '—'} />
      

<PaymentRows payments={shop.payments} />
        {/* <Row label="Payment Date" value={shop.paymentDate ? new Date(shop.paymentDate).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '—'} /> */}
      </div>

      <button
        onClick={handleDownloadPDF}
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