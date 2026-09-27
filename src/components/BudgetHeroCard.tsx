import React, { useState } from 'react';
import { Project, DeductionAnimationEvent } from '../types';
import { formatCurrency } from '../utils/formatters';
import { 
  Wallet, 
  TrendingDown, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Edit3, 
  ShieldAlert, 
  ArrowDownRight,
  HardHat,
  Ruler,
  Phone,
  Sparkles,
  Layers,
  HeartHandshake
} from 'lucide-react';

interface BudgetHeroCardProps {
  project: Project;
  totalSpent: number;
  recentDeduction: DeductionAnimationEvent | null;
  onUpdateBudget: (newBudget: number, applyToAll?: boolean, sqftData?: { area: number; rate: number; engineerName?: string }) => void;
  onOpenAddExpense: () => void;
}

export const BudgetHeroCard: React.FC<BudgetHeroCardProps> = ({
  project,
  totalSpent,
  recentDeduction,
  onUpdateBudget,
  onOpenAddExpense
}) => {
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(project.totalBudget.toString());
  const [applyToBoth, setApplyToBoth] = useState(true);

  // Sqft calculations for construction
  const [sqftArea, setSqftArea] = useState(project.sqftArea?.toString() || '1250');
  const [ratePerSqft, setRatePerSqft] = useState(project.ratePerSqft?.toString() || '2000');
  const [engineerName, setEngineerName] = useState(project.engineerName || 'Site Engineer / Contractor');

  const remainingBalance = project.totalBudget - totalSpent;
  const percentSpent = project.totalBudget > 0 ? (totalSpent / project.totalBudget) * 100 : 0;
  const isOverBudget = remainingBalance < 0;
  const isWarning = percentSpent >= 80 && !isOverBudget;
  const isConstruction = project.type === 'construction';

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(budgetInput);
    if (!isNaN(val) && val >= 0) {
      if (isConstruction) {
        const area = Number(sqftArea) || 0;
        const rate = Number(ratePerSqft) || 0;
        onUpdateBudget(val, applyToBoth, { area, rate, engineerName });
      } else {
        onUpdateBudget(val, applyToBoth);
      }
      setIsEditingBudget(false);
    }
  };

  const handleSqftChange = (newArea: string, newRate: string) => {
    setSqftArea(newArea);
    setRatePerSqft(newRate);
    const calculated = (Number(newArea) || 0) * (Number(newRate) || 0);
    if (calculated > 0) {
      setBudgetInput(calculated.toString());
    }
  };

  const handleQuickAdd = (amount: number) => {
    const current = project.totalBudget;
    const updated = current + amount;
    setBudgetInput(updated.toString());
    onUpdateBudget(updated, applyToBoth);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-800/90 via-slate-900/95 to-slate-950 p-6 md:p-8 border border-slate-700/80 shadow-2xl">
      
      {/* Background ambient glow effect */}
      <div 
        className={`absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-30 ${
          isOverBudget
            ? 'bg-red-600'
            : isWarning
            ? 'bg-amber-500'
            : isConstruction
            ? 'bg-amber-500'
            : 'bg-rose-500'
        }`}
      />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20 bg-indigo-600" />

      {/* Real-time Floating Deduction Animation Banner */}
      {recentDeduction && (
        <div 
          key={recentDeduction.id}
          className="absolute top-4 right-6 z-30 animate-deduct pointer-events-none flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-500/90 backdrop-blur-md text-white font-bold text-sm shadow-xl shadow-rose-500/40 border border-rose-300/40"
        >
          <ArrowDownRight className="w-5 h-5 text-rose-200 animate-bounce" />
          <span>-{formatCurrency(recentDeduction.amount, project.currency)} Deducted!</span>
          <span className="text-xs bg-black/20 px-2 py-0.5 rounded-full">{recentDeduction.categoryName}</span>
        </div>
      )}

      {/* Card Header: Project title and quick actions */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-700/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{isConstruction ? '🏗️' : '💍'}</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {project.name}
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs md:text-sm text-slate-400 flex-wrap">
            {isConstruction ? (
              <>
                <span className="flex items-center gap-1 text-amber-300 font-semibold bg-amber-950/60 px-2.5 py-0.5 rounded-md border border-amber-800/40">
                  <HardHat className="w-3.5 h-3.5" />
                  Square-Feet Engineer Contract
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-300">
                  <Ruler className="w-3.5 h-3.5 text-slate-500" />
                  {project.sqftArea || 1250} sq.ft @ {formatCurrency(project.ratePerSqft || 2000, project.currency)}/sq.ft
                </span>
                {project.engineerName && (
                  <>
                    <span>•</span>
                    <span className="text-slate-300 font-medium">
                      Engineer: <strong className="text-white">{project.engineerName}</strong>
                    </span>
                  </>
                )}
              </>
            ) : (
              <>
                <span className="text-rose-300 font-semibold bg-rose-950/60 px-2.5 py-0.5 rounded-md border border-rose-800/40">
                  Marriage & Wedding Planner
                </span>
                <span>•</span>
                <span className="font-mono text-slate-300">Live Stage & Spend Deduction</span>
              </>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setBudgetInput(project.totalBudget.toString());
              setIsEditingBudget(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 hover:border-slate-600 transition-all shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isConstruction ? 'Edit Sq.Ft & Contract' : 'Edit Initial Approx Budget'}</span>
          </button>

          <button
            onClick={onOpenAddExpense}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm text-white transition-all shadow-lg transform active:scale-95 ${
              isConstruction
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold shadow-amber-500/25'
                : 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 shadow-rose-500/25'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{isConstruction ? '+ Record Engineer Payment' : '+ Add Spend Entry'}</span>
          </button>
        </div>
      </div>

      {/* Main Visual Balance Trio */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        
        {/* 1. Total Allocated Budget */}
        <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-5 border border-slate-700/60 flex flex-col justify-between hover:border-slate-600 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-indigo-400" />
              {isConstruction ? 'Total Contract Value' : 'Initial Approx Budget'}
            </span>
            <button
              onClick={() => {
                setBudgetInput(project.totalBudget.toString());
                setIsEditingBudget(true);
              }}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold underline"
            >
              Adjust
            </button>
          </div>

          <div>
            <div className="text-2xl md:text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
              {formatCurrency(project.totalBudget, project.currency)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {isConstruction 
                ? `${project.sqftArea || 1250} sq.ft × ${formatCurrency(project.ratePerSqft || 2000, project.currency)} rate`
                : 'Shared initial budget entered by user'}
            </div>
          </div>

          {/* Quick Increment Shortcuts */}
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-700/40">
            <span className="text-[10px] text-slate-500 font-medium">Quick + :</span>
            <button
              onClick={() => handleQuickAdd(50000)}
              className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-700/60 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              +50k
            </button>
            <button
              onClick={() => handleQuickAdd(100000)}
              className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-700/60 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              +1L
            </button>
            <button
              onClick={() => handleQuickAdd(500000)}
              className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-700/60 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              +5L
            </button>
          </div>
        </div>

        {/* 2. Total Amount Spent / Handed Over */}
        <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-5 border border-slate-700/60 flex flex-col justify-between hover:border-slate-600 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 text-rose-400">
              <TrendingDown className="w-4 h-4 text-rose-400" />
              {isConstruction ? 'Total Given to Engineer' : 'Total Spent / Deducted'}
            </span>
            <span className="text-xs font-mono font-bold text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-800/40">
              {percentSpent.toFixed(1)}% Paid
            </span>
          </div>

          <div>
            <div className="text-2xl md:text-3xl font-extrabold text-rose-400 font-mono tracking-tight">
              {formatCurrency(totalSpent, project.currency)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {isConstruction 
                ? 'Sum of all stage installments handed over' 
                : 'Sum of all recorded marriage expenses'}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-700/40 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{isConstruction ? 'Work Paid Ratio:' : 'Remaining Buffer:'}</span>
            <span className="text-slate-200 font-semibold font-mono">
              {project.totalBudget > 0 ? (100 - percentSpent).toFixed(1) : 0}% pending
            </span>
          </div>
        </div>

        {/* 3. Visual Remaining Balance */}
        <div className={`backdrop-blur-md rounded-2xl p-5 border flex flex-col justify-between transition-all duration-300 shadow-xl ${
          isOverBudget
            ? 'bg-red-950/40 border-red-500/50 shadow-red-900/30 ring-2 ring-red-500/30 animate-pulse'
            : isWarning
            ? 'bg-amber-950/40 border-amber-500/50 shadow-amber-900/20'
            : 'bg-emerald-950/40 border-emerald-500/50 shadow-emerald-900/20'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 text-slate-200">
              {isOverBudget ? (
                <ShieldAlert className="w-4 h-4 text-red-400" />
              ) : isWarning ? (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
              <span>{isConstruction ? 'Pending to Pay Engineer' : 'Visual Remaining Balance'}</span>
            </span>

            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
              isOverBudget
                ? 'bg-red-500/20 text-red-300 border-red-500/40'
                : isWarning
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}>
              {isOverBudget ? 'Exceeded' : isWarning ? 'Near Limit' : 'In Budget'}
            </span>
          </div>

          <div>
            <div className={`text-2xl md:text-3xl font-black font-mono tracking-tight transition-all duration-300 ${
              isOverBudget ? 'text-red-400' : isWarning ? 'text-amber-300' : 'text-emerald-400'
            }`}>
              {formatCurrency(remainingBalance, project.currency)}
            </div>
            <div className="text-[11px] text-slate-300 mt-1">
              {isOverBudget
                ? `⚠️ Exceeded budget by ${formatCurrency(Math.abs(remainingBalance), project.currency)}`
                : `${(100 - percentSpent).toFixed(1)}% of total fund still in hand`}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-700/40 flex items-center justify-between text-[11px]">
            <span className="text-slate-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              {isConstruction ? 'Contract Balance' : 'Net Available'}
            </span>
            <span className="font-bold text-slate-100 font-mono">
              {isOverBudget ? '0 Available' : formatCurrency(remainingBalance, project.currency, true)}
            </span>
          </div>
        </div>

      </div>

      {/* Visual Dynamic Deduction Progress Bar */}
      <div className="relative z-10 mt-6 pt-6 border-t border-slate-700/60">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="text-slate-300 flex items-center gap-2">
            <span>{isConstruction ? 'Engineer Milestone Payout Progress' : 'Visual Budget Depletion Meter'}</span>
            {isOverBudget && (
              <span className="text-red-400 font-bold bg-red-950/60 px-2 py-0.5 rounded-full border border-red-800/50">
                Over-budget Limit Exceeded!
              </span>
            )}
          </span>
          <span className="text-slate-400 font-mono">
            {formatCurrency(totalSpent, project.currency)} / {formatCurrency(project.totalBudget, project.currency)}
          </span>
        </div>

        {/* Interactive Progress Bar */}
        <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800 relative">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out relative ${
              isOverBudget
                ? 'bg-gradient-to-r from-red-600 via-rose-500 to-red-500 shadow-lg shadow-red-500/50'
                : isWarning
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600'
                : isConstruction
                ? 'bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-400'
                : 'bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400'
            }`}
            style={{ width: `${Math.min(percentSpent, 100)}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]" />
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
          <span>0%</span>
          <span className="text-slate-300 font-mono">
            {percentSpent > 100 ? `${percentSpent.toFixed(1)}% (Over 100%)` : `${percentSpent.toFixed(1)}% Handed Over`}
          </span>
          <span>100% Target</span>
        </div>
      </div>

      {/* Edit Budget & Sq.Ft Contract Modal */}
      {isEditingBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-indigo-400" />
                {isConstruction ? 'Configure Square-Feet Contract' : 'Set Initial Approx Budget'}
              </h3>
              <button 
                onClick={() => setIsEditingBudget(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              
              {/* Construction Sqft Calculator */}
              {isConstruction && (
                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <HardHat className="w-4 h-4" />
                    Engineer Contract Parameters
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Site Engineer / Contractor Name</label>
                    <input
                      type="text"
                      value={engineerName}
                      onChange={(e) => setEngineerName(e.target.value)}
                      placeholder="e.g. Er. Rajesh Kumar"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Built-up Area (Sq.Ft)</label>
                      <input
                        type="number"
                        min="100"
                        step="50"
                        value={sqftArea}
                        onChange={(e) => handleSqftChange(e.target.value, ratePerSqft)}
                        placeholder="1250"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Rate per Sq.Ft ({project.currency})</label>
                      <input
                        type="number"
                        min="500"
                        step="50"
                        value={ratePerSqft}
                        onChange={(e) => handleSqftChange(sqftArea, e.target.value)}
                        placeholder="2000"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Total Budget Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Total Budget / Contract Amount ({project.currency})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-lg font-mono font-bold text-slate-100 focus:outline-none focus:border-indigo-500"
                    placeholder="2500000"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Formatted: <span className="font-mono font-bold text-slate-200">{formatCurrency(Number(budgetInput) || 0, project.currency)}</span>
                </p>
              </div>

              {/* Synchronize toggle */}
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200">Same budget for both projects</div>
                  <div className="text-[10px] text-slate-400">Keep Marriage & Construction initial budget identical</div>
                </div>
                <input
                  type="checkbox"
                  checked={applyToBoth}
                  onChange={(e) => setApplyToBoth(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              {/* Fast presets */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Preset Values:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[1500000, 2500000, 3500000, 5000000, 7500000, 10000000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setBudgetInput(preset.toString())}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-950 text-slate-300 hover:text-indigo-300 border border-slate-700 hover:border-indigo-500/50 text-xs font-mono transition-colors"
                    >
                      {formatCurrency(preset, project.currency, true)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditingBudget(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30"
                >
                  Save & Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
