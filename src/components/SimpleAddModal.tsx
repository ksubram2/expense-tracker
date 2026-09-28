import React, { useState, useRef } from 'react';
import { Expense, Project, PaymentMode, ReceiptAttachment } from '../types';
import { formatCurrency, compressReceiptImage } from '../utils/formatters';
import { X, Upload, Paperclip, FileText, Image as ImageIcon, Trash2, Loader2, Plus } from 'lucide-react';

interface SimpleAddModalProps {
  initialProjectId: string;
  marriageProject: Project;
  constructionProject: Project;
  currentMarriageBalance: number;
  currentConstructionBalance: number;
  editingExpense?: Expense | null;
  currency: string;
  onSave: (expenseData: Omit<Expense, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

const PAYMENT_MODES: PaymentMode[] = [
  'UPI / GPay / PhonePe',
  'Bank Transfer / NEFT / RTGS',
  'Cheque',
  'Cash',
  'Credit / Debit Card'
];

export const SimpleAddModal: React.FC<SimpleAddModalProps> = ({
  initialProjectId,
  marriageProject,
  constructionProject,
  currentMarriageBalance,
  currentConstructionBalance,
  editingExpense,
  currency,
  onSave,
  onClose,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    editingExpense?.projectId || initialProjectId || marriageProject.id
  );

  const isConstruction = selectedProjectId === constructionProject.id;
  const currentProject = isConstruction ? constructionProject : marriageProject;
  const activeBalance = isConstruction ? currentConstructionBalance : currentMarriageBalance;

  const [title, setTitle] = useState(editingExpense?.title || '');
  const [amount, setAmount] = useState(editingExpense?.amount ? editingExpense.amount.toString() : '');
  const [categoryId, setCategoryId] = useState(
    editingExpense?.categoryId || currentProject.categories[0]?.id || ''
  );
  const [date, setDate] = useState(
    editingExpense?.date || new Date().toISOString().split('T')[0]
  );
  const [vendor, setVendor] = useState(
    editingExpense?.vendor || (isConstruction ? (constructionProject.engineerName || 'Site Engineer') : '')
  );
  const [receiptNo, setReceiptNo] = useState(editingExpense?.receiptNo || '');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(
    editingExpense?.paymentMode || 'UPI / GPay / PhonePe'
  );
  const [notes, setNotes] = useState(editingExpense?.notes || '');

  // Multi-Receipt File Attachments State
  const [receipts, setReceipts] = useState<ReceiptAttachment[]>(() => {
    if (editingExpense?.receipts && editingExpense.receipts.length > 0) {
      return editingExpense.receipts;
    }
    if (editingExpense?.receiptDataUrl) {
      return [{
        id: `rec_${Date.now()}_0`,
        dataUrl: editingExpense.receiptDataUrl,
        fileName: editingExpense.receiptFileName || 'Receipt_1.png',
        fileType: editingExpense.receiptFileType || 'image/jpeg',
        uploadedAt: Date.now(),
      }];
    }
    return [];
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parsedAmount = Math.max(0, Number(amount) || 0);
  const originalAmount = editingExpense ? editingExpense.amount : 0;
  const simulatedNewBalance = activeBalance + originalAmount - parsedAmount;

  const handleQuickAddAmount = (addVal: number) => {
    const current = Number(amount) || 0;
    setAmount((current + addVal).toString());
  };

  const handleSelectCategory = (catId: string, catName: string) => {
    setCategoryId(catId);
    if (!title || title.includes('Payment') || title.includes('Disbursement')) {
      setTitle(isConstruction ? `${catName.replace(/^Stage \d+:\s*/, '')} Payout` : catName);
    }
  };

  const handleProjectSwitch = (newProjId: string) => {
    setSelectedProjectId(newProjId);
    const targetProj = newProjId === constructionProject.id ? constructionProject : marriageProject;
    setCategoryId(targetProj.categories[0]?.id || '');
    if (newProjId === constructionProject.id) {
      setVendor(constructionProject.engineerName || 'Site Engineer');
      setTitle('');
    } else {
      setVendor('');
      setTitle('');
    }
  };

  const [isCompressingReceipt, setIsCompressingReceipt] = useState(false);

  // Handle Multi-Receipt Upload (Images or PDFs)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsCompressingReceipt(true);
    const newAttachments: ReceiptAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const dataUrl = await compressReceiptImage(file, 1200, 0.75);
        newAttachments.push({
          id: `rec_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
          dataUrl,
          fileName: file.name,
          fileType: file.type,
          uploadedAt: Date.now(),
        });
      } catch (err) {
        console.error('Failed to compress receipt image:', err);
        // Fallback to basic file reader
        await new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            newAttachments.push({
              id: `rec_${Date.now()}_${i}`,
              dataUrl: reader.result as string,
              fileName: file.name,
              fileType: file.type,
              uploadedAt: Date.now(),
            });
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }
    }

    setReceipts(prev => [...prev, ...newAttachments]);
    setIsCompressingReceipt(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveReceipt = (idToRemove: string) => {
    setReceipts(prev => prev.filter(r => r.id !== idToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || parsedAmount <= 0) return;

    const selectedCategory = currentProject.categories.find(c => c.id === categoryId);
    const primaryReceipt = receipts[0];

    onSave({
      projectId: selectedProjectId,
      title: title.trim(),
      amount: parsedAmount,
      categoryId,
      categoryName: selectedCategory ? selectedCategory.name : 'General',
      date,
      vendor: vendor.trim() || undefined,
      receiptNo: receiptNo.trim() || undefined,
      paymentMode,
      notes: notes.trim() || undefined,
      receipts,
      receiptDataUrl: primaryReceipt?.dataUrl,
      receiptFileName: primaryReceipt?.fileName,
      receiptFileType: primaryReceipt?.fileType,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white border-t sm:border border-slate-200 rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 max-w-lg w-full shadow-lg space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              {isConstruction ? 'Record Construction Payout' : 'Record Marriage Expense'}
            </h3>
            <p className="text-[11px] text-slate-500">
              Automatic balance deduction & portfolio update
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Project Switcher */}
        {!editingExpense && (
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleProjectSwitch(marriageProject.id)}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg transition-all ${
                !isConstruction
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>Marriage Spend</span>
            </button>

            <button
              type="button"
              onClick={() => handleProjectSwitch(constructionProject.id)}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg transition-all ${
                isConstruction
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              <span>Engineer Payout</span>
            </button>
          </div>
        )}

        {/* Live Deduction Bar */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-mono">
          <div className="text-slate-500">
            Bal: <span className="font-bold text-slate-800">{formatCurrency(activeBalance, currency as any, true)}</span>
          </div>
          <div className="text-rose-600 font-bold">
            - {formatCurrency(parsedAmount, currency as any, true)}
          </div>
          <div className="text-emerald-700 font-bold">
            ➔ {formatCurrency(simulatedNewBalance, currency as any, true)}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {/* Amount input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Amount ({currency}) <span className="text-rose-500">*</span>
              </label>
              {parsedAmount > 0 && (
                <span className="text-xs font-bold font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  = {formatCurrency(parsedAmount, currency as any)}
                </span>
              )}
            </div>
            
            <input
              type="number"
              min="1"
              step="1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 50000"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-lg font-bold font-mono text-slate-900 focus:outline-none focus:border-slate-400"
              autoFocus
            />

            {/* Fast Quick Add Chips */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {[5000, 25000, 50000, 100000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAddAmount(val)}
                  className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold"
                >
                  +{formatCurrency(val, currency as any, true)}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isConstruction ? 'Milestone Work Description' : 'Item Description'} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isConstruction ? "e.g. Ground Floor Slab Concrete" : "e.g. Catering Advance"}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
            />
          </div>

          {/* Category / Stage Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isConstruction ? 'Contract Stage' : 'Category'}
            </label>
            <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto p-1 bg-slate-50 rounded-lg border border-slate-200">
              {currentProject.categories.map(cat => {
                const isSelected = cat.id === categoryId;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(cat.id, cat.name)}
                    className={`p-1.5 rounded-md text-left text-xs font-medium border truncate transition-colors ${
                      isSelected
                        ? 'bg-slate-900 text-white font-semibold border-slate-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate text-[11px]">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Mode in Row */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Payment Mode</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none"
              >
                {PAYMENT_MODES.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Receiver / Receipt Optional */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder={isConstruction ? "Engineer Name" : "Vendor / Payee"}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
              />
            </div>
            <div>
              <input
                type="text"
                value={receiptNo}
                onChange={(e) => setReceiptNo(e.target.value)}
                placeholder="Receipt / Cheque #"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          {/* Receipt Upload & Preview Section (Multi-File Supported) */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                Upload Receipts / Bills ({receipts.length} Attached)
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Images or PDFs</span>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            {receipts.length === 0 ? (
              <button
                type="button"
                disabled={isCompressingReceipt}
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-3 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100/80 text-xs font-semibold text-slate-600 flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
              >
                {isCompressingReceipt ? (
                  <>
                    <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
                    <span>Compressing & Attaching Receipts...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-slate-500" />
                    <span>Choose Receipts / Photos (Multiple Allowed)</span>
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-2">
                {/* List of attached files */}
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-0.5">
                  {receipts.map((rec, idx) => (
                    <div
                      key={rec.id || idx}
                      className="bg-slate-50 p-2 rounded-xl border border-slate-200 flex items-center justify-between gap-2.5"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {rec.fileType?.includes('pdf') || rec.fileName?.toLowerCase().endsWith('.pdf') ? (
                          <FileText className="w-7 h-7 text-indigo-600 shrink-0" />
                        ) : (
                          <img
                            src={rec.dataUrl}
                            alt={rec.fileName}
                            className="w-7 h-7 rounded-md object-cover border border-slate-200 shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-800 truncate">
                            {rec.fileName || `Receipt #${idx + 1}`}
                          </div>
                          <div className="text-[9px] text-emerald-600 font-medium">Ready for download</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveReceipt(rec.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors shrink-0"
                        title="Remove this receipt"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add More Files Button */}
                <button
                  type="button"
                  disabled={isCompressingReceipt}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-1.5 px-3 rounded-lg border border-dashed border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-600 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
                >
                  {isCompressingReceipt ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 text-slate-500 animate-spin" />
                      <span>Adding & Compressing...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 text-slate-600" />
                      <span>+ Attach Another Receipt / Bill</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-xs"
            >
              {editingExpense ? 'Save Changes' : 'Deduct & Save Spend'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
