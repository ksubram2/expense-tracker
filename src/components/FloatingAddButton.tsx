import React from 'react';
import { Plus } from 'lucide-react';
import { MainTabType } from './SimpleTabNav';

interface FloatingAddButtonProps {
  activeTab: MainTabType;
  visible?: boolean;
  onClick: () => void;
}

export const FloatingAddButton: React.FC<FloatingAddButtonProps> = ({
  activeTab,
  visible = true,
  onClick,
}) => {
  if (!visible) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full bg-slate-900 text-white shadow-lg flex items-center justify-center transition-all transform active:scale-90 hover:bg-slate-800 border border-slate-700/50"
      title="Add Spend Entry"
    >
      <Plus className="w-6 h-6" />
    </button>
  );
};
