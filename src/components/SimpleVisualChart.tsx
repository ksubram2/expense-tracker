import React from 'react';
import { MainTabType } from './SimpleTabNav';
import { Expense, Project } from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  DoughnutController
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { PieChart } from 'lucide-react';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  DoughnutController
);

interface SimpleVisualChartProps {
  activeTab: MainTabType;
  marriageExpenses: Expense[];
  constructionExpenses: Expense[];
  marriageProject: Project;
  constructionProject: Project;
  marriageBudget: number;
  constructionBudget: number;
  currency: string;
}

export const SimpleVisualChart: React.FC<SimpleVisualChartProps> = ({
  activeTab,
  marriageExpenses,
  constructionExpenses,
  marriageProject,
  constructionProject,
  marriageBudget,
  constructionBudget,
  currency,
}) => {
  const marriageTotal = marriageExpenses.reduce((sum, e) => sum + e.amount, 0);
  const constructionTotal = constructionExpenses.reduce((sum, e) => sum + e.amount, 0);
  const overallTotal = marriageTotal + constructionTotal;

  const marriageBalance = marriageBudget - marriageTotal;
  const constructionBalance = constructionBudget - constructionTotal;
  const totalCombinedBudget = marriageBudget + constructionBudget;
  const totalCombinedSpent = overallTotal;
  const totalCombinedBalance = totalCombinedBudget - totalCombinedSpent;

  // 1. If COMBINED / OVERVIEW Tab
  if (activeTab === 'combined') {
    if (overallTotal === 0 && totalCombinedBudget === 0) {
      return (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 text-center text-slate-400 text-xs py-6">
          No budget or transactions recorded yet. Tap "Edit Budget" or "+ Add Spend" to begin.
        </div>
      );
    }

    const combinedChartData = {
      labels: ['Marriage Spent', 'Construction Paid', 'Remaining Reserve'],
      datasets: [
        {
          data: [
            marriageTotal,
            constructionTotal,
            Math.max(0, totalCombinedBalance)
          ],
          backgroundColor: ['#0f172a', '#f59e0b', '#e2e8f0'],
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverOffset: 4,
        },
      ],
    };

    const doughnutOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: false, // Prevents popup overlapping center numbers
        },
      },
      cutout: '72%',
    };

    return (
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
            <PieChart className="w-3.5 h-3.5 text-slate-600" />
            Overview Portfolio Insights
          </h3>
          <span className="text-xs font-mono font-bold text-slate-700">
            Total Budget: {formatCurrency(totalCombinedBudget, currency as any, true)}
          </span>
        </div>

        {/* Side-by-Side Module Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* Marriage Module Card */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
                <span className="text-xs font-bold text-slate-900">Marriage Module</span>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                {marriageBudget > 0 ? ((marriageTotal / marriageBudget) * 100).toFixed(0) : 0}% Used
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1 text-center font-mono">
              <div className="bg-white p-1.5 rounded-lg border border-slate-200/60">
                <div className="text-[9px] text-slate-400 font-sans uppercase">Budget</div>
                <div className="text-xs font-bold text-slate-800 truncate">{formatCurrency(marriageBudget, currency as any, true)}</div>
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-slate-200/60">
                <div className="text-[9px] text-slate-400 font-sans uppercase">Spent</div>
                <div className="text-xs font-bold text-slate-900 truncate">{formatCurrency(marriageTotal, currency as any, true)}</div>
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-slate-200/60">
                <div className="text-[9px] text-slate-400 font-sans uppercase">Balance</div>
                <div className={`text-xs font-bold truncate ${marriageBalance < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {formatCurrency(marriageBalance, currency as any, true)}
                </div>
              </div>
            </div>
          </div>

          {/* Construction Module Card */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-xs font-bold text-slate-900">Construction Module</span>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white text-amber-700 border border-amber-200">
                {constructionBudget > 0 ? ((constructionTotal / constructionBudget) * 100).toFixed(0) : 0}% Released
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1 text-center font-mono">
              <div className="bg-white p-1.5 rounded-lg border border-slate-200/60">
                <div className="text-[9px] text-slate-400 font-sans uppercase">Contract</div>
                <div className="text-xs font-bold text-slate-800 truncate">{formatCurrency(constructionBudget, currency as any, true)}</div>
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-slate-200/60">
                <div className="text-[9px] text-slate-400 font-sans uppercase">Paid</div>
                <div className="text-xs font-bold text-slate-900 truncate">{formatCurrency(constructionTotal, currency as any, true)}</div>
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-slate-200/60">
                <div className="text-[9px] text-slate-400 font-sans uppercase">Pending</div>
                <div className={`text-xs font-bold truncate ${constructionBalance < 0 ? 'text-rose-600' : 'text-amber-700'}`}>
                  {formatCurrency(constructionBalance, currency as any, true)}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Visual Allocation Donut & Legend */}
        {overallTotal > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2 border-t border-slate-100">
            <div className="relative h-40 flex items-center justify-center">
              <Doughnut data={combinedChartData} options={doughnutOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Spent</span>
                <span className="text-sm sm:text-base font-extrabold text-slate-900 font-mono">
                  {formatCurrency(overallTotal, currency as any, true)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900 shrink-0" />
                  <span className="text-xs font-semibold text-slate-800">Marriage Spent</span>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs font-bold text-slate-900">
                    {formatCurrency(marriageTotal, currency as any)}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {overallTotal > 0 ? ((marriageTotal / overallTotal) * 100).toFixed(1) : 0}% of spent
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-xs font-semibold text-slate-800">Construction Paid</span>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs font-bold text-slate-900">
                    {formatCurrency(constructionTotal, currency as any)}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {overallTotal > 0 ? ((constructionTotal / overallTotal) * 100).toFixed(1) : 0}% of spent
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // 2. Individual Module Insights (Marriage Tab or Construction Tab)
  const isMarriage = activeTab === 'marriage';
  const activeExpenses = isMarriage ? marriageExpenses : constructionExpenses;
  const activeProject = isMarriage ? marriageProject : constructionProject;
  const currentTotal = isMarriage ? marriageTotal : constructionTotal;
  const currentModuleBudget = isMarriage ? marriageBudget : constructionBudget;
  const currentModuleBalance = isMarriage ? marriageBalance : constructionBalance;
  const percentUtilized = currentModuleBudget > 0 ? (currentTotal / currentModuleBudget) * 100 : 0;

  if (activeExpenses.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-slate-200 text-center text-slate-400 text-xs py-6">
        No records yet for {isMarriage ? 'Marriage' : 'Construction'}. Tap "+ Add Spend" to record disbursements.
      </div>
    );
  }

  const catMap: Record<string, { name: string; color: string; total: number; count: number }> = {};
  activeProject.categories.forEach(cat => {
    catMap[cat.id] = { name: cat.name, color: cat.color, total: 0, count: 0 };
  });
  activeExpenses.forEach(exp => {
    if (!catMap[exp.categoryId]) {
      catMap[exp.categoryId] = { name: exp.categoryName, color: '#64748b', total: 0, count: 0 };
    }
    catMap[exp.categoryId].total += exp.amount;
    catMap[exp.categoryId].count += 1;
  });

  const activeCats = Object.values(catMap).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  const chartData = {
    labels: activeCats.map(c => c.name),
    datasets: [
      {
        data: activeCats.map(c => c.total),
        backgroundColor: activeCats.map(c => c.color),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: false, // Prevents popup overlapping center numbers
      },
    },
    cutout: '72%',
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
        <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
          <PieChart className="w-3.5 h-3.5 text-slate-600" />
          {isMarriage ? 'Marriage Category Breakdown' : 'Construction Milestone Releases'}
        </h3>
        <span className="text-xs font-mono font-bold text-slate-700">
          {activeCats.length} Active {isMarriage ? 'Heads' : 'Stages'}
        </span>
      </div>

      {/* Module Utilization Strip */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
        <div>
          <span className="text-[10px] text-slate-500 font-medium block">
            {isMarriage ? 'Marriage Fund Utilization' : 'Contract Disbursement Progress'}
          </span>
          <span className="font-mono font-bold text-slate-900 text-sm">
            {formatCurrency(currentTotal, currency as any, true)} / {formatCurrency(currentModuleBudget, currency as any, true)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-500 font-medium block">
            {isMarriage ? 'Available Left' : 'Pending Milestone Due'}
          </span>
          <span className={`font-mono font-bold text-sm ${currentModuleBalance < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
            {formatCurrency(currentModuleBalance, currency as any, true)}
          </span>
        </div>
      </div>

      {/* Donut & Category List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
        <div className="relative h-40 flex items-center justify-center">
          <Doughnut data={chartData} options={doughnutOptions} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {isMarriage ? 'Total Spent' : 'Total Paid'}
            </span>
            <span className="text-sm sm:text-base font-extrabold text-slate-900 font-mono">
              {formatCurrency(currentTotal, currency as any, true)}
            </span>
          </div>
        </div>

        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {activeCats.map(c => {
            const pct = currentTotal > 0 ? (c.total / currentTotal) * 100 : 0;
            return (
              <div key={c.name} className="bg-slate-50 p-2 rounded-lg border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="text-xs font-semibold text-slate-800 truncate">{c.name}</span>
                </div>
                <div className="text-right font-mono shrink-0 pl-2">
                  <div className="text-xs font-bold text-slate-900">{formatCurrency(c.total, currency as any)}</div>
                  <div className="text-[9px] text-slate-500">{pct.toFixed(1)}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
