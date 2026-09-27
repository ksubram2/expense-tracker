import React, { useState, useMemo } from 'react';
import { Project, Expense, PaymentMode } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { 
  Search, 
  Trash2, 
  Edit3, 
  Calendar, 
  User, 
  CreditCard,
  AlertCircle,
  Plus,
  Receipt,
  HardHat
} from 'lucide-react';

interface ExpenseListProps {
  project: Project;
  expenses: Expense[];
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
  onOpenAddExpense: () => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  project,
  expenses,
  onEditExpense,
  onDeleteExpense,
  onOpenAddExpense
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  const isConstruction = project.type === 'construction';

  // Filter & Sort
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        // Keyword Search
        const matchesSearch = 
          exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exp.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (exp.vendor && exp.vendor.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (exp.receiptNo && exp.receiptNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (exp.notes && exp.notes.toLowerCase().includes(searchTerm.toLowerCase()));

        // Category filter
        const matchesCategory = selectedCategory === 'all' || exp.categoryId === selectedCategory;

        // Payment Mode filter
        const matchesPayment = selectedPaymentMode === 'all' || exp.paymentMode === selectedPaymentMode;

        return matchesSearch && matchesCategory && matchesPayment;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        return 0;
      });
  }, [expenses, searchTerm, selectedCategory, selectedPaymentMode, sortBy]);

  const totalFilteredSum = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const getCategoryMeta = (categoryId: string) => {
    return project.categories.find(c => c.id === categoryId) || {
      name: 'General',
      icon: isConstruction ? '🏗️' : '📌',
      color: '#94a3b8'
    };
  };

  return (
    <div className="bg-slate-800/70 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-slate-700/80 shadow-xl space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-700/60">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-extrabold text-white">
              {isConstruction ? 'Engineer Payout & Stage Installment Log' : 'Transaction History & Deduction Log'}
            </h3>
            <span className="text-xs font-mono font-bold bg-indigo-950 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-800/60">
              {filteredExpenses.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isConstruction ? 'Total Given in Selected View:' : 'Filtered Spend Total:'}{' '}
            <span className="font-mono font-bold text-rose-400">{formatCurrency(totalFilteredSum, project.currency)}</span>
          </p>
        </div>

        <button
          onClick={onOpenAddExpense}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-650 text-slate-100 text-xs font-bold border border-slate-600 transition-all self-start lg:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isConstruction ? '+ Record Engineer Payment' : '+ Add Record'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isConstruction ? "Search stage, receipt#, remarks..." : "Search vendor, item, notes..."}
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category / Stage Dropdown */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">{isConstruction ? 'All Construction Stages' : 'All Categories'}</option>
            {project.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Mode Filter */}
        <div className="relative">
          <select
            value={selectedPaymentMode}
            onChange={(e) => setSelectedPaymentMode(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Payment Modes</option>
            <option value="Bank Transfer / NEFT / RTGS">Bank Transfer / NEFT / RTGS</option>
            <option value="UPI / GPay / PhonePe">UPI / GPay / PhonePe</option>
            <option value="Cheque">Cheque</option>
            <option value="Cash">Cash</option>
            <option value="Credit / Debit Card">Credit / Debit Card</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="date-desc">Newest Date First</option>
            <option value="date-asc">Oldest Date First</option>
            <option value="amount-desc">Highest Amount First</option>
            <option value="amount-asc">Lowest Amount First</option>
          </select>
        </div>

      </div>

      {/* Expense Items List */}
      <div className="space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
            <AlertCircle className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">
              {isConstruction ? 'No engineer payment records found' : 'No matching spend records'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search query or filters.
            </p>
          </div>
        ) : (
          filteredExpenses.map((exp) => {
            const cat = getCategoryMeta(exp.categoryId);

            return (
              <div
                key={exp.id}
                className="group relative bg-slate-900/70 hover:bg-slate-900/90 rounded-2xl p-4 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
              >
                {/* Left accent color indicator */}
                <div 
                  className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full"
                  style={{ backgroundColor: cat.color }}
                />

                {/* Left: Icon, Title, Category, Vendor/Engineer, Receipt, Notes */}
                <div className="flex items-start gap-3.5 pl-2 min-w-0">
                  <div 
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-inner"
                    style={{ backgroundColor: cat.color + '22', border: `1px solid ${cat.color}44` }}
                  >
                    {cat.icon}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-white tracking-tight">
                        {exp.title}
                      </h4>
                      <span 
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: cat.color + '20', color: cat.color }}
                      >
                        {cat.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {formatDate(exp.date)}
                      </span>

                      {exp.vendor && (
                        <span className="flex items-center gap-1 text-slate-300">
                          <User className="w-3 h-3 text-slate-500" />
                          {exp.vendor}
                        </span>
                      )}

                      {exp.receiptNo && (
                        <span className="flex items-center gap-1 font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                          <Receipt className="w-3 h-3" />
                          {exp.receiptNo}
                        </span>
                      )}

                      <span className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-md text-slate-300 text-[10px]">
                        <CreditCard className="w-3 h-3 text-slate-500" />
                        {exp.paymentMode}
                      </span>
                    </div>

                    {exp.notes && (
                      <p className="text-[11px] text-slate-400 italic bg-slate-950/40 px-2 py-1 rounded-lg border border-slate-800/50 mt-1 max-w-xl">
                        "{exp.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Amount & Action buttons */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div className="text-base sm:text-lg font-black font-mono text-rose-400">
                    - {formatCurrency(exp.amount, project.currency)}
                  </div>

                  {/* Actions (Edit / Delete) */}
                  <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditExpense(exp)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition-colors"
                      title="Edit Entry"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteExpense(exp.id)}
                      className="p-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/80 text-red-400 hover:text-red-200 border border-red-800/40 text-xs transition-colors"
                      title="Delete Entry"
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
  );
};
