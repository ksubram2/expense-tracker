import React, { useState } from 'react';
import { Project, Expense } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
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
  Title,
  Filler
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { 
  PieChart, 
  BarChart3, 
  TrendingUp, 
  Layers, 
  DollarSign, 
  Award,
  AlertCircle,
  HardHat,
  CheckCircle2
} from 'lucide-react';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler
);

interface AnalyticsDashboardProps {
  project: Project;
  expenses: Expense[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  project,
  expenses
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'donut' | 'bars' | 'trend'>('donut');
  const isConstruction = project.type === 'construction';

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingDue = project.totalBudget - totalSpent;

  // Group spending by category / stage
  const categoryTotals: Record<string, { name: string; icon: string; color: string; total: number; count: number }> = {};
  
  // Initialize with project categories
  project.categories.forEach(cat => {
    categoryTotals[cat.id] = {
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      total: 0,
      count: 0
    };
  });

  // Accumulate
  expenses.forEach(exp => {
    if (!categoryTotals[exp.categoryId]) {
      categoryTotals[exp.categoryId] = {
        name: exp.categoryName,
        icon: isConstruction ? '🏗️' : '📌',
        color: '#94a3b8',
        total: 0,
        count: 0
      };
    }
    categoryTotals[exp.categoryId].total += exp.amount;
    categoryTotals[exp.categoryId].count += 1;
  });

  // Filter categories with spend > 0 or sort descending
  const activeCategories = Object.values(categoryTotals)
    .filter(c => c.total > 0)
    .sort((a, b) => b.total - a.total);

  const hasExpenses = expenses.length > 0;

  // 1. Doughnut Data (Category / Stage Share)
  const doughnutData = {
    labels: activeCategories.map(c => `${c.icon} ${c.name}`),
    datasets: [
      {
        data: activeCategories.map(c => c.total),
        backgroundColor: activeCategories.map(c => c.color),
        borderColor: '#0f172a',
        borderWidth: 3,
        hoverOffset: 12,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        borderColor: '#475569',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function (context: any) {
            const val = context.parsed;
            const pct = totalSpent > 0 ? ((val / totalSpent) * 100).toFixed(1) : 0;
            return ` ${formatCurrency(val, project.currency)} (${pct}%)`;
          },
        },
      },
    },
    cutout: '72%',
  };

  // 2. Bar Chart Data (Comparison)
  const barData = {
    labels: activeCategories.map(c => c.name.replace(/^\d+\.\s*/, '').split(' ')[0]),
    datasets: [
      {
        label: isConstruction ? 'Given to Engineer' : 'Spent Amount',
        data: activeCategories.map(c => c.total),
        backgroundColor: activeCategories.map(c => c.color + 'dd'),
        borderColor: activeCategories.map(c => c.color),
        borderWidth: 1.5,
        borderRadius: 8,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        padding: 12,
        callbacks: {
          label: function (context: any) {
            return ` Payout: ${formatCurrency(context.parsed.y, project.currency)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#94a3b8', font: { size: 11 } },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: {
          color: '#94a3b8',
          font: { size: 10 },
          callback: function (value: any) {
            return formatCurrency(value, project.currency, true);
          },
        },
      },
    },
  };

  // 3. Timeline / Cumulative Trend Line Chart
  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let runningCumulative = 0;
  const trendLabels: string[] = [];
  const trendValues: number[] = [];

  sortedExpenses.forEach(exp => {
    runningCumulative += exp.amount;
    trendLabels.push(formatDate(exp.date));
    trendValues.push(runningCumulative);
  });

  const trendData = {
    labels: trendLabels.length > 0 ? trendLabels : ['Start'],
    datasets: [
      {
        label: isConstruction ? 'Cumulative Released to Engineer' : 'Cumulative Spent',
        data: trendValues.length > 0 ? trendValues : [0],
        borderColor: isConstruction ? '#f59e0b' : '#f43f5e',
        backgroundColor: isConstruction ? 'rgba(245, 158, 11, 0.15)' : 'rgba(244, 63, 94, 0.15)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: isConstruction ? '#f59e0b' : '#f43f5e',
        pointBorderColor: '#fff',
        pointRadius: 4,
      },
      {
        label: isConstruction ? 'Total Contract Ceiling' : 'Total Budget Limit',
        data: trendLabels.map(() => project.totalBudget),
        borderColor: '#10b981',
        borderDash: [6, 6],
        fill: false,
        pointRadius: 0,
      }
    ],
  };

  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: { color: '#cbd5e1', font: { size: 11 } },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        padding: 12,
        callbacks: {
          label: function (context: any) {
            return ` ${context.dataset.label}: ${formatCurrency(context.parsed.y, project.currency)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#94a3b8', maxTicksLimit: 8, font: { size: 10 } },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: {
          color: '#94a3b8',
          font: { size: 10 },
          callback: function (value: any) {
            return formatCurrency(value, project.currency, true);
          },
        },
      },
    },
  };

  const topCategory = activeCategories[0];
  const largestExpense = [...expenses].sort((a, b) => b.amount - a.amount)[0];
  const avgExpense = expenses.length > 0 ? Math.round(totalSpent / expenses.length) : 0;

  return (
    <div className="space-y-6">
      
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-4 border border-slate-700/60">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">
              {isConstruction ? 'Major Stage Released' : 'Top Expense Category'}
            </span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-100 truncate">
            {topCategory ? `${topCategory.icon} ${topCategory.name}` : 'No payouts yet'}
          </div>
          <div className="text-xs text-amber-400 font-mono mt-1">
            {topCategory ? formatCurrency(topCategory.total, project.currency) : '—'}
          </div>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-4 border border-slate-700/60">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">
              {isConstruction ? 'Largest Stage Payout' : 'Largest Single Expense'}
            </span>
            <DollarSign className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-100 truncate">
            {largestExpense ? largestExpense.title : 'None'}
          </div>
          <div className="text-xs text-rose-400 font-mono mt-1">
            {largestExpense ? formatCurrency(largestExpense.amount, project.currency) : '—'}
          </div>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-4 border border-slate-700/60">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">
              {isConstruction ? 'Average Installment' : 'Average Spend'}
            </span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-lg font-bold text-slate-100 font-mono">
            {formatCurrency(avgExpense, project.currency)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Across {expenses.length} {isConstruction ? 'installments given' : 'transactions'}
          </div>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-4 border border-slate-700/60">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">
              {isConstruction ? 'Completed Stages' : 'Active Heads'}
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-slate-100 font-mono">
            {activeCategories.length} / {project.categories.length}
          </div>
          <div className="text-xs text-emerald-400 mt-1">
            {isConstruction ? 'Paid Construction Milestones' : 'Categories with spends'}
          </div>
        </div>

      </div>

      {/* Main Graphical Illustration Container */}
      <div className="bg-slate-800/70 backdrop-blur-md rounded-3xl p-6 border border-slate-700/80 shadow-xl">
        
        {/* Chart View Switcher Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-700/60">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-400" />
              {isConstruction ? 'Engineer Payout & Stage Illustrations' : 'Graphical Spending Illustrations'}
            </h3>
            <p className="text-xs text-slate-400">
              {isConstruction 
                ? 'Visual stage breakdown of funds released to site engineer vs contract budget'
                : 'Interactive visualization of your budget distribution and burn rate'}
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveChartTab('donut')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeChartTab === 'donut'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>{isConstruction ? 'Stage Breakdown' : 'Category Share'}</span>
            </button>

            <button
              onClick={() => setActiveChartTab('bars')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeChartTab === 'bars'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{isConstruction ? 'Stage Payouts' : 'Spend Comparison'}</span>
            </button>

            <button
              onClick={() => setActiveChartTab('trend')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeChartTab === 'trend'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Burn Trend</span>
            </button>
          </div>
        </div>

        {/* Visual Chart Canvas Area */}
        <div className="pt-6">
          {!hasExpenses ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <AlertCircle className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No payment records yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {isConstruction 
                  ? 'Record your first milestone installment given to the engineer to view illustrations.' 
                  : 'Add your first expense or click "Reset Demo" to view illustrations.'}
              </p>
            </div>
          ) : (
            <>
              {/* Tab 1: Donut Chart + Breakdown Cards */}
              {activeChartTab === 'donut' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  
                  {/* Left: Donut Chart with Center Net Balance */}
                  <div className="lg:col-span-5 relative h-72 flex items-center justify-center">
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        {isConstruction ? 'Given to Engineer' : 'Total Spent'}
                      </span>
                      <span className="text-xl font-black text-white font-mono">
                        {formatCurrency(totalSpent, project.currency, true)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {expenses.length} {isConstruction ? 'Payouts' : 'Spends'}
                      </span>
                    </div>
                  </div>

                  {/* Right: Stage Breakdown Percentages list */}
                  <div className="lg:col-span-7 space-y-2.5 max-h-80 overflow-y-auto pr-2">
                    {activeCategories.map(cat => {
                      const pct = totalSpent > 0 ? (cat.total / totalSpent) * 100 : 0;
                      return (
                        <div
                          key={cat.name}
                          className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between gap-4 transition-all"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                              style={{ backgroundColor: cat.color }}
                            />
                            <div className="truncate">
                              <span className="text-xs font-bold text-slate-200">
                                {cat.icon} {cat.name}
                              </span>
                              <div className="text-[10px] text-slate-400">
                                {cat.count} {cat.count === 1 ? 'installment' : 'installments'} released
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-xs font-mono font-bold text-slate-100">
                              {formatCurrency(cat.total, project.currency)}
                            </div>
                            <div className="text-[10px] font-mono font-semibold text-slate-400">
                              {pct.toFixed(1)}% of paid
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

              {/* Tab 2: Comparison Bar Chart */}
              {activeChartTab === 'bars' && (
                <div className="h-80 w-full">
                  <Bar data={barData} options={barOptions} />
                </div>
              )}

              {/* Tab 3: Burn-Down Trend Line Chart */}
              {activeChartTab === 'trend' && (
                <div className="h-80 w-full">
                  <Line data={trendData} options={trendOptions} />
                </div>
              )}
            </>
          )}
        </div>

      </div>

    </div>
  );
};
