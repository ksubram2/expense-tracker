import React, { useState, useEffect } from 'react';
import { Project, Expense, CurrencyCode, DeductionAnimationEvent } from './types';
import {
  INITIAL_PROJECTS,
  INITIAL_EXPENSES,
  ENGINEER_CONTRACT_STAGES_GROUND_UP,
  ENGINEER_CONTRACT_STAGES_FIRST_FLOOR,
} from './data/presets';
import { SimpleHeader } from './components/SimpleHeader';
import { SimpleTabNav, MainTabType } from './components/SimpleTabNav';
import { SimpleSummaryCard } from './components/SimpleSummaryCard';
import { SimpleVisualChart } from './components/SimpleVisualChart';
import { SimpleExpenseList } from './components/SimpleExpenseList';
import { SimpleAddModal } from './components/SimpleAddModal';
import { EditBudgetModal } from './components/EditBudgetModal';
import { EditEngineerModal } from './components/EditEngineerModal';
import { FloatingAddButton } from './components/FloatingAddButton';
import { PinLockScreen } from './components/PinLockScreen';
import { playDeductSound, playSuccessSound } from './utils/formatters';
import {
  saveToIndexedDB,
  loadFromIndexedDB,
  exportFullBackupFile,
  importFullBackupFile,
} from './utils/storage';

const STORAGE_KEY_PROJECTS = 'spendcraft_projects_clean_v2';
const STORAGE_KEY_EXPENSES = 'spendcraft_expenses_clean_v2';
const STORAGE_KEY_PIN = 'spendcraft_security_pin_v1';

export const App: React.FC = () => {
  // Private PIN Lock Security State
  const [storedPin, setStoredPin] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_PIN);
    } catch {
      return null;
    }
  });

  const [isLocked, setIsLocked] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem(STORAGE_KEY_PIN));
    } catch {
      return false;
    }
  });

  const [isSettingUpPin, setIsSettingUpPin] = useState(false);

  // Projects with Individual Module Budgets (Marriage & Construction)
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROJECTS);
      return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
    }
  });

  // Expenses & Engineer Payouts (Starts 100% Blank: [])
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EXPENSES);
      return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  });

  // Active Tab: 'combined' | 'marriage' | 'construction'
  const [activeTab, setActiveTab] = useState<MainTabType>('combined');

  // Modals & Real-time animation
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditBudgetOpen, setIsEditBudgetOpen] = useState(false);
  const [isEditEngineerOpen, setIsEditEngineerOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [recentDeduction, setRecentDeduction] = useState<DeductionAnimationEvent | null>(null);

  // Dual-Layer Persistence: Sync to localStorage & IndexedDB
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.warn('LocalStorage quota limit reached, relying on IndexedDB:', e);
    }
    saveToIndexedDB(STORAGE_KEY_PROJECTS, projects);
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
    } catch (e) {
      console.warn('LocalStorage quota limit reached, relying on IndexedDB:', e);
    }
    saveToIndexedDB(STORAGE_KEY_EXPENSES, expenses);
  }, [expenses]);

  // Initial IndexedDB check fallback
  useEffect(() => {
    const checkIndexedDBFallback = async () => {
      if (expenses.length === 0) {
        const idbExpenses = await loadFromIndexedDB<Expense[]>(STORAGE_KEY_EXPENSES);
        if (idbExpenses && idbExpenses.length > 0) {
          setExpenses(idbExpenses);
        }
      }
      if (projects.length === 0) {
        const idbProjects = await loadFromIndexedDB<Project[]>(STORAGE_KEY_PROJECTS);
        if (idbProjects && idbProjects.length > 0) {
          setProjects(idbProjects);
        }
      }
    };
    checkIndexedDBFallback();
  }, []);

  // Derived Projects
  const marriageProject = projects.find(p => p.type === 'marriage') || projects[0];
  const constructionProject = projects.find(p => p.type === 'construction') || projects[1];

  // Individual Module Budgets
  const marriageBudget = marriageProject.totalBudget || 0;
  const constructionBudget = constructionProject.totalBudget || 0;

  // Overview Tab Auto-Calculated Combined Total Budget
  const totalCombinedBudget = marriageBudget + constructionBudget;

  // Derived Module Spends
  const marriageExpenses = expenses.filter(e => e.projectId === marriageProject.id);
  const constructionExpenses = expenses.filter(e => e.projectId === constructionProject.id);

  const marriageSpent = marriageExpenses.reduce((sum, e) => sum + e.amount, 0);
  const constructionSpent = constructionExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalCombinedSpent = marriageSpent + constructionSpent;

  const currency = marriageProject.currency || 'INR';

  // Handlers
  const handleToggleConstructionScope = (newScope: 'ground_up' | 'first_floor') => {
    setProjects(prev =>
      prev.map(p => {
        if (p.type === 'construction') {
          const newCategories =
            newScope === 'first_floor'
              ? ENGINEER_CONTRACT_STAGES_FIRST_FLOOR
              : ENGINEER_CONTRACT_STAGES_GROUND_UP;
          return {
            ...p,
            constructionScope: newScope,
            categories: newCategories,
          };
        }
        return p;
      })
    );
    playSuccessSound();
  };

  const handleUpdateBudget = (
    newMarriageBudget: number,
    newConstructionBudget: number,
    sqftInfo?: { area: number; rate: number; engineerName?: string }
  ) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.type === 'marriage') {
          return { ...p, totalBudget: newMarriageBudget };
        }
        if (p.type === 'construction') {
          return {
            ...p,
            totalBudget: newConstructionBudget,
            sqftArea: sqftInfo?.area !== undefined ? sqftInfo.area : p.sqftArea,
            ratePerSqft: sqftInfo?.rate !== undefined ? sqftInfo.rate : p.ratePerSqft,
            engineerName: sqftInfo?.engineerName || p.engineerName,
          };
        }
        return p;
      })
    );
    playSuccessSound();
  };

  const handleUpdateEngineer = (info: {
    engineerName: string;
    engineerPhone?: string;
    sqftArea: number;
    ratePerSqft: number;
    constructionScope?: 'ground_up' | 'first_floor';
  }) => {
    const calcBudget = info.sqftArea * info.ratePerSqft;
    setProjects(prev =>
      prev.map(p => {
        if (p.type === 'construction') {
          const scope = info.constructionScope || p.constructionScope || 'first_floor';
          const newCategories =
            scope === 'first_floor'
              ? ENGINEER_CONTRACT_STAGES_FIRST_FLOOR
              : ENGINEER_CONTRACT_STAGES_GROUND_UP;
          return {
            ...p,
            engineerName: info.engineerName,
            engineerPhone: info.engineerPhone,
            sqftArea: info.sqftArea,
            ratePerSqft: info.ratePerSqft,
            constructionScope: scope,
            categories: newCategories,
            totalBudget: calcBudget > 0 ? calcBudget : p.totalBudget,
          };
        }
        return p;
      })
    );
    playSuccessSound();
  };

  const handleSaveExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    if (editingExpense) {
      setExpenses(prev =>
        prev.map(e =>
          e.id === editingExpense.id
            ? { ...expenseData, id: editingExpense.id, createdAt: editingExpense.createdAt }
            : e
        )
      );
      setEditingExpense(null);
      setIsAddModalOpen(false);
      playSuccessSound();
    } else {
      const newId = `exp_${Date.now()}`;
      const newExpense: Expense = {
        ...expenseData,
        id: newId,
        createdAt: Date.now(),
      };

      setExpenses(prev => [newExpense, ...prev]);
      setIsAddModalOpen(false);

      playDeductSound();
      
      const targetBudget = expenseData.projectId === constructionProject.id ? constructionBudget : marriageBudget;
      const targetSpent = expenseData.projectId === constructionProject.id ? constructionSpent : marriageSpent;
      const remainingAfter = targetBudget - targetSpent - expenseData.amount;

      const deductionEvt: DeductionAnimationEvent = {
        id: newId,
        amount: expenseData.amount,
        categoryName: expenseData.categoryName,
        remainingAfter,
        timestamp: Date.now(),
      };
      setRecentDeduction(deductionEvt);

      setTimeout(() => {
        setRecentDeduction(prev => (prev?.id === newId ? null : prev));
      }, 3000);
    }
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (window.confirm('Delete this spend record? The amount will be credited back to your balance.')) {
      setExpenses(prev => prev.filter(e => e.id !== expenseId));
      playSuccessSound();
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsAddModalOpen(true);
  };

  const handleResetDemo = () => {
    if (window.confirm('Clear all data to a fresh blank sheet?')) {
      setProjects(INITIAL_PROJECTS);
      setExpenses([]);
      setActiveTab('combined');
      playSuccessSound();
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Type', 'Title', 'Category / Stage', 'Amount', 'Payment Mode', 'Vendor / Engineer', 'Receipt Ref', 'Notes'];
    const rows = expenses.map(e => [
      e.id,
      e.date,
      e.projectId === marriageProject.id ? 'Marriage' : 'Construction Engineer',
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.categoryName}"`,
      e.amount,
      `"${e.paymentMode}"`,
      `"${(e.vendor || '').replace(/"/g, '""')}"`,
      `"${(e.receiptNo || '').replace(/"/g, '""')}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SpendCraft_Expense_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUnlock = () => {
    setIsLocked(false);
    playSuccessSound();
  };

  const handleSetNewPin = (newPin: string) => {
    localStorage.setItem(STORAGE_KEY_PIN, newPin);
    setStoredPin(newPin);
    setIsSettingUpPin(false);
    setIsLocked(false);
    playSuccessSound();
  };

  const handleLockApp = () => {
    setIsLocked(true);
  };

  const handleExportFullBackup = () => {
    exportFullBackupFile(projects, expenses);
    playSuccessSound();
  };

  const handleImportBackup = async (file: File) => {
    try {
      const data = await importFullBackupFile(file);
      if (data.projects) setProjects(data.projects);
      if (data.expenses) setExpenses(data.expenses);
      playSuccessSound();
      alert('Backup restored successfully!');
    } catch (err: any) {
      alert('Failed to restore backup: ' + (err?.message || 'Invalid file format'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans pb-20">
      
      {/* 0. Private Security PIN Lock Screen (if locked or setting up PIN) */}
      {(isLocked || isSettingUpPin) && (
        <PinLockScreen
          storedPin={storedPin}
          onUnlock={handleUnlock}
          onSetNewPin={handleSetNewPin}
          isSettingUp={isSettingUpPin}
          onSkipSetup={() => setIsSettingUpPin(false)}
        />
      )}

      {/* 1. Header (Displays Auto-Calculated Combined Total Budget & Lock Button) */}
      <SimpleHeader
        totalBudget={totalCombinedBudget}
        currency={currency}
        hasPin={Boolean(storedPin)}
        onOpenEditBudget={() => setIsEditBudgetOpen(true)}
        onResetDemo={handleResetDemo}
        onExportCSV={handleExportCSV}
        onLockApp={handleLockApp}
        onOpenPinSetup={handleOpenPinSetup}
        onExportBackup={handleExportFullBackup}
        onImportBackup={handleImportBackup}
      />

      {/* Main Responsive Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 space-y-4">
        
        {/* 2. Fast 3-Tab Navigator (Overview, Marriage, Construction) */}
        <SimpleTabNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          marriageSpent={marriageSpent}
          constructionSpent={constructionSpent}
          totalSpent={totalCombinedSpent}
          currency={currency}
        />

        {/* 3. Hero Visual Balance Card */}
        <SimpleSummaryCard
          activeTab={activeTab}
          marriageBudget={marriageBudget}
          constructionBudget={constructionBudget}
          marriageSpent={marriageSpent}
          constructionSpent={constructionSpent}
          currency={currency}
          engineerName={constructionProject.engineerName}
          sqftArea={constructionProject.sqftArea}
          ratePerSqft={constructionProject.ratePerSqft}
          constructionScope={constructionProject.constructionScope}
          recentDeduction={recentDeduction}
          onOpenEditBudget={() => setIsEditBudgetOpen(true)}
          onOpenEditEngineer={() => setIsEditEngineerOpen(true)}
          onToggleConstructionScope={handleToggleConstructionScope}
          onOpenAddExpense={() => {
            setEditingExpense(null);
            setIsAddModalOpen(true);
          }}
        />

        {/* 4. Graphical Illustration & Insights */}
        <SimpleVisualChart
          activeTab={activeTab}
          marriageExpenses={marriageExpenses}
          constructionExpenses={constructionExpenses}
          marriageProject={marriageProject}
          constructionProject={constructionProject}
          marriageBudget={marriageBudget}
          constructionBudget={constructionBudget}
          currency={currency}
        />

        {/* 5. Mobile-First Expense / Payout List */}
        <SimpleExpenseList
          activeTab={activeTab}
          allExpenses={expenses}
          marriageProject={marriageProject}
          constructionProject={constructionProject}
          currency={currency}
          onEditExpense={handleEditExpense}
          onDeleteExpense={handleDeleteExpense}
          onOpenAddExpense={() => {
            setEditingExpense(null);
            setIsAddModalOpen(true);
          }}
        />

      </main>

      {/* 6. Mobile 1-Tap Floating Add Button (Hides when any modal is open) */}
      <FloatingAddButton
        activeTab={activeTab}
        visible={!isAddModalOpen && !isEditBudgetOpen && !isEditEngineerOpen}
        onClick={() => {
          setEditingExpense(null);
          setIsAddModalOpen(true);
        }}
      />

      {/* 7. Quick Add / Edit Modal */}
      {isAddModalOpen && (
        <SimpleAddModal
          initialProjectId={activeTab === 'construction' ? constructionProject.id : marriageProject.id}
          marriageProject={marriageProject}
          constructionProject={constructionProject}
          currentMarriageBalance={marriageBudget - marriageSpent}
          currentConstructionBalance={constructionBudget - constructionSpent}
          editingExpense={editingExpense}
          currency={currency}
          onSave={handleSaveExpense}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingExpense(null);
          }}
        />
      )}

      {/* 8. Budget Adjuster Modal (Contextual to active tab & Overview auto-sum) */}
      {isEditBudgetOpen && (
        <EditBudgetModal
          initialTab={activeTab}
          marriageBudget={marriageBudget}
          constructionBudget={constructionBudget}
          currency={currency}
          sqftArea={constructionProject.sqftArea}
          ratePerSqft={constructionProject.ratePerSqft}
          engineerName={constructionProject.engineerName}
          onSave={handleUpdateBudget}
          onClose={() => setIsEditBudgetOpen(false)}
        />
      )}

      {/* 9. Dedicated Edit Engineer Modal (Only available in Construction) */}
      {isEditEngineerOpen && (
        <EditEngineerModal
          engineerName={constructionProject.engineerName}
          engineerPhone={constructionProject.engineerPhone}
          sqftArea={constructionProject.sqftArea}
          ratePerSqft={constructionProject.ratePerSqft}
          constructionScope={constructionProject.constructionScope}
          currency={currency}
          onSave={handleUpdateEngineer}
          onClose={() => setIsEditEngineerOpen(false)}
        />
      )}

    </div>
  );
};

export default App;
