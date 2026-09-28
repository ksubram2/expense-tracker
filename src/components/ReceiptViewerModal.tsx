import React, { useState } from 'react';
import { Expense, ReceiptAttachment } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Download, X, FileText, ChevronLeft, ChevronRight, Image as ImageIcon, Layers } from 'lucide-react';

interface ReceiptViewerModalProps {
  expense: Expense;
  currency: string;
  onClose: () => void;
}

export const ReceiptViewerModal: React.FC<ReceiptViewerModalProps> = ({
  expense,
  currency,
  onClose,
}) => {
  // Normalize receipts array
  const allReceipts: ReceiptAttachment[] = (() => {
    if (expense.receipts && expense.receipts.length > 0) {
      return expense.receipts;
    }
    if (expense.receiptDataUrl) {
      return [{
        id: 'rec_legacy',
        dataUrl: expense.receiptDataUrl,
        fileName: expense.receiptFileName || 'Receipt.png',
        fileType: expense.receiptFileType || 'image/jpeg',
      }];
    }
    return [];
  })();

  const [activeIndex, setActiveIndex] = useState(0);
  const currentReceipt = allReceipts[activeIndex] || allReceipts[0];
  const isPdf = currentReceipt?.fileType?.includes('pdf') || currentReceipt?.fileName?.toLowerCase().endsWith('.pdf');

  const handleDownloadSingle = (rec?: ReceiptAttachment) => {
    const target = rec || currentReceipt;
    if (!target?.dataUrl) return;
    const link = document.createElement('a');
    link.href = target.dataUrl;
    link.download = target.fileName || `Receipt_${expense.title.replace(/\s+/g, '_')}_${expense.amount}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = () => {
    allReceipts.forEach((rec, idx) => {
      setTimeout(() => {
        handleDownloadSingle(rec);
      }, idx * 250);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <h3 className="text-sm font-bold text-slate-900 truncate">
              {expense.title}
            </h3>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
              <span>{formatDate(expense.date)}</span>
              <span>•</span>
              <span className="font-mono font-bold text-slate-900">{formatCurrency(expense.amount, currency as any)}</span>
              {allReceipts.length > 1 && (
                <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-semibold text-[10px] border border-slate-200">
                  {activeIndex + 1} of {allReceipts.length} Files
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {allReceipts.length > 1 ? (
              <button
                onClick={handleDownloadAll}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs"
                title="Download all attached receipts"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Download</span> All ({allReceipts.length})
              </button>
            ) : (
              <button
                onClick={() => handleDownloadSingle()}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-xs font-bold"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Multi-Receipt Tab / Thumbnail Bar (If more than 1 file) */}
        {allReceipts.length > 1 && (
          <div className="bg-slate-100/80 px-3 py-2 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0 flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-600" />
              Bills:
            </span>
            <div className="flex items-center gap-1.5 min-w-0">
              {allReceipts.map((rec, idx) => (
                <button
                  key={rec.id || idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 border ${
                    activeIndex === idx
                      ? 'bg-white text-slate-900 shadow-xs border-slate-300 font-bold'
                      : 'bg-slate-200/60 hover:bg-slate-200 text-slate-600 border-transparent'
                  }`}
                >
                  <span className="text-[10px] opacity-70">#{idx + 1}</span>
                  <span className="truncate max-w-[90px]">{rec.fileName || `Receipt ${idx + 1}`}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Preview Stage */}
        <div className="relative flex-1 overflow-y-auto p-4 bg-slate-50 flex items-center justify-center min-h-[260px]">
          
          {/* Navigation Arrows for multi-file */}
          {allReceipts.length > 1 && (
            <>
              <button
                disabled={activeIndex === 0}
                onClick={() => setActiveIndex(prev => Math.max(0, prev - 1))}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-700 disabled:opacity-30 transition-all"
                title="Previous Receipt"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                disabled={activeIndex === allReceipts.length - 1}
                onClick={() => setActiveIndex(prev => Math.min(allReceipts.length - 1, prev + 1))}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-700 disabled:opacity-30 transition-all"
                title="Next Receipt"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {currentReceipt?.dataUrl ? (
            isPdf ? (
              <div className="text-center p-6 space-y-3">
                <FileText className="w-16 h-16 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">{currentReceipt.fileName || 'Document (PDF)'}</p>
                <button
                  onClick={() => handleDownloadSingle()}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  Download & Open PDF
                </button>
              </div>
            ) : (
              <img
                src={currentReceipt.dataUrl}
                alt={currentReceipt.fileName || expense.title}
                className="max-h-[60vh] max-w-full object-contain rounded-lg border border-slate-200 shadow-xs"
              />
            )
          ) : (
            <div className="text-slate-400 text-xs text-center">
              No receipt file attached.
            </div>
          )}
        </div>

        {/* Footer Details */}
        <div className="p-3.5 bg-white border-t border-slate-100 text-[11px] text-slate-600 flex items-center justify-between font-medium">
          <div className="truncate min-w-0 pr-2">
            <span className="font-semibold text-slate-900">{currentReceipt?.fileName || 'Attached Receipt'}</span>
            {expense.vendor && <span> • Payee: <strong className="text-slate-900">{expense.vendor}</strong></span>}
          </div>

          <button
            onClick={() => handleDownloadSingle()}
            className="text-indigo-600 hover:text-indigo-800 font-bold shrink-0 flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save This File</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ReceiptViewerModal;
