import React, { useState, useMemo } from 'react';
import { MainTabType } from './SimpleTabNav';
import { Expense, Project } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { 
  Search, 
  Trash2, 
  Edit2, 
  Calendar, 
  User, 
  Receipt,
  FileCheck,
  Download
} from 'lucide-react';
import { ReceiptViewerModal } from './ReceiptViewerModal';

interface SimpleExpenseListProps {
  activeTab: MainTabType;
  allExpenses: Expense[];
  marriageProject: Project;
  constructionProject: Project;
  currency: string;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
  onOpenAddExpense: () => void;
}

export const SimpleExpenseList: React.FC<SimpleExpenseListProps> = ({
  activeTab,
  allExpenses,
  marriageProject,
  constructionProject,
  currency,
  onEditExpense,
  onDeleteExpense,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingReceiptExpense, setViewingReceiptExpense] = useState<Expense | null>(null);

  const relevantExpenses = useMemo(() => {
    let list = allExpenses;
    if (activeTab === 'marriage') {
      list = allExpenses.filter(e => e.projectId === marriageProject.id);
    } else if (activeTab === 'construction') {
      list = allExpenses.filter(e => e.projectId === constructionProject.id);
    }

    if (!searchTerm.trim()) {
      return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    const term = searchTerm.toLowerCase();
    return list
      .filter(
        e =>
          e.title.toLowerCase().includes(term) ||
          e.categoryName.toLowerCase().includes(term) ||
          (e.vendor && e.vendor.toLowerCase().includes(term)) ||
          (e.receiptNo && e.receiptNo.toLowerCase().includes(term)) ||
          (e.receiptFileName && e.receiptFileName.toLowerCase().includes(term)) ||
          (e.notes && e.notes.toLowerCase().includes(term))
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allExpenses, activeTab, marriageProject.id, constructionProject.id, searchTerm]);

  return (
    <>
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
        
        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>
                {activeTab === 'combined'
                  ? 'Transaction Log'
                  : activeTab === 'marriage'
                  ? 'Marriage Disbursements'
                  : 'Engineer Milestone Payments'}
              </span>
              <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                {relevantExpenses.length}
              </span>
            </h3>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search records..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Cards List */}
        <div className="space-y-2">
          {relevantExpenses.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs font-medium">
              No entries found.
            </div>
          ) : (
            relevantExpenses.map((exp) => {
              const isMarriageExp = exp.projectId === marriageProject.id;
              const hasReceipt = Boolean(exp.receiptDataUrl);

              return (
                <div
                  key={exp.id}
                  className="bg-slate-50 hover:bg-slate-100/80 rounded-xl p-3 border border-slate-200/80 flex items-center justify-between gap-2.5 transition-colors"
                >
                  {/* Left: Clean Tag & Details */}
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 border ${
                      isMarriageExp 
                        ? 'bg-rose-50 text-rose-700 border-rose-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {isMarriageExp ? 'M' : 'E'}
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                          {exp.title}
                        </h4>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-medium border bg-white text-slate-600 border-slate-200">
                          {exp.categoryName}
                        </span>

                        {/* Receipt Attached Pill */}
                        {hasReceipt && (
                          <button
                            onClick={() => setViewingReceiptExpense(exp)}
                            className="flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors"
                            title="View & Download Receipt"
                          >
                            <FileCheck className="w-3 h-3 text-indigo-600" />
                            <span>Receipt</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-500 flex-wrap font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {formatDate(exp.date)}
                        </span>

                        {exp.vendor && (
                          <span className="flex items-center gap-1 text-slate-600">
                            <User className="w-3 h-3 text-slate-400" />
                            {exp.vendor}
                          </span>
                        )}

                        {exp.receiptNo && (
                          <span className="flex items-center gap-1 font-mono text-slate-600 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                            <Receipt className="w-3 h-3 text-slate-400" />
                            {exp.receiptNo}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <div className="text-xs sm:text-sm font-bold font-mono text-slate-900">
                        - {formatCurrency(exp.amount, currency as any)}
                      </div>
                      <div className="text-[9px] text-slate-400 font-mono">
                        {exp.paymentMode.split('/')[0]}
                      </div>
                    </div>

                    {/* Edit / Delete / Download Buttons */}
                    <div className="flex items-center gap-0.5 pl-1">
                      {hasReceipt && (
                        <button
                          onClick={() => setViewingReceiptExpense(exp)}
                          className="p-1 rounded-md text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="View & Download Receipt"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => onEditExpense(exp)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                        title="Edit Record"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteExpense(exp.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Receipt Viewer & Downloader Modal */}
      {viewingReceiptExpense && (
        <ReceiptViewerModal
          expense={viewingReceiptExpense}
          currency={currency}
          onClose={() => setViewingReceiptExpense(null)}
        />
      )}
    </>
  );
};
