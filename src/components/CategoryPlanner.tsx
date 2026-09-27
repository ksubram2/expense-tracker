import React from 'react';
import { Project, Expense } from '../types';
import { formatCurrency } from '../utils/formatters';
import { Layers, HardHat, CheckCircle2 } from 'lucide-react';

interface CategoryPlannerProps {
  project: Project;
  expenses: Expense[];
}

export const CategoryPlanner: React.FC<CategoryPlannerProps> = ({
  project,
  expenses
}) => {
  const isConstruction = project.type === 'construction';
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Calculate stats for each category / stage
  const categoryStats = project.categories.map((cat) => {
    const catExpenses = expenses.filter(e => e.categoryId === cat.id);
    const spent = catExpenses.reduce((sum, e) => sum + e.amount, 0);
    const count = catExpenses.length;
    const shareOfTotal = totalSpent > 0 ? (spent / totalSpent) * 100 : 0;
    const shareOfBudget = project.totalBudget > 0 ? (spent / project.totalBudget) * 100 : 0;

    return {
      ...cat,
      spent,
      count,
      shareOfTotal,
      shareOfBudget,
      isCompleted: spent > 0
    };
  });

  return (
    <div className="bg-slate-800/70 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-slate-700/80 shadow-xl space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-700/60">
        <div>
          <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
            {isConstruction ? (
              <HardHat className="w-5 h-5 text-amber-400" />
            ) : (
              <Layers className="w-5 h-5 text-rose-400" />
            )}
            {isConstruction ? 'Construction Milestone Stages & Handover Progress' : 'Category-wise Allocation & Spend Monitor'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isConstruction 
              ? 'Sequential verification of payments given to the site engineer across building stages' 
              : 'Monitor real-time deductions per specific marriage event head'}
          </p>
        </div>
      </div>

      {/* Grid of Stage / Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryStats.map((cat) => {
          return (
            <div
              key={cat.id}
              className={`rounded-2xl p-4 border transition-all flex flex-col justify-between space-y-3 ${
                cat.isCompleted
                  ? isConstruction
                    ? 'bg-amber-950/20 border-amber-800/50 shadow-sm'
                    : 'bg-slate-900/80 border-slate-700'
                  : 'bg-slate-900/40 border-slate-800/80 opacity-75 hover:opacity-100'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{cat.icon}</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">
                      {cat.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      {cat.count > 0 ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>{cat.count} {isConstruction ? 'installment paid' : 'record'}</span>
                        </>
                      ) : (
                        <span>Pending stage payment</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-black font-mono text-slate-100">
                    {formatCurrency(cat.spent, project.currency)}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {cat.shareOfTotal.toFixed(1)}% of total paid
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(cat.shareOfBudget, 100)}%`,
                      backgroundColor: cat.color
                    }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>{cat.shareOfBudget.toFixed(1)}% of total contract budget</span>
                  <span className={cat.isCompleted ? 'text-emerald-400 font-semibold' : 'text-slate-600'}>
                    {cat.isCompleted ? 'Paid' : 'Due'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
