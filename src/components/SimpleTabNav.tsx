import React from 'react';
import { formatCurrency } from '../utils/formatters';

export type MainTabType = 'combined' | 'marriage' | 'construction';

interface SimpleTabNavProps {
  activeTab: MainTabType;
  onTabChange: (tab: MainTabType) => void;
  marriageSpent: number;
  constructionSpent: number;
  totalSpent: number;
  currency: string;
}

export const SimpleTabNav: React.FC<SimpleTabNavProps> = ({
  activeTab,
  onTabChange,
  marriageSpent,
  constructionSpent,
  totalSpent,
  currency
}) => {
  return (
    <div className="bg-slate-200/60 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
      
      {/* 1. Combined View */}
      <button
        onClick={() => onTabChange('combined')}
        className={`flex-1 py-2 px-2 rounded-lg text-center transition-all ${
          activeTab === 'combined'
            ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <div className="flex items-center justify-center gap-1.5 text-xs">
          <span className="w-2 h-2 rounded-full bg-slate-900 shrink-0" />
          <span>Overview</span>
        </div>
        <div className="text-[10px] font-mono font-semibold text-slate-500 mt-0.5">
          {formatCurrency(totalSpent, currency as any, true)}
        </div>
      </button>

      {/* 2. Marriage Tab */}
      <button
        onClick={() => onTabChange('marriage')}
        className={`flex-1 py-2 px-2 rounded-lg text-center transition-all ${
          activeTab === 'marriage'
            ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <div className="flex items-center justify-center gap-1.5 text-xs">
          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          <span>Marriage</span>
        </div>
        <div className="text-[10px] font-mono font-semibold text-slate-500 mt-0.5">
          {formatCurrency(marriageSpent, currency as any, true)}
        </div>
      </button>

      {/* 3. Engineer / Construction Tab */}
      <button
        onClick={() => onTabChange('construction')}
        className={`flex-1 py-2 px-2 rounded-lg text-center transition-all ${
          activeTab === 'construction'
            ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <div className="flex items-center justify-center gap-1.5 text-xs">
          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
          <span>Construction</span>
        </div>
        <div className="text-[10px] font-mono font-semibold text-slate-500 mt-0.5">
          {formatCurrency(constructionSpent, currency as any, true)}
        </div>
      </button>

    </div>
  );
};
