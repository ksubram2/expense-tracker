import React, { useState } from 'react';
import { Project, Expense, PaymentMode } from '../types';
import { formatCurrency } from '../utils/formatters';
import { 
  PlusCircle, 
  Calendar, 
  Tag, 
  CreditCard, 
  User, 
  FileText, 
  ArrowDownCircle,
  AlertTriangle,
  HardHat,
  Receipt
} from 'lucide-react';

interface AddExpenseModalProps {
  project: Project;
  currentBalance: number;
  editingExpense?: Expense | null;
  onSave: (expenseData: Omit<Expense, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

const PAYMENT_MODES: PaymentMode[] = [
  'Bank Transfer / NEFT / RTGS',
  'UPI / GPay / PhonePe',
  'Cheque',
  'Cash',
  'Credit / Debit Card',
  'Other'
];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  project,
  currentBalance,
  editingExpense,
  onSave,
  onClose
}) => {
  const isConstruction = project.type === 'construction';

  const [title, setTitle] = useState(
    editingExpense?.title || (isConstruction ? 'Milestone Stage Payment' : '')
  );
  const [amount, setAmount] = useState(editingExpense?.amount ? editingExpense.amount.toString() : '');
  const [categoryId, setCategoryId] = useState(
    editingExpense?.categoryId || project.categories[0]?.id || ''
  );
  const [date, setDate] = useState(
    editingExpense?.date || new Date().toISOString().split('T')[0]
  );
  const [vendor, setVendor] = useState(
    editingExpense?.vendor || (isConstruction ? (project.engineerName || 'Site Engineer') : '')
  );
  const [receiptNo, setReceiptNo] = useState(editingExpense?.receiptNo || '');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(
    editingExpense?.paymentMode || (isConstruction ? 'Bank Transfer / NEFT / RTGS' : 'UPI / GPay / PhonePe')
  );
  const [notes, setNotes] = useState(editingExpense?.notes || '');

  // Live deduction calculations
  const parsedAmount = Math.max(0, Number(amount) || 0);
  const originalAmount = editingExpense ? editingExpense.amount : 0;
  const simulatedNewBalance = currentBalance + originalAmount - parsedAmount;
  const isOverBudget = simulatedNewBalance < 0;

  const handleQuickAddAmount = (addVal: number) => {
    const current = Number(amount) || 0;
    setAmount((current + addVal).toString());
  };

  const handleSelectCategory = (catId: string, catName: string) => {
    setCategoryId(catId);
    if (isConstruction && (!title || title === 'Milestone Stage Payment')) {
      setTitle(`${catName.replace(/^\d+\.\s*/, '')} Payment`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || parsedAmount <= 0) return;

    const selectedCategory = project.categories.find(c => c.id === categoryId);

    onSave({
      projectId: project.id,
      title: title.trim(),
      amount: parsedAmount,
      categoryId,
      categoryName: selectedCategory ? selectedCategory.name : 'General',
      date,
      vendor: vendor.trim() || undefined,
      receiptNo: receiptNo.trim() || undefined,
      paymentMode,
      notes: notes.trim() || undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl space-y-6 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
              {isConstruction ? (
                <HardHat className="w-6 h-6 text-amber-500" />
              ) : (
                <PlusCircle className="w-6 h-6 text-rose-500" />
              )}
              {editingExpense 
                ? (isConstruction ? 'Edit Engineer Payment' : 'Edit Spend Entry') 
                : (isConstruction ? 'Record Given Amount to Engineer' : 'Record New Marriage Expense')}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isConstruction 
                ? `Deducts from ${project.sqftArea || 1250} sq.ft Engineer Contract Balance` 
                : `Deducts directly from ${project.name}`}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Live Visual Deduction Preview Bar */}
        <div className={`p-4 rounded-2xl border transition-all duration-300 ${
          isOverBudget
            ? 'bg-red-950/40 border-red-500/40 text-red-200'
            : 'bg-slate-800/80 border-slate-700/80 text-slate-200'
        }`}>
          <div className="text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <ArrowDownCircle className="w-4 h-4 text-rose-400" />
            Live Balance Deduction Preview
          </div>

          <div className="grid grid-cols-3 gap-2 items-center text-center">
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400 font-medium">Pending to Pay</div>
              <div className="text-xs md:text-sm font-mono font-bold text-slate-200 truncate">
                {formatCurrency(currentBalance, project.currency)}
              </div>
            </div>

            <div className="text-rose-400 font-bold font-mono text-sm flex flex-col items-center">
              <span>- {formatCurrency(parsedAmount, project.currency)}</span>
              <span className="text-[10px] text-slate-500">Given Amt</span>
            </div>

            <div className={`p-2.5 rounded-xl border ${
              isOverBudget
                ? 'bg-red-900/40 border-red-500/50 text-red-300'
                : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
            }`}>
              <div className="text-[10px] opacity-80 font-medium">Remaining Due</div>
              <div className="text-xs md:text-sm font-mono font-black truncate">
                {formatCurrency(simulatedNewBalance, project.currency)}
              </div>
            </div>
          </div>

          {isOverBudget && (
            <div className="mt-2.5 flex items-center gap-1.5 text-xs text-red-400 font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Warning: Total payments given will exceed the contract budget!</span>
            </div>
          )}
        </div>

        {/* Expense Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Amount input & Quick preset increments */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Amount Given ({project.currency}) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-800/90 border border-slate-700 rounded-2xl px-4 py-3 text-xl font-bold font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                autoFocus
              />
            </div>

            {/* Quick add chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10px] text-slate-500 mr-1">Quick Add:</span>
              {[25000, 50000, 100000, 200000, 500000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAddAmount(val)}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  +{formatCurrency(val, project.currency, true)}
                </button>
              ))}
            </div>
          </div>

          {/* Title / Milestone Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              {isConstruction ? 'Work Stage / Milestone Description' : 'Spend Title / Description'} <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isConstruction ? "e.g. Ground Floor Slab Casting Installment" : "e.g. Catering Advance, Mandap booking"}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category / Stage Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-400" />
              {isConstruction ? 'Contract Construction Stage' : 'Category'} <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1.5 bg-slate-950/50 rounded-xl border border-slate-800">
              {project.categories.map((cat) => {
                const isSelected = cat.id === categoryId;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(cat.id, cat.name)}
                    className={`flex items-center gap-2.5 p-2 rounded-lg text-left transition-all text-xs font-medium border ${
                      isSelected
                        ? isConstruction
                          ? 'bg-amber-950/60 border-amber-500 text-amber-200 shadow-sm'
                          : 'bg-rose-950/60 border-rose-500 text-rose-200 shadow-sm'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-base shrink-0">{cat.icon}</span>
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date, Paid To / Engineer, Receipt / Cheque No in Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Payment Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                {isConstruction ? 'Engineer / Receiver' : 'Vendor / Paid To'}
              </label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder={isConstruction ? "Er. Rajesh Kumar" : "Vendor name"}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-indigo-400" />
                Receipt / Cheque Ref #
              </label>
              <input
                type="text"
                value={receiptNo}
                onChange={(e) => setReceiptNo(e.target.value)}
                placeholder="REC-001 / CHQ-123"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
              Payment Mode
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PAYMENT_MODES.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMode(mode)}
                  className={`px-2.5 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                    paymentMode === mode
                      ? 'bg-indigo-600 border-indigo-500 text-white font-bold shadow-sm'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              Stage Progress / Remarks (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Stage certified, concrete cube test approved, 4th milestone release"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-750"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all flex items-center gap-2 ${
                isConstruction
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold shadow-amber-500/30'
                  : 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 shadow-rose-500/30'
              }`}
            >
              <span>{editingExpense ? 'Save Changes' : (isConstruction ? 'Release & Deduct Engineer Payment' : 'Deduct & Record Spend')}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
