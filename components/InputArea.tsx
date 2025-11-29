
import React, { useState, useRef } from 'react';
import { Plus, Shuffle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { COLOR_ARRAY } from '../types';

interface InputAreaProps {
  onAdd: (text: string, color: string | null) => void;
  isDark?: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onAdd, isDark = false }) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputValue.trim()) {
      onAdd(inputValue.trim(), selectedColor);
      setInputValue('');
      inputRef.current?.blur();
      // Don't auto-collapse, allow continuous entry
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };
  
  const handleContainerClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isCollapsed) {
        inputRef.current?.focus();
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const containerBg = isDark ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-white/40';
  const inputBg = isDark ? 'bg-gray-800 text-white placeholder-gray-500 border-gray-700' : 'bg-gray-50 text-gray-800 placeholder-gray-400 border-gray-200';

  return (
    <div 
        className={`fixed left-0 right-0 z-[100] flex flex-col items-center transition-all duration-300 ease-in-out`}
        style={{ bottom: isCollapsed ? '-170px' : '0' }}
    >
      {/* Light Gradient Mask - Only show when expanded and in light mode */}
      {!isDark && !isCollapsed && (
         <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-white/90 via-white/60 to-transparent -z-10 pointer-events-none touch-none"></div>
      )}

      {/* Collapse Toggle Button */}
      <button 
        onClick={toggleCollapse}
        className={`
            relative z-20 flex items-center justify-center w-12 h-8 rounded-t-xl 
            shadow-[0_-4px_10px_rgba(0,0,0,0.05)] border-t border-x -mb-px
            ${isDark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white/90 border-white/40 text-gray-500'}
            hover:scale-105 transition-transform
        `}
      >
        {isCollapsed ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {/* Main Container */}
      <div 
        onClick={handleContainerClick}
        className={`w-full backdrop-blur-xl border-t shadow-[0_-4px_30px_rgba(0,0,0,0.1)] rounded-t-3xl pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6 transition-colors duration-300 ${containerBg}`}
      >
        <div className="max-w-2xl mx-auto px-4 flex flex-col gap-4">
          
          {/* Color Selection Row */}
          <div className="flex items-center justify-center gap-4 overflow-x-auto py-1 no-scrollbar touch-pan-x min-h-[48px]">
             <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onTouchStart={(e) => e.preventDefault()}
              onClick={() => setSelectedColor(null)}
              className={`
                w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 flex-shrink-0
                bg-gradient-to-br from-pink-200 via-blue-200 to-green-200
                ${selectedColor === null ? 'border-gray-400 scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}
              `}
              title="随机颜色"
            >
              {selectedColor === null && <Shuffle size={16} className="text-gray-700" />}
            </button>
            
            {COLOR_ARRAY.map((color) => (
              <button
                key={color}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onTouchStart={(e) => e.preventDefault()}
                onClick={() => setSelectedColor(color)}
                className={`
                  w-10 h-10 rounded-full border-2 transition-all duration-200 flex-shrink-0 shadow-sm
                  ${selectedColor === color ? 'border-gray-400 scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}
                `}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          {/* Input Row */}
          <form onSubmit={handleSubmit} className="flex gap-3 items-center">
            <div className="relative flex-1 group">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="下一步做什么？"
                className={`w-full text-lg px-5 py-4 rounded-2xl outline-none focus:bg-opacity-100 transition-all shadow-inner font-bold tracking-wide border ${inputBg}`}
                style={{ fontSize: '16px', touchAction: 'manipulation' }}
              />
              {inputValue && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onTouchStart={(e) => e.preventDefault()}
                  onClick={(e) => { 
                      e.stopPropagation();
                      setInputValue(''); 
                      inputRef.current?.focus(); 
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1.5 rounded-full bg-black/5 hover:bg-black/10 transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="bg-gray-800 text-white w-16 h-[60px] rounded-2xl flex items-center justify-center hover:bg-black active:scale-95 transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              <Plus size={32} strokeWidth={3} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
