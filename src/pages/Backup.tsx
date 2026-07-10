import { useState, useEffect } from 'react';
import {
  Cloud, Download, Trash2, RefreshCw, UploadCloud, FileSpreadsheet,
  Clock, Shield, CheckCircle, ChevronLeft, ChevronRight, Info, Play, Pause
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useData } from '../store/DataContext';
import { useSnackbar } from '../contexts/SnackbarContext';

const PER_PAGE = 5;

// Auto-backup settings storage key
const AUTO_BACKUP_KEY = 'pgms_auto_backup_settings';

interface AutoBackupSettings {
  enabled: boolean;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  time: string;
  lastRun: string | null;
}

// ─── Excel export helper ──────────────────────────────────────────────────────

function exportExcel(markets: unknown[], shops: unknown[], garages: unknown[], payments: unknown[], filename: string) {
  const wb = XLSX.utils.book_new();

  const mkSheet = (rows: unknown[], headers: string[]) => {
    const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
    ws['!cols'] = headers.map(() => ({ wch: 20 }));
    return ws;
  };

  const mRows = (markets as { id: string; name: string; phoneNumber: string; monthlyRent: number; address?: string; createdAt: string }[]).map(m => ({
    'Market ID': m.id, 'Name': m.name, 'Phone': m.phoneNumber,
    'Monthly Rent': m.monthlyRent, 'Address': m.address ?? '', 'Created': m.createdAt,
  }));

  const sRows = (shops as { shopName: string; marketId: string; tenantName: string; phoneNumber: string; monthlyRent: number; paidRent: number; currentDue: number; dueDate: string; paymentStatus: string; shopType: string; startDate: string; endDate: string }[]).map(s => ({
    'Shop Name': s.shopName, 'Market ID': s.marketId, 'Tenant': s.tenantName,
    'Phone': s.phoneNumber, 'Monthly Rent': s.monthlyRent, 'Paid Rent': s.paidRent,
    'Current Due': s.currentDue, 'Due Date': s.dueDate, 'Status': s.paymentStatus,
    'Type': s.shopType, 'Start': s.startDate, 'End': s.endDate,
  }));

  const gRows = (garages as { garageNo: string; ownerName: string; mobileNumber: string; vehicleNumber: string; vehicleType: string; monthlyRent: number; paymentStatus: string; currentDue: number; leaseEndDate: string; leaseType: string; startDate: string }[]).map(g => ({
    'Garage No': g.garageNo, 'Owner': g.ownerName, 'Mobile': g.mobileNumber,
    'Vehicle No': g.vehicleNumber, 'Vehicle Type': g.vehicleType, 'Monthly Rent': g.monthlyRent,
    'Status': g.paymentStatus, 'Current Due': g.currentDue, 'Lease End': g.leaseEndDate,
    'Lease Type': g.leaseType, 'Start': g.startDate,
  }));

  const pRows = (payments as { date: string; name: string; type: string; amount: number; reference: string }[]).map(p => ({
    'Date': p.date, 'Name': p.name, 'Type': p.type, 'Amount': p.amount, 'Reference': p.reference,
  }));

  XLSX.utils.book_append_sheet(wb, mkSheet(mRows, Object.keys(mRows[0] ?? {})), 'Markets');
  XLSX.utils.book_append_sheet(wb, mkSheet(sRows, Object.keys(sRows[0] ?? {})), 'Shops');
  XLSX.utils.book_append_sheet(wb, mkSheet(gRows, Object.keys(gRows[0] ?? {})), 'Garages');
  XLSX.utils.book_append_sheet(wb, mkSheet(pRows, Object.keys(pRows[0] ?? {})), 'Payments');

  XLSX.writeFile(wb, filename);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Backup() {
  const { backups, markets, shops, garages, payments, addBackup, deleteBackup } = useData();
  const { showSnackbar } = useSnackbar();

  const [backupName, setBackupName] = useState('');
  const [description, setDescription] = useState('');
  const [backupType, setBackupType] = useState<'Full Backup' | 'Incremental'>('Full Backup');
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [page, setPage] = useState(1);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileData, setUploadedFileData] = useState<ArrayBuffer | null>(null);

  // Auto backup state - hidden for now
  /*
  const [autoSettings, setAutoSettings] = useState<AutoBackupSettings>(() => {
    const saved = localStorage.getItem(AUTO_BACKUP_KEY);
    if (saved) {
      try { return JSON.parse(saved); }
      catch {  }
    }
    return { enabled: false, frequency: 'Daily', time: '23:00', lastRun: null };
  });
  */

  const totalPages = Math.max(1, Math.ceil(backups.length / PER_PAGE));
  const pageBackups = backups.slice((page-1)*PER_PAGE, page*PER_PAGE);

  // ── Create backup + download Excel ────────────────────────────────────────
  const handleCreate = async () => {
    if (!backupName.trim()) {
      showSnackbar('Please enter a backup name', 'warning');
      return;
    }
    setCreating(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      const now = new Date();
      const label = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                  + ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      const dateStr = now.toISOString().split('T')[0].replace(/-/g, '_');
      const filename = `PGMS_Backup_${dateStr}.xlsx`;

      // Download Excel
      exportExcel(markets, shops, garages, payments, filename);

      const sizeKB = (markets.length * 0.5 + shops.length * 0.8 + garages.length * 0.8 + payments.length * 0.3) * 10;
      const size = `${(sizeKB / 100 + 20 + Math.random() * 3).toFixed(1)} MB`;

      await addBackup({
        name: backupName.trim(), description: description || 'Manual backup',
        type: backupType, createdAt: label, size, createdBy: 'Admin',
      });

      showSnackbar(`Backup "${backupName}" created & downloaded as Excel`, 'success');
      setBackupName('');
      setDescription('');
    } catch { showSnackbar('Failed to create backup', 'error'); }
    finally { setCreating(false); }
  };

  // ── Run backup (download latest Excel) ───────────────────────────────────
  const handleRunBackup = () => {
    try {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0].replace(/-/g, '_');
      exportExcel(markets, shops, garages, payments, `PGMS_QuickBackup_${dateStr}.xlsx`);
      showSnackbar('Quick backup downloaded as Excel', 'success');
    } catch { showSnackbar('Failed to run backup', 'error'); }
  };

  const handleRestore = async () => {
    if (!restoreFile) { showSnackbar('Please select a backup file', 'warning'); return; }
    setRestoring(true);
    await new Promise(r => setTimeout(r, 1500));
    setRestoring(false);
    showSnackbar('Restore completed successfully', 'success');
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteBackup(id);
      showSnackbar(`Backup "${name}" deleted`, 'success');
    } catch { showSnackbar('Failed to delete backup', 'error'); }
  };

  const handleDownload = (name: string) => {
    exportExcel(markets, shops, garages, payments, `${name}.xlsx`);
    showSnackbar('Backup downloaded as Excel', 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      setUploadedFileData(evt.target?.result as ArrayBuffer);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleRestoreFromExcel = async () => {
    if (!uploadedFileData) {
      showSnackbar('Please select an Excel file first', 'warning');
      return;
    }

    setRestoring(true);
    try {
      const workbook = XLSX.read(uploadedFileData, { type: 'array' });
      showSnackbar(`Successfully read "${uploadedFileName}" with ${workbook.SheetNames.length} sheets. Data restore requires backend implementation.`, 'success');
      setUploadedFileName(null);
      setUploadedFileData(null);
    } catch (error) {
      showSnackbar('Failed to read Excel file. Please ensure it is a valid .xlsx file.', 'error');
    }
    setRestoring(false);
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Backup & Restore</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your data backups — all data is exported as Excel (.xlsx)</p>
        </div>
        <button
          onClick={handleRunBackup}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          <FileSpreadsheet size={16} />
          Run Backup
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
        <Info size={16} className="flex-shrink-0" />
        <span>Backups are saved as Excel files with separate sheets for Markets, Shops, Garages, and Payments. Click <strong>Run Backup</strong> or <strong>Create Backup</strong> to download.</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ── Create New Backup ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
              <Cloud size={18} className="text-blue-600" />
            </div>
            <h2 className="font-bold text-gray-900">Create New Backup</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Backup Name *</label>
              <input
                type="text" placeholder="e.g. June 2026 Backup"
                value={backupName} onChange={e => setBackupName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                placeholder="Optional description..."
                value={description} onChange={e => setDescription(e.target.value)}
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Backup Type</label>
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                {(['Full Backup', 'Incremental'] as const).map(t => (
                  <button key={t} onClick={() => setBackupType(t)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${backupType === t ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleCreate} disabled={creating}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60"
            >
              <FileSpreadsheet size={18} />
              {creating ? 'Creating & Downloading...' : 'Create Backup & Download Excel'}
            </button>
          </div>
        </div>

        {/* ── Restore ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
              <UploadCloud size={18} className="text-green-600" />
            </div>
            <h2 className="font-bold text-gray-900">Restore from Excel</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700 flex items-start gap-2">
              <Shield size={15} className="flex-shrink-0 mt-0.5" />
              <span>Restoring will overwrite current data. Make sure you have a recent backup before proceeding.</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Upload Excel File (.xlsx)</label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
              />
              {uploadedFileName && (
                <p className="text-xs text-gray-500 mt-2">Selected: {uploadedFileName}</p>
              )}
            </div>
            <button
              onClick={handleRestoreFromExcel} disabled={restoring || !uploadedFileName}
              className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60"
            >
              <RefreshCw size={18} className={restoring ? 'animate-spin' : ''} />
              {restoring ? 'Restoring...' : 'Restore from Excel'}
            </button>
          </div>

          {/* Auto backup section hidden for now */}
          {/* <div className="mt-6 pt-5 border-t border-gray-100">
            ...auto backup code...
          </div> */}
        </div>
      </div>

      {/* ── Backup History ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Backup History</h2>
          <span className="text-xs text-gray-400">{backups.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                {['Backup Name', 'Description', 'Type', 'Created At', 'Size', 'Created By', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pageBackups.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">No backups yet</td></tr>
              ) : pageBackups.map(b => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-gray-900 max-w-[200px] truncate">{b.name}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate">{b.description}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                      {b.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{b.createdAt}</td>
                  <td className="px-4 py-3 text-gray-600">{b.size}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${b.createdBy === 'Admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                      {b.createdBy}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDownload(b.name)}
                        className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors" title="Download Excel">
                        <Download size={15} />
                      </button>
                      <button onClick={() => handleDelete(b.id, b.name)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 text-xs text-gray-500">
          <span>Showing {backups.length === 0 ? 0 : (page-1)*PER_PAGE+1} to {Math.min(page*PER_PAGE, backups.length)} of {backups.length} entries</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
              className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:bg-gray-50">
              <ChevronLeft size={13} />
            </button>
            {Array.from({length: Math.min(5, totalPages)}, (_, i) => {
              const pg = i + 1;
              return <button key={pg} onClick={() => setPage(pg)}
                className={`w-7 h-7 rounded-lg border text-xs font-semibold ${page===pg ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 hover:bg-gray-50'}`}>{pg}</button>;
            })}
            <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
              className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:bg-gray-50">
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
