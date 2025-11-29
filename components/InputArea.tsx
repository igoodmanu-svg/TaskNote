
import React, { useState, useRef } from 'react';
import { Plus, Shuffle, X, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { STYLE_KEYS, getStickyStyle } from '../types';

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
    // Only focus if clicking the main area and NOT the toggle button or collapsed state
    if (!isCollapsed && e.target === e.currentTarget) {
        inputRef.current?.focus();
    }
  };

  const toggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering container click
    setIsCollapsed(!isCollapsed);
  };

  // Modern Glassmorphism Styles
  const containerBg = isDark 
    ? 'bg-gray-900/90 border-gray-700/50' 
    : 'bg-white/80 border-white/60';
    
  const backdropBlur = 'backdrop-blur-xl saturate-150';

  const inputStyles = isDark 
    ? 'bg-gray-800/50 text-white placeholder-gray-500 border-gray-700/50 focus:ring-blue-500/50' 
    : 'bg-white/60 text-gray-800 placeholder-gray-400 border-gray-200/50 focus:bg-white focus:ring-blue-300/50';

  // Calculate position for collapse animation
  // Using bottom positioning instead of transform to prevent iOS cursor floating bugs
  const bottomStyle = isCollapsed 
    ? 'calc(-100% + 3rem + env(safe-area-inset-bottom))' 
    : '0';

  return (
    <>
      {/* Toggle Button (Floating Pill) */}
      <div 
        className="fixed left-0 right-0 z-[101] flex justify-center transition-all duration-300 ease-in-out pointer-events-none"
        style={{ 
            bottom: isCollapsed ? 'calc(1.5rem + env(safe-area-inset-bottom))' : 'calc(100% - 3rem)', 
            // This logic is tricky with the new bottom positioning, so we attach it to the main container logic visualy
            // Actually, let's put it inside the container but absolutely positioned to float top
        }}
      >
      </div>

      <div 
        className={`fixed left-0 right-0 z-[100] transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] flex flex-col shadow-[0_-8px_30px_rgba(0,0,0,0.08)] border-t ${containerBg} ${backdropBlur}`}
        style={{ bottom: isCollapsed ? '-140px' : '0' }} // Simple collapse logic based on approx height
        onClick={handleContainerClick}
      >
        {/* Floating Toggle Pill */}
        <div className="absolute -top-5 left-0 right-0 flex justify-center pointer-events-none">
            <button 
                onClick={toggleCollapse}
                className={`
                    pointer-events-auto
                    flex items-center justify-center gap-1 px-4 py-1.5 rounded-full
                    shadow-md border backdrop-blur-md transition-all active:scale-95
                    ${isDark ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-white border-gray-100 text-gray-500 hover:text-gray-700'}
                `}
            >
                {isCollapsed ? (
                    <>
                        <ChevronUp size={16} />
                        <span className="text-xs font-bold">展开输入</span>
                    </>
                ) : (
                    <ChevronDown size={20} />
                )}
            </button>
        </div>

        <div className={`w-full pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-5`}>
          <div className="max-w-2xl mx-auto px-4 flex flex-col gap-4">
            
            {/* Color Selection Row (Scrollable) */}
            <div className="flex items-center justify-center gap-3 overflow-x-auto py-2 no-scrollbar touch-pan-x px-2">
               {/* Random Button */}
               <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onTouchStart={(e) => e.preventDefault()}
                onClick={() => setSelectedColor(null)}
                className={`
                  w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 flex-shrink-0
                  bg-gradient-to-tr from-pink-300 via-purple-300 to-indigo-300 text-white
                  ${selectedColor === null 
                    ? 'border-gray-400 scale-110 shadow-lg ring-2 ring-offset-2 ring-gray-200' 
                    : 'border-transparent opacity-80 hover:opacity-100 hover:scale-105'}
                `}
                title="随机颜色"
              >
                {selectedColor === null ? <Check size={18} strokeWidth={3} /> : <Shuffle size={16} />}
              </button>
              
              <div className="w-px h-6 bg-gray-300/50 mx-1"></div>
              
              {/* Color Circles */}
              {STYLE_KEYS.map((key) => {
                const style = getStickyStyle(key);
                const isSelected = selectedColor === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onTouchStart={(e) => e.preventDefault()}
                    onClick={() => setSelectedColor(key)}
                    className={`
                      w-9 h-9 md:w-10 md:h-10 rounded-full border border-black/5 transition-all duration-300 flex-shrink-0 relative overflow-hidden group
                      ${isSelected 
                        ? 'scale-110 shadow-md ring-2 ring-offset-2 ring-blue-300/80 z-10' 
                        : 'hover:scale-105 hover:shadow-sm opacity-90'}
                    `}
                    style={{ 
                      backgroundColor: style.bg
                    }}
                    title={style.name}
                  >
                    {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center animate-fade-in-up">
                            <div className="w-2 h-2 bg-gray-800/20 rounded-full"></div>
                        </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Input Row */}
            <form onSubmit={handleSubmit} className="flex gap-3 items-center relative">
              <div className="relative flex-1 group">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="下一步做什么？"
                  className={`
                    w-full text-lg px-6 py-4 rounded-full outline-none transition-all 
                    shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)] 
                    focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.02),0_4px_12px_rgba(0,0,0,0.05)]
                    font-bold tracking-wide border ${inputStyles}
                  `}
                  style={{ fontSize: '16px', touchAction: 'manipulation' }}
                />
                
                {/* Clear Button */}
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
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-black/5 transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              
              {/* Add Button */}
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className={`
                    w-14 h-14 md:w-16 md:h-[60px] rounded-full flex items-center justify-center 
                    transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95
                    disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:active:scale-100
                    ${isDark 
                        ? 'bg-gradient-to-br from-gray-700 to-gray-900 text-white' 
                        : 'bg-gradient-to-br from-gray-800 to-black text-white'}
                `}
              >
                <Plus size={28} strokeWidth={3} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
