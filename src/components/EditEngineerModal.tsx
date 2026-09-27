import React, { useState } from 'react';
import { X, User, HardHat, Phone, Ruler } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface EditEngineerModalProps {
  engineerName?: string;
  engineerPhone?: string;
  sqftArea?: number;
  ratePerSqft?: number;
  constructionScope?: 'ground_up' | 'first_floor';
  currency: string;
  onSave: (info: {
    engineerName: string;
    engineerPhone?: string;
    sqftArea: number;
    ratePerSqft: number;
    constructionScope: 'ground_up' | 'first_floor';
  }) => void;
  onClose: () => void;
}

export const EditEngineerModal: React.FC<EditEngineerModalProps> = ({
  engineerName = 'Site Engineer',
  engineerPhone = '',
  sqftArea = 0,
  ratePerSqft = 0,
  constructionScope = 'first_floor',
  currency,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(engineerName);
  const [phone, setPhone] = useState(engineerPhone);
  const [area, setArea] = useState(sqftArea ? sqftArea.toString() : '');
  const [rate, setRate] = useState(ratePerSqft ? ratePerSqft.toString() : '');
  const [scope, setScope] = useState<'ground_up' | 'first_floor'>(constructionScope);

  const contractTotal = (Number(area) || 0) * (Number(rate) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      engineerName: name.trim(),
      engineerPhone: phone.trim() || undefined,
      sqftArea: Number(area) || 0,
      ratePerSqft: Number(rate) || 0,
      constructionScope: scope,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 max-w-sm w-full shadow-lg space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <User className="w-4 h-4 text-slate-700" />
            Edit Site Engineer Details
          </h3>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-md bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center text-xs font-bold"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          
          {/* Engineer Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Site Engineer / Contractor Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Er. Senthil Kumar"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:border-slate-400"
              autoFocus
            />
          </div>

          {/* Contact Phone (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contact Phone (Optional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
            />
          </div>

          {/* Construction Type Scope (First Floor vs Ground Up) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Construction Type / Milestone Stages
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setScope('first_floor')}
                className={`py-2 px-2 rounded-lg text-center transition-all ${
                  scope === 'first_floor'
                    ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="font-bold">First Floor / Elevated</div>
                <div className="text-[9px] text-slate-400 font-normal">No Basement/Foundation</div>
              </button>

              <button
                type="button"
                onClick={() => setScope('ground_up')}
                className={`py-2 px-2 rounded-lg text-center transition-all ${
                  scope === 'ground_up'
                    ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="font-bold">From Foundation</div>
                <div className="text-[9px] text-slate-400 font-normal">Full Ground & Basement</div>
              </button>
            </div>
          </div>

          {/* Square Feet & Rate */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <Ruler className="w-3.5 h-3.5 text-slate-600" />
              Contract Scope & Square-Feet Rate
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-500 font-medium">Built-up Sq.Ft</label>
                <input
                  type="number"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-medium">Rate / Sq.Ft</label>
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-800"
                />
              </div>
            </div>

            <div className="text-[11px] text-slate-600 font-mono pt-1 border-t border-slate-200/60 flex justify-between">
              <span>Contract Valuation:</span>
              <strong className="text-slate-900">{formatCurrency(contractTotal, currency as any)}</strong>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition-colors"
          >
            Save Engineer Details
          </button>
        </form>

      </div>
    </div>
  );
};
