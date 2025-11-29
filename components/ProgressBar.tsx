
import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

interface ProgressBarProps {
  activeCount: number;
  completedCount: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ activeCount, completedCount }) => {
  return (
    <div className="w-full max-w-2xl mx-auto mb-6 px-4 md:px-0">
      {/* Stats Blocks */}
      <div className="flex gap-4">
        {/* Completed Block - Light Green */}
        <div className="flex-1 bg-green-50 border border-green-100 rounded-2xl p-3 md:p-4 flex flex-col items-center justify-center relative overflow-hidden group shadow-sm">
           <div className="flex items-center gap-2 text-green-700 mb-1 z-10">
             <CheckCircle2 size={18} />
             <span className="font-bold opacity-90 text-sm md:text-base">今日已办</span>
           </div>
           <span className="font-black text-3xl md:text-5xl text-green-800 z-10 group-hover:scale-110 transition-transform duration-300">
             {completedCount}
           </span>
           {/* Background Deco */}
           <div className="absolute -bottom-4 -right-4 text-green-200 rotate-[-15deg] opacity-50">
              <CheckCircle2 size={60} />
           </div>
        </div>

        {/* Remaining Block - White */}
        <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-3 md:p-4 flex flex-col items-center justify-center relative overflow-hidden group shadow-sm">
           <div className="flex items-center gap-2 text-gray-500 mb-1 z-10">
             <Circle size={18} />
             <span className="font-bold opacity-90 text-sm md:text-base">剩余待办</span>
           </div>
           <span className="font-black text-3xl md:text-5xl text-gray-800 z-10 group-hover:scale-110 transition-transform duration-300">
             {activeCount}
           </span>
           {/* Background Deco */}
           <div className="absolute -bottom-4 -right-4 text-gray-100 rotate-[-15deg]">
              <Circle size={60} />
           </div>
        </div>
      </div>
    </div>
  );
};
