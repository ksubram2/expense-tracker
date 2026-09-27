import React from 'react';
import { Expense } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Download, X, FileText, Calendar, User, Tag } from 'lucide-react';

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
  const isPdf = expense.receiptFileType?.includes('pdf') || expense.receiptFileName?.toLowerCase().endsWith('.pdf');

  const handleDownload = () => {
    if (!expense.receiptDataUrl) return;
    const link = document.createElement('a');
    link.href = expense.receiptDataUrl;
    link.download = expense.receiptFileName || `Receipt_${expense.title.replace(/\s+/g, '_')}_${expense.amount}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <h3 className="text-sm font-bold text-slate-900 truncate">
              {expense.title}
            </h3>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
              <span>{formatDate(expense.date)}</span>
              <span>•</span>
              <span className="font-mono font-bold text-slate-900">{formatCurrency(expense.amount, currency as any)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-xs font-bold"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Preview */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex items-center justify-center min-h-[260px]">
          {expense.receiptDataUrl ? (
            isPdf ? (
              <div className="text-center p-6 space-y-3">
                <FileText className="w-16 h-16 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">{expense.receiptFileName || 'Document (PDF)'}</p>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  Download & Open PDF
                </button>
              </div>
            ) : (
              <img
                src={expense.receiptDataUrl}
                alt={expense.title}
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
          <div className="truncate">
            Category: <span className="font-semibold text-slate-900">{expense.categoryName}</span>
            {expense.vendor && <span> • Payee: <strong className="text-slate-900">{expense.vendor}</strong></span>}
          </div>

          <button
            onClick={handleDownload}
            className="text-indigo-600 hover:text-indigo-800 font-bold shrink-0 ml-2"
          >
            Save File
          </button>
        </div>

      </div>
    </div>
  );
};
