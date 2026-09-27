import React from 'react';
import { MainTabType } from './SimpleTabNav';
import { formatCurrency } from '../utils/formatters';
import { Plus, Edit3, ArrowDownRight, User, HardHat } from 'lucide-react';
import { DeductionAnimationEvent } from '../types';

interface SimpleSummaryCardProps {
  activeTab: MainTabType;
  marriageBudget: number;
  constructionBudget: number;
  marriageSpent: number;
  constructionSpent: number;
  currency: string;
  engineerName?: string;
  sqftArea?: number;
  ratePerSqft?: number;
  constructionScope?: 'ground_up' | 'first_floor';
  recentDeduction: DeductionAnimationEvent | null;
  onOpenEditBudget: () => void;
  onOpenEditEngineer: () => void;
  onOpenAddExpense: () => void;
  onToggleConstructionScope?: (newScope: 'ground_up' | 'first_floor') => void;
}

export const SimpleSummaryCard: React.FC<SimpleSummaryCardProps> = ({
  activeTab,
  marriageBudget,
  constructionBudget,
  marriageSpent,
  constructionSpent,
  currency,
  engineerName = 'Site Engineer',
  sqftArea = 0,
  ratePerSqft = 0,
  constructionScope = 'first_floor',
  recentDeduction,
  onOpenEditBudget,
  onOpenEditEngineer,
  onOpenAddExpense,
  onToggleConstructionScope,
}) => {
  const combinedBudget = marriageBudget + constructionBudget;
  const combinedSpent = marriageSpent + constructionSpent;

  let currentBudget = combinedBudget;
  let currentSpent = combinedSpent;
  let cardTitle = 'Combined Portfolio';
  let subtitle = `Marriage: ${formatCurrency(marriageBudget, currency as any, true)} • Construction: ${formatCurrency(constructionBudget, currency as any, true)}`;

  if (activeTab === 'marriage') {
    currentBudget = marriageBudget;
    currentSpent = marriageSpent;
    cardTitle = 'Marriage Budget';
    subtitle = 'Ceremony, Outfits, Catering & Services';
  } else if (activeTab === 'construction') {
    currentBudget = constructionBudget;
    currentSpent = constructionSpent;
    cardTitle = 'Engineer Contract';
    const scopeLabel = constructionScope === 'first_floor' ? 'First Floor (No Basement)' : 'From Foundation';
    subtitle = sqftArea > 0 && ratePerSqft > 0
      ? `${scopeLabel} • ${sqftArea} sq.ft @ ${formatCurrency(ratePerSqft, currency as any)}/sq.ft`
      : `${scopeLabel} • Milestone Payout Contract`;
  }

  const remainingBalance = currentBudget - currentSpent;
  const percentSpent = currentBudget > 0 ? (currentSpent / currentBudget) * 100 : 0;
  const isOverBudget = remainingBalance < 0;
  const isWarning = percentSpent >= 80 && !isOverBudget;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
      
      {/* Real-time Floating Deduction Notification */}
      {recentDeduction && (
        <div className="animate-deduct flex items-center justify-between p-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs shadow-xs">
          <div className="flex items-center gap-1.5">
            <ArrowDownRight className="w-4 h-4 text-rose-400 animate-bounce" />
            <span>- {formatCurrency(recentDeduction.amount, currency as any)} Deducted</span>
          </div>
          <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded-md text-slate-200 font-normal">
            {recentDeduction.categoryName}
          </span>
        </div>
      )}

      {/* Header: Title & Edit Budget Link */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {cardTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        <button
          onClick={onOpenEditBudget}
          className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors border border-slate-200"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Budget</span>
        </button>
      </div>

      {/* Construction Engineer Strip (with 1-tap Edit option and Construction Scope Toggle) */}
      {activeTab === 'construction' && (
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-md bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-slate-500 font-medium">Site Engineer / Contractor</div>
                <div className="text-xs font-bold text-slate-900 truncate">{engineerName}</div>
              </div>
            </div>

            <button
              onClick={onOpenEditEngineer}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 shrink-0 transition-colors"
              title="Edit Engineer Name & Details"
            >
              <Edit3 className="w-3 h-3 text-slate-500" />
              <span>Edit Engineer</span>
            </button>
          </div>

          {/* Construction Type Quick Switcher */}
          {onToggleConstructionScope && (
            <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/70 text-[11px]">
              <span className="text-slate-500 font-medium">Stage Preset:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onToggleConstructionScope('first_floor')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                    constructionScope === 'first_floor'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  First Floor (No Basement)
                </button>
                <button
                  type="button"
                  onClick={() => onToggleConstructionScope('ground_up')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                    constructionScope === 'ground_up'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  From Foundation
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3 Metrics Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
        
        {/* 1. Total Budget */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
            Total Budget
          </span>
          <div className="text-sm sm:text-base font-extrabold text-slate-900 font-mono my-1 truncate">
            {formatCurrency(currentBudget, currency as any, true)}
          </div>
          <span className="text-[9px] text-slate-400 font-medium truncate">Target Capital</span>
        </div>

        {/* 2. Total Spent */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-700">
            {activeTab === 'construction' ? 'Total Paid' : 'Total Spent'}
          </span>
          <div className="text-sm sm:text-base font-extrabold text-slate-900 font-mono my-1 truncate">
            {formatCurrency(currentSpent, currency as any, true)}
          </div>
          <span className="text-[9px] font-semibold text-slate-500">
            {percentSpent.toFixed(0)}% Released
          </span>
        </div>

        {/* 3. Balance Left */}
        <div className={`p-3 rounded-xl border flex flex-col justify-between ${
          isOverBudget
            ? 'bg-rose-50 border-rose-200 text-rose-700'
            : isWarning
            ? 'bg-amber-50 border-amber-200 text-amber-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <span className="text-[10px] uppercase font-bold tracking-wider">
            {activeTab === 'construction' ? 'Pending Due' : 'Available Left'}
          </span>
          <div className="text-sm sm:text-base font-extrabold font-mono my-1 truncate">
            {formatCurrency(remainingBalance, currency as any, true)}
          </div>
          <span className="text-[9px] font-semibold opacity-90 truncate">
            {isOverBudget ? 'Deficit' : `${(100 - percentSpent).toFixed(0)}% in Hand`}
          </span>
        </div>

      </div>

      {/* Clean Visual Progress Line */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>{activeTab === 'construction' ? 'Milestone Payout Progress' : 'Fund Utilization'}</span>
          <span className="font-mono font-semibold text-slate-700">
            {formatCurrency(currentSpent, currency as any)} / {formatCurrency(currentBudget, currency as any)}
          </span>
        </div>

        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          {activeTab === 'combined' ? (
            <div className="flex h-full rounded-full overflow-hidden">
              <div 
                style={{ width: `${(marriageSpent / currentBudget) * 100}%` }}
                className="bg-slate-900 h-full transition-all duration-500"
              />
              <div 
                style={{ width: `${(constructionSpent / currentBudget) * 100}%` }}
                className="bg-amber-500 h-full transition-all duration-500"
              />
            </div>
          ) : (
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverBudget
                  ? 'bg-rose-600'
                  : isWarning
                  ? 'bg-amber-500'
                  : activeTab === 'marriage'
                  ? 'bg-slate-900'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(percentSpent, 100)}%` }}
            />
          )}
        </div>

        {/* Split footnote in combined view */}
        {activeTab === 'combined' && (
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5 font-mono">
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2 h-2 rounded-full bg-slate-900" />
              Marriage: {formatCurrency(marriageSpent, currency as any, true)}
            </span>
            <span className="flex items-center gap-1.5 text-amber-700">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Construction: {formatCurrency(constructionSpent, currency as any, true)}
            </span>
          </div>
        )}
      </div>

      {/* Add Spend CTA Button */}
      <button
        onClick={onOpenAddExpense}
        className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-slate-900 hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5 shadow-xs active:scale-99"
      >
        <Plus className="w-4 h-4" />
        <span>
          {activeTab === 'construction'
            ? 'Record Engineer Payout'
            : activeTab === 'marriage'
            ? 'Record Marriage Expense'
            : 'Record New Spend Entry'}
        </span>
      </button>

    </div>
  );
};
