
import React, { useState, useRef, useEffect } from 'react';
import { Task, STYLE_KEYS, getStickyStyle } from '../types';
import { Check, Eye, Pencil, Trash2, Palette, ArrowLeftRight, X } from 'lucide-react';

interface StickyNoteProps {
  task: Task;
  index?: number;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onFocus?: () => void;
  onEdit?: (id: string, newText: string) => void;
  onColorChange?: (id: string, newColor: string) => void;
  onClose?: () => void;
  onSort?: (id: string) => void;
  className?: string;
  isZenMode?: boolean;
  densityLevel?: number;
  isSorting?: boolean;
  isSortingModeActive?: boolean;
}

export const StickyNote: React.FC<StickyNoteProps> = ({ 
  task, 
  index,
  onComplete, 
  onDelete,
  onFocus, 
  onEdit, 
  onColorChange,
  onClose,
  onSort,
  className = '', 
  isZenMode = false,
  densityLevel = 1,
  isSorting = false,
  isSortingModeActive = false,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  // Get the style object
  const noteStyle = getStickyStyle(task.color);

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showColorPicker && colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    };

    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside); 
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showColorPicker]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
    }
  }, [isEditing]);

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isExiting || isEditing || isDeleting || showColorPicker || isSortingModeActive) return;
    setIsExiting(true);
    setTimeout(() => {
      onComplete(task.id);
    }, 200);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('🗑️ 确认永久删除这张便签吗？\n\n(删除后无法在历史记录中找回)')) {
      setIsDeleting(true);
      setTimeout(() => {
        onDelete(task.id);
      }, 200);
    }
  };

  const handleFocus = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFocus && !isEditing) onFocus();
  };
  
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClose) onClose();
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setShowColorPicker(false);
  };
  
  const handleColorClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowColorPicker(!showColorPicker);
  };
  
  const handleSortClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onSort) onSort(task.id);
  };

  const changeColor = (styleKey: string) => {
      if (onColorChange) {
          onColorChange(task.id, styleKey);
      }
      setShowColorPicker(false);
  };

  const saveEdit = () => {
    setIsEditing(false);
    if (editText.trim() && onEdit) {
      onEdit(task.id, editText.trim());
    } else {
      setEditText(task.text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEdit();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText(task.text);
    }
  };

  const getFontSizeClass = (length: number) => {
    if (isZenMode) return 'text-2xl md:text-5xl font-bold';
    if (densityLevel === 2) {
       if (length > 20) return 'text-[10px] leading-tight font-bold'; 
       return 'text-xs font-bold leading-tight';
    }
    if (densityLevel === 1) {
       if (length > 40) return 'text-xs leading-tight font-bold';
       if (length > 15) return 'text-sm font-bold leading-tight';
       return 'text-base font-bold leading-tight';
    }
    if (length > 60) return 'text-sm sm:text-base leading-tight font-bold';
    if (length > 25) return 'text-base sm:text-xl leading-snug font-bold';
    return 'text-lg sm:text-2xl font-bold leading-tight';
  };

  const fontSizeClass = getFontSizeClass(task.text.length);
  const isDense = densityLevel >= 2; 
  const isSmallest = densityLevel === 2;

  const btnSize = isSmallest ? 'w-4 h-4 md:w-6 md:h-6' : 'w-5 h-5 md:w-7 md:h-7';
  const iconSize = isSmallest ? 10 : 13;
  
  // Position Logic
  const posTopLeft = isSmallest 
    ? 'top-0.5 left-0.5 md:top-2 md:left-2' 
    : 'top-1.5 left-1.5 md:top-2 md:left-2';

  const posTopRight = isSmallest 
    ? 'top-0.5 right-0.5 md:top-2 md:right-2' 
    : 'top-1.5 right-1.5 md:top-2 md:right-2';
    
  // Adjusted bottom right to be a bit further from edge to accommodate the new container
  const posBottomRight = isSmallest 
    ? 'bottom-0.5 right-0.5 md:bottom-2 md:right-2' 
    : 'bottom-1.5 right-1.5 md:bottom-2 md:right-2';

  // Highlight Styles for Sorting
  const sortingStyles = isSorting 
     ? 'ring-4 ring-blue-500 scale-[1.02] z-50 shadow-2xl !opacity-100' 
     : isSortingModeActive 
        ? 'opacity-40 scale-95 blur-[1px]' 
        : '';

  return (
    <div
      onContextMenu={(e) => e.preventDefault()} 
      className={`
        relative group aspect-square w-full flex flex-col items-center justify-center 
        transition-all duration-300 transform paper-texture select-none
        ${isExiting || isDeleting ? 'animate-ping opacity-0' : 'opacity-100 hover:scale-[1.05] hover:z-30'}
        ${className}
        ${!isZenMode && !isEditing ? 'cursor-default active:scale-95' : 'cursor-default'}
        ${isZenMode ? 'p-8' : isDense ? 'p-1' : 'p-2 md:p-6'}
        shadow-[2px_4px_12px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.05)]
        ${sortingStyles}
      `}
      style={{ 
        backgroundColor: noteStyle.bg,
        transform: !isZenMode && !isSorting ? `rotate(${task.rotation}deg)` : 'none',
      }}
      onClick={(e) => {
          // If in sorting mode but not the active sorting item, maybe switch sorting focus?
      }}
    >
      
      {isZenMode && onClose && (
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 p-2 rounded-full bg-black/10 hover:bg-black/20 text-gray-800 transition-colors z-50"
          title="退出专注"
        >
          <X size={24} />
        </button>
      )}

      {/* Controls - Hide during sorting to prevent distraction */}
      {!isZenMode && !isExiting && !isEditing && !isDeleting && !isSortingModeActive && (
        <>
          {/* Top Left: Delete Button */}
          <button
            onClick={handleDelete}
            className={`
              absolute z-50 rounded-full bg-red-500/10 hover:bg-red-500/80 text-red-600/60 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100 flex items-center justify-center
              ${posTopLeft} ${btnSize} p-0
            `}
            title="永久删除"
            onPointerDown={(e) => e.stopPropagation()} 
            onTouchStart={(e) => e.stopPropagation()}
          >
            <Trash2 size={iconSize} strokeWidth={2.5} />
          </button>

          {/* Top Right: Sort Button */}
          <button
            onClick={handleSortClick}
            className={`
              absolute z-50 rounded-full bg-black/5 hover:bg-black/15 text-gray-700 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100
              ${posTopRight} ${btnSize}
            `}
            title="排序/移动"
            onPointerDown={(e) => e.stopPropagation()} 
            onTouchStart={(e) => e.stopPropagation()}
          >
            <ArrowLeftRight size={iconSize} />
          </button>
          
          {/* Bottom Right: Color, Edit, Focus - WRAPPED IN CONTAINER TO PREVENT MISCLICKS */}
          <div 
             className={`
               absolute z-50 flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100
               bg-white/40 backdrop-blur-[2px] rounded-full shadow-sm border border-white/20
               ${isSmallest ? 'p-0 gap-0' : 'p-0.5 gap-0.5'}
               ${posBottomRight}
             `}
             onClick={(e) => e.stopPropagation()} // STOP PROPAGATION HERE: Clicking the gap won't complete task
             onPointerDown={(e) => e.stopPropagation()}
             onTouchStart={(e) => e.stopPropagation()}
          >
             <button
              onClick={handleColorClick}
              className={`rounded-full hover:bg-black/10 text-gray-700 transition-colors relative flex items-center justify-center ${btnSize}`}
              title="颜色"
            >
              <Palette size={iconSize} />
            </button>
            <button
              onClick={handleEditClick}
              className={`rounded-full hover:bg-black/10 text-gray-700 transition-colors flex items-center justify-center ${btnSize}`}
              title="编辑"
            >
              <Pencil size={iconSize} />
            </button>
            <button
              onClick={handleFocus}
              className={`rounded-full hover:bg-black/10 text-gray-700 transition-colors flex items-center justify-center ${btnSize}`}
              title="专注"
            >
              <Eye size={iconSize} />
            </button>
          </div>
          
          {/* Color Picker Popover */}
          {showColorPicker && (
             <div 
                ref={colorPickerRef}
                className="absolute bottom-10 right-0 bg-white p-2 rounded-xl shadow-xl z-[60] animate-fade-in-up border border-gray-100 mb-1 grid grid-cols-5 gap-1.5 w-max"
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
             >
                {STYLE_KEYS.map(key => {
                    const style = getStickyStyle(key);
                    return (
                        <button 
                            key={key} 
                            onClick={(e) => { e.stopPropagation(); changeColor(key); }}
                            className="w-5 h-5 md:w-6 md:h-6 rounded-full border border-gray-200 hover:scale-110 transition-transform relative overflow-hidden"
                            style={{ 
                                backgroundColor: style.bg
                            }}
                            title={style.name}
                        />
                    );
                })}
             </div>
          )}
        </>
      )}

      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={handleKeyDown}
          className="w-full h-full bg-transparent resize-none outline-none text-[#333] font-bold text-center handwritten z-30 placeholder-gray-500"
          style={{ fontSize: isDense ? '0.7rem' : '1.2rem' }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div className={`w-full h-full flex items-center justify-center overflow-hidden pointer-events-none pb-4`}>
          <p className={`
            text-[#333] text-center handwritten break-words w-full select-none px-1
            drop-shadow-[0_1px_0px_rgba(255,255,255,0.4)]
            max-h-full overflow-y-auto no-scrollbar
            ${fontSizeClass}
          `}>
            {task.text}
          </p>
        </div>
      )}

      {/* Completion Overlay - Disabled during sorting */}
      {!isEditing && !showColorPicker && !isSortingModeActive && (
        <button
          onClick={handleComplete}
          className="absolute inset-0 bg-transparent opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center cursor-pointer z-20 active:opacity-100"
          title="完成"
        >
          <div className={`bg-emerald-500/20 rounded-full shadow-sm transform scale-90 group-hover:scale-100 transition-transform duration-200 backdrop-blur-[1px] border border-emerald-500/30 ${isDense ? 'p-1' : 'p-2 md:p-4'}`}>
             <Check className={`text-emerald-700/90 drop-shadow-sm ${isDense ? 'w-4 h-4' : 'w-8 h-8 md:w-10 md:h-10'}`} strokeWidth={3} />
          </div>
        </button>
      )}
    </div>
  );
};
