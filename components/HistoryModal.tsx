import React from 'react';
import { Task } from '../types';
import { X, Clock, CheckCircle2, RotateCcw } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedTasks: Task[];
  onRestore?: (id: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, completedTasks, onRestore }) => {
  if (!isOpen) return null;

  // Sort tasks: latest completed first
  const sortedTasks = [...completedTasks].sort((a, b) => {
    return (b.completedAt || 0) - (a.completedAt || 0);
  });

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-[#3A3A3A] rounded-xl shadow-2xl border border-gray-700 max-h-[80vh] flex flex-col animate-fade-in-up">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="text-green-400" />
            已完成清单
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {sortedTasks.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p>还没有完成任何任务...</p>
              <p className="text-sm mt-2">快去消灭便利贴吧！</p>
            </div>
          ) : (
            sortedTasks.map((task) => (
              <div 
                key={task.id} 
                className="flex items-center gap-3 bg-[#2C2C2C] p-3 rounded-lg border-l-4 group"
                style={{ borderLeftColor: task.color }}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-gray-200 line-through opacity-70 font-medium truncate whitespace-nowrap" title={task.text}>
                    {task.text}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 whitespace-nowrap">
                    <Clock size={10} />
                    {task.completedAt 
                      ? new Date(task.completedAt).toLocaleString('zh-CN', { 
                          hour: '2-digit', 
                          minute: '2-digit', 
                          month: 'numeric', 
                          day: 'numeric' 
                        }) 
                      : 'Unknown'}
                  </p>
                </div>
                
                {onRestore && (
                  <button
                    onClick={() => onRestore(task.id)}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full text-gray-400 hover:text-green-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                    title="撤回任务"
                  >
                    <RotateCcw size={16} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};