import React, { useRef } from 'react';
import { RefreshCw, Wallet, Download, Lock, KeyRound, Shield, UploadCloud } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface SimpleHeaderProps {
  totalBudget: number;
  currency: string;
  hasPin: boolean;
  onOpenEditBudget: () => void;
  onResetDemo: () => void;
  onExportCSV: () => void;
  onLockApp: () => void;
  onOpenPinSetup: () => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
}

export const SimpleHeader: React.FC<SimpleHeaderProps> = ({
  totalBudget,
  currency,
  hasPin,
  onOpenEditBudget,
  onResetDemo,
  onExportCSV,
  onLockApp,
  onOpenPinSetup,
  onExportBackup,
  onImportBackup,
}) => {
  const restoreFileInputRef = useRef<HTMLInputElement>(null);

  const handleRestoreFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (window.confirm('Restore database from this backup file? Existing records will be updated.')) {
      onImportBackup(file);
    }
    if (restoreFileInputRef.current) {
      restoreFileInputRef.current.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-3 sm:px-4 py-2.5 sm:py-3 shadow-xs">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
        
        {/* Hidden File Input for Restore */}
        <input
          type="file"
          ref={restoreFileInputRef}
          accept=".json,application/json"
          onChange={handleRestoreFileChange}
          className="hidden"
        />

        {/* Brand */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-900 flex items-center justify-center font-extrabold text-white text-xs sm:text-sm shadow-xs shrink-0">
            ₹
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-1 truncate">
              <span>SpendCraft</span>
              <span className="text-[9px] uppercase font-bold px-1 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                Lite
              </span>
            </h1>
            <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium truncate">Marriage & Construction</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Quick Budget Pill */}
          <button
            onClick={onOpenEditBudget}
            className="flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200 text-xs font-semibold transition-all active:scale-98 shrink-0 whitespace-nowrap"
            title="Edit Total Budget"
          >
            <Wallet className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span className="font-mono font-bold text-slate-900 whitespace-nowrap">
              {formatCurrency(totalBudget, currency as any, true)}
            </span>
          </button>

          {/* Security PIN Lock / Setup */}
          <button
            onClick={hasPin ? onLockApp : onOpenPinSetup}
            title={hasPin ? "Lock Vault (Require PIN)" : "Set Security PIN Lock"}
            className={`p-2 rounded-lg border text-xs transition-colors ${
              hasPin
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
            }`}
          >
            {hasPin ? <Lock className="w-3.5 h-3.5 text-slate-700" /> : <KeyRound className="w-3.5 h-3.5 text-amber-600" />}
          </button>

          {/* Backup / Export Menu */}
          <button
            onClick={onExportBackup}
            title="Backup Complete Database (JSON with Receipts)"
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-slate-700" />
          </button>

          {/* Restore Backup */}
          <button
            onClick={() => restoreFileInputRef.current?.click()}
            title="Restore from JSON Backup File"
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5 text-slate-700" />
          </button>

          {/* Export CSV */}
          <button
            onClick={onExportCSV}
            title="Download CSV / Excel Report"
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Reset Demo */}
          <button
            onClick={onResetDemo}
            title="Clear & Reset Blank Data"
            className="p-2 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 text-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </header>
  );
};
