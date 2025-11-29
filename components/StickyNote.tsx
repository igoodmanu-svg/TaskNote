
import React, { useState, useRef, useEffect } from 'react';
import { Task, COLOR_ARRAY } from '../types';
import { Check, Eye, Pencil, X, Trash2, Palette } from 'lucide-react';

interface StickyNoteProps {
  task: Task;
  index?: number;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onFocus?: () => void;
  onEdit?: (id: string, newText: string) => void;
  onColorChange?: (id: string, newColor: string) => void;
  onClose?: () => void;
  className?: string;
  isZenMode?: boolean;
  densityLevel?: number;
  onDragStart?: (index: number) => void;
  onDragEnter?: (index: number) => void;
  onDragEnd?: () => void;
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
  className = '', 
  isZenMode = false,
  densityLevel = 1,
  onDragStart,
  onDragEnter,
  onDragEnd
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showColorPicker && colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    };

    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside); // Support mobile touch
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
    if (isExiting || isEditing || isDeleting || showColorPicker) return;
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

  const changeColor = (color: string) => {
      if (onColorChange) {
          onColorChange(task.id, color);
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
       if (length > 20) return 'text-[10px] leading-tight font-bold'; // Force bold even on small
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
  const isDense = densityLevel >= 2; // Compact mode (Smallest)
  
  // --- RESPONSIVE BUTTON SIZING LOGIC ---
  
  // Check if we are in the smallest mode (High Density)
  const isSmallest = densityLevel === 2;

  // Button Size:
  // Smallest Mode: 16px (w-4 h-4) on mobile to fit 4 columns
  // Normal Modes: 20px (w-5 h-5) on mobile
  // Desktop: Larger sizes
  const btnSize = isSmallest ? 'w-4 h-4 md:w-6 md:h-6' : 'w-5 h-5 md:w-7 md:h-7';
  
  // Icon Size:
  const iconSize = isSmallest ? 10 : 13;
  
  // Positioning & Spacing:
  // Smallest Mode: Push closer to edge (0.5 = 2px), remove gap (gap-0)
  const posTopLeft = isSmallest 
    ? 'top-0.5 left-0.5 md:top-2 md:left-2' 
    : 'top-1.5 left-1.5 md:top-2 md:left-2';
    
  const posTopRight = isSmallest 
    ? 'top-0.5 right-0.5 gap-0 md:top-2 md:right-2 md:gap-1' 
    : 'top-1.5 right-1.5 gap-0.5 md:top-2 md:right-2 md:gap-1';

  // Drag handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (isZenMode || isEditing) {
        e.preventDefault();
        return;
    }
    if (onDragStart && typeof index === 'number') {
        onDragStart(index);
        e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    if (isZenMode || isEditing) return;
    e.preventDefault();
    if (onDragEnter && typeof index === 'number') {
        onDragEnter(index);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (isZenMode) return;
    e.preventDefault();
  };

  return (
    <div
      draggable={!isZenMode && !isEditing}
      onDragStart={handleDragStart}
      onDragEnter={handleDragEnter}
      onDragEnd={onDragEnd}
      onDragOver={handleDragOver}
      className={`
        relative group aspect-square w-full flex flex-col items-center justify-center 
        transition-all duration-300 transform paper-texture
        ${isExiting || isDeleting ? 'animate-ping opacity-0' : 'opacity-100 hover:scale-[1.05] hover:z-30'}
        ${className}
        ${!isZenMode && !isEditing ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}
        ${isZenMode ? 'p-8' : isDense ? 'p-1' : 'p-2 md:p-6'}
        border-t border-white/60 border-b-2 border-b-black/5
        shadow-[2px_4px_12px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.05)]
      `}
      style={{ 
        backgroundColor: task.color,
        transform: !isZenMode ? `rotate(${task.rotation}deg)` : 'none',
      }}
      onClick={(e) => {
          // Do not close color picker here, let the document listener handle it
      }}
    >
      {!isZenMode && !isDense && (
         <div className={`absolute -top-2.5 sm:-top-3 left-1/2 -translate-x-1/2 bg-white/40 rotate-1 backdrop-blur-[1px] shadow-sm pointer-events-none z-10 w-8 sm:w-12 md:w-16 h-3 sm:h-4 md:h-5`}></div>
      )}

      {isZenMode && onClose && (
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 p-2 rounded-full bg-black/10 hover:bg-black/20 text-gray-800 transition-colors z-50"
          title="退出专注"
        >
          <X size={24} />
        </button>
      )}

      {/* Controls */}
      {!isZenMode && !isExiting && !isEditing && !isDeleting && (
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
          >
            <Trash2 size={iconSize} strokeWidth={2.5} />
          </button>

          {/* Top Right: Edit, Focus & Color - Fixed alignment */}
          <div className={`
             absolute z-50 flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100
             ${posTopRight}
          `}>
             <button
              onClick={handleColorClick}
              className={`rounded-full bg-black/5 hover:bg-black/15 text-gray-700 transition-colors relative flex items-center justify-center ${btnSize}`}
              title="颜色"
              onPointerDown={(e) => e.stopPropagation()} 
            >
              <Palette size={iconSize} />
            </button>
            <button
              onClick={handleEditClick}
              className={`rounded-full bg-black/5 hover:bg-black/15 text-gray-700 transition-colors flex items-center justify-center ${btnSize}`}
              title="编辑"
              onPointerDown={(e) => e.stopPropagation()} 
            >
              <Pencil size={iconSize} />
            </button>
            <button
              onClick={handleFocus}
              className={`rounded-full bg-black/5 hover:bg-black/15 text-gray-700 transition-colors flex items-center justify-center ${btnSize}`}
              title="专注"
              onPointerDown={(e) => e.stopPropagation()} 
            >
              <Eye size={iconSize} />
            </button>
          </div>
          
          {/* Color Picker Popover */}
          {showColorPicker && (
             <div 
                ref={colorPickerRef}
                className="absolute top-8 right-0 bg-white p-1.5 rounded-lg shadow-xl flex gap-1 z-[60] animate-fade-in-up border border-gray-100"
                onMouseDown={(e) => e.stopPropagation()} // Prevent closing immediately when clicking inside
             >
                {COLOR_ARRAY.map(c => (
                    <button 
                        key={c} 
                        onClick={(e) => { e.stopPropagation(); changeColor(c); }}
                        className="w-4 h-4 md:w-5 md:h-5 rounded-full border border-gray-200 hover:scale-110 transition-transform"
                        style={{ backgroundColor: c }}
                    />
                ))}
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
        <div className={`w-full h-full flex items-center justify-center overflow-hidden pointer-events-none`}>
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

      {!isEditing && !showColorPicker && (
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
