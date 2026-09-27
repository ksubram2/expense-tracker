import React, { useState } from 'react';
import { Project, CurrencyCode, ProjectType } from '../types';
import { 
  Building2, 
  HeartHandshake, 
  PlusCircle, 
  RefreshCw, 
  Sparkles,
  Download,
  DollarSign,
  FolderPlus
} from 'lucide-react';

interface NavbarProps {
  projects: Project[];
  activeProject: Project;
  onSelectProject: (projectId: string) => void;
  onAddProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  onResetDemo: () => void;
  onChangeCurrency: (curr: CurrencyCode) => void;
  onExportCSV: () => void;
  onPrintReport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  projects,
  activeProject,
  onSelectProject,
  onAddProject,
  onResetDemo,
  onChangeCurrency,
  onExportCSV,
  onPrintReport
}) => {
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjType, setNewProjType] = useState<ProjectType>('marriage');
  const [newProjBudget, setNewProjBudget] = useState('2000000');
  const [newProjCurrency, setNewProjCurrency] = useState<CurrencyCode>('INR');

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;

    onAddProject({
      name: newProjName.trim(),
      type: newProjType,
      totalBudget: Number(newProjBudget) || 1000000,
      currency: newProjCurrency,
      categories: activeProject.categories, // inherit or customized
      notes: `Project created for ${newProjType} expense tracking.`
    });

    setNewProjName('');
    setShowNewProjectModal(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-8 py-3.5 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-amber-500 to-indigo-500 p-0.5 shadow-lg shadow-rose-500/20">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold bg-gradient-to-r from-rose-400 via-amber-200 to-emerald-400 bg-clip-text text-transparent">
                    SpendCraft
                  </h1>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                    Pro
                  </span>
                </div>
                <p className="text-xs text-slate-400">Marriage & Construction Budget Tracker</p>
              </div>
            </div>

            {/* Quick Demo Reset / Export on mobile */}
            <div className="flex md:hidden items-center gap-1.5">
              <button 
                onClick={onResetDemo}
                title="Reset with Demo Data"
                className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button 
                onClick={onExportCSV}
                title="Export CSV"
                className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Project Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-slate-800 w-full md:w-auto overflow-x-auto">
            {projects.map((proj) => {
              const isActive = proj.id === activeProject.id;
              const isMarriage = proj.type === 'marriage';
              const isConstruction = proj.type === 'construction';

              return (
                <button
                  key={proj.id}
                  onClick={() => onSelectProject(proj.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? isMarriage
                        ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/25'
                        : isConstruction
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold shadow-md shadow-amber-500/25'
                        : 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {isMarriage ? (
                    <HeartHandshake className={`w-4 h-4 ${isActive ? 'text-white' : 'text-rose-400'}`} />
                  ) : isConstruction ? (
                    <Building2 className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                  ) : (
                    <FolderPlus className="w-4 h-4 text-indigo-400" />
                  )}
                  <span>{proj.name}</span>
                </button>
              );
            })}

            <button
              onClick={() => setShowNewProjectModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-indigo-300 hover:bg-indigo-950/40 border border-dashed border-slate-700 hover:border-indigo-500/50 transition-all"
              title="Add New Project"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>

          {/* Right Controls: Currency, Export, Demo */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Currency Picker */}
            <div className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={activeProject.currency}
                onChange={(e) => onChangeCurrency(e.target.value as CurrencyCode)}
                className="bg-transparent text-xs font-semibold text-slate-200 outline-none cursor-pointer"
              >
                <option value="INR" className="bg-slate-900 text-slate-100">₹ INR (Lakhs/Crores)</option>
                <option value="USD" className="bg-slate-900 text-slate-100">$ USD</option>
                <option value="EUR" className="bg-slate-900 text-slate-100">€ EUR</option>
                <option value="GBP" className="bg-slate-900 text-slate-100">£ GBP</option>
                <option value="AED" className="bg-slate-900 text-slate-100">AED</option>
                <option value="CAD" className="bg-slate-900 text-slate-100">CA$ CAD</option>
                <option value="AUD" className="bg-slate-900 text-slate-100">AU$ AUD</option>
              </select>
            </div>

            {/* Export CSV */}
            <button
              onClick={onExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-all"
              title="Download Excel / CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            {/* Print Report */}
            <button
              onClick={onPrintReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-all"
              title="Print Summary Report"
            >
              <span>Print PDF</span>
            </button>

            {/* Reset Demo Data */}
            <button
              onClick={onResetDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-100 border border-rose-800/40 text-xs font-medium transition-all"
              title="Reset sample data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Demo</span>
            </button>
          </div>

        </div>
      </header>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-indigo-400" />
                Create New Tracker
              </h3>
              <button 
                onClick={() => setShowNewProjectModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Project Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. My Sister's Wedding or Farmhouse Construction"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category Template</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setNewProjType('marriage')}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                      newProjType === 'marriage'
                        ? 'border-rose-500 bg-rose-950/30 text-rose-200'
                        : 'border-slate-800 bg-slate-800/50 text-slate-400'
                    }`}
                  >
                    <HeartHandshake className="w-5 h-5 text-rose-400" />
                    <div>
                      <div className="text-xs font-bold text-slate-200">Marriage</div>
                      <div className="text-[10px] text-slate-400">Venue, Catering, Gold...</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewProjType('construction')}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                      newProjType === 'construction'
                        ? 'border-amber-500 bg-amber-950/30 text-amber-200'
                        : 'border-slate-800 bg-slate-800/50 text-slate-400'
                    }`}
                  >
                    <Building2 className="w-5 h-5 text-amber-400" />
                    <div>
                      <div className="text-xs font-bold text-slate-200">Construction</div>
                      <div className="text-[10px] text-slate-400">Steel, Cement, Labor...</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Initial Total Budget</label>
                  <input 
                    type="number"
                    min="1000"
                    step="5000"
                    required
                    value={newProjBudget}
                    onChange={(e) => setNewProjBudget(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Currency</label>
                  <select 
                    value={newProjCurrency}
                    onChange={(e) => setNewProjCurrency(e.target.value as CurrencyCode)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="INR">₹ INR</option>
                    <option value="USD">$ USD</option>
                    <option value="EUR">€ EUR</option>
                    <option value="GBP">£ GBP</option>
                    <option value="AED">AED</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/25"
                >
                  Create Tracker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
