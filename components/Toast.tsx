
import React from 'react';
import { Undo2, Info } from 'lucide-react';

interface ToastProps {
  show: boolean;
  message?: string;
  onUndo?: () => void;
  showUndoButton?: boolean;
}

export const Toast: React.FC<ToastProps> = ({ show, message, onUndo, showUndoButton = false }) => {
  return (
    <div 
      className={`
        fixed top-[75%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60]
        bg-black/80 backdrop-blur-md px-5 py-3 rounded-full shadow-2xl border border-white/10
        flex items-center gap-3 transition-all duration-500 ease-out transform pointer-events-auto
        ${show ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4 pointer-events-none'}
      `}
    >
      {showUndoButton && onUndo ? (
        <button 
          onClick={onUndo}
          className="flex items-center gap-2 text-yellow-400 font-bold text-base tracking-wide hover:text-yellow-300 transition-colors active:scale-95"
        >
          <Undo2 size={18} strokeWidth={3} />
          <span>撤销</span>
        </button>
      ) : (
        <div className="flex items-center gap-2 text-white/90 font-medium text-sm">
           <Info size={16} className="text-blue-400" />
           <span>{message}</span>
        </div>
      )}
    </div>
  );
};
