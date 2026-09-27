import React, { useState } from 'react';
import { formatCurrency } from '../utils/formatters';
import { Wallet, X, HardHat, Sparkles, Calculator } from 'lucide-react';
import { MainTabType } from './SimpleTabNav';

interface EditBudgetModalProps {
  initialTab?: MainTabType;
  marriageBudget: number;
  constructionBudget: number;
  currency: string;
  sqftArea?: number;
  ratePerSqft?: number;
  engineerName?: string;
  onSave: (
    marriageBudget: number,
    constructionBudget: number,
    sqftInfo?: { area: number; rate: number; engineerName?: string }
  ) => void;
  onClose: () => void;
}

export const EditBudgetModal: React.FC<EditBudgetModalProps> = ({
  initialTab = 'combined',
  marriageBudget,
  constructionBudget,
  currency,
  sqftArea = 0,
  ratePerSqft = 0,
  engineerName = 'Site Engineer',
  onSave,
  onClose,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'both' | 'marriage' | 'construction'>(
    initialTab === 'marriage' ? 'marriage' : initialTab === 'construction' ? 'construction' : 'both'
  );

  const [mBudget, setMBudget] = useState(marriageBudget.toString());
  const [cBudget, setCBudget] = useState(constructionBudget.toString());
  const [area, setArea] = useState(sqftArea ? sqftArea.toString() : '');
  const [rate, setRate] = useState(ratePerSqft ? ratePerSqft.toString() : '');
  const [engName, setEngName] = useState(engineerName);

  const parsedMarriage = Math.max(0, Number(mBudget) || 0);
  const parsedConstruction = Math.max(0, Number(cBudget) || 0);
  const totalCombined = parsedMarriage + parsedConstruction;

  const handleSqftChange = (newArea: string, newRate: string) => {
    setArea(newArea);
    setRate(newRate);
    const calculated = (Number(newArea) || 0) * (Number(newRate) || 0);
    if (calculated > 0) {
      setCBudget(calculated.toString());
    }
  };

  const handleQuickAddMarriage = (val: number) => {
    setMBudget((parsedMarriage + val).toString());
  };

  const handleQuickAddConstruction = (val: number) => {
    setCBudget((parsedConstruction + val).toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(parsedMarriage, parsedConstruction, {
      area: Number(area) || 0,
      rate: Number(rate) || 0,
      engineerName: engName,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 max-w-md w-full shadow-xl space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-slate-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Set Budgets & Capital</h3>
              <p className="text-[11px] text-slate-500">Configure individual project allocations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center text-xs font-bold transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveSubTab('both')}
            className={`flex-1 py-1.5 px-2 rounded-lg transition-all ${
              activeSubTab === 'both'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Budgets
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('marriage')}
            className={`flex-1 py-1.5 px-2 rounded-lg transition-all ${
              activeSubTab === 'marriage'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Marriage Only
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('construction')}
            className={`flex-1 py-1.5 px-2 rounded-lg transition-all ${
              activeSubTab === 'construction'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Construction Only
          </button>
        </div>

        {/* Live Auto-Calculated Overview Total Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-3.5 text-white shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-300 font-medium">
            <span>Combined Overview Total (Auto-calculated)</span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded text-white font-mono">
              Marriage + Construction
            </span>
          </div>
          <div className="text-xl font-extrabold font-mono text-white mt-1">
            {formatCurrency(totalCombined, currency as any)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-300 pt-2 mt-2 border-t border-white/10 font-mono">
            <span>Marriage: {formatCurrency(parsedMarriage, currency as any, true)}</span>
            <span>Construction: {formatCurrency(parsedConstruction, currency as any, true)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* 1. Marriage Budget Section */}
          {(activeSubTab === 'both' || activeSubTab === 'marriage') && (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/90 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Marriage Budget ({currency})
                </label>
                <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  = {formatCurrency(parsedMarriage, currency as any)}
                </span>
              </div>

              <input
                type="number"
                min="0"
                step="5000"
                value={mBudget}
                onChange={(e) => setMBudget(e.target.value)}
                placeholder="Enter Marriage Budget (e.g. 1500000)"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold font-mono text-slate-900 focus:outline-none focus:border-slate-400"
              />

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {[500000, 1000000, 1500000, 2500000, 5000000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setMBudget(val.toString())}
                    className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-mono font-semibold"
                  >
                    {formatCurrency(val, currency as any, true)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. Construction Budget Section */}
          {(activeSubTab === 'both' || activeSubTab === 'construction') && (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/90 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Construction Contract Budget ({currency})
                </label>
                <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  = {formatCurrency(parsedConstruction, currency as any)}
                </span>
              </div>

              <input
                type="number"
                min="0"
                step="5000"
                value={cBudget}
                onChange={(e) => setCBudget(e.target.value)}
                placeholder="Enter Construction Budget (e.g. 2500000)"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold font-mono text-slate-900 focus:outline-none focus:border-slate-400"
              />

              {/* SqFt Calculator */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 space-y-2">
                <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <Calculator className="w-3.5 h-3.5 text-amber-500" />
                  Auto-Calculate from Sq.Ft Contract (Area × Rate)
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-medium">Sq.Ft Area</label>
                    <input
                      type="number"
                      placeholder="e.g. 1500"
                      value={area}
                      onChange={(e) => handleSqftChange(e.target.value, rate)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-medium">Rate / Sq.Ft ({currency})</label>
                    <input
                      type="number"
                      placeholder="e.g. 2100"
                      value={rate}
                      onChange={(e) => handleSqftChange(area, e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono text-slate-800"
                    />
                  </div>
                </div>

                {Number(area) > 0 && Number(rate) > 0 && (
                  <div className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded font-mono font-medium">
                    {area} sq.ft × {formatCurrency(Number(rate), currency as any)} = {formatCurrency(Number(area) * Number(rate), currency as any)}
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition-colors"
          >
            Save Budgets
          </button>
        </form>

      </div>
    </div>
  );
};

export default EditBudgetModal;
