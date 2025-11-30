import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  
  // 选中状态：用于移动端(Android/iOS)显示菜单
  const [isActive, setIsActive] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null); 

  const noteStyle = getStickyStyle(task.color);

  // 点击外部处理：取消选中，关闭颜色选择器
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
        setIsActive(false);
      }
    };

    if (showColorPicker || isActive) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside); 
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showColorPicker, isActive]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
    }
  }, [isEditing]);

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isExiting || isEditing || isDeleting || showColorPicker || isSortingModeActive) return;
    
    // 性能优化：先触发状态改变，稍微延后回调，保证动画流畅
    setIsExiting(true);
    
    // 稍微缩短延时，让烟花出来的更及时
    setTimeout(() => {
      onComplete(task.id);
    }, 150);
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

  const stopProp = (e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
    e.stopPropagation();
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

  const handleEditMode = () => {
    if (!isZenMode && !isSortingModeActive) {
      setIsEditing(true);
      setShowColorPicker(false);
      setIsActive(false); 
    }
  };

  // 点击卡片本体：切换选中状态
  const handleCardClick = (e: React.MouseEvent) => {
    if (isEditing) return;
    setIsActive(!isActive);
  };

  const fontSizeClass = useMemo(() => {
    const length = task.text.length;
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
  }, [task.text.length, isZenMode, densityLevel]);

  const isDense = densityLevel >= 2; 
  const isSmallest = densityLevel === 2;

  const btnSize = isSmallest ? 'w-4 h-4 md:w-6 md:h-6' : 'w-5 h-5 md:w-7 md:h-7';
  const iconSize = isSmallest ? 10 : 13;
  const posTopLeft = isSmallest ? 'top-0.5 left-0.5 md:top-2 md:left-2' : 'top-1.5 left-1.5 md:top-2 md:left-2';
  const posTopRight = isSmallest ? 'top-0.5 right-0.5 md:top-2 md:right-2' : 'top-1.5 right-1.5 md:top-2 md:right-2';
  const posBottomRight = isSmallest ? 'bottom-0.5 right-0.5 md:bottom-2 md:right-2' : 'bottom-1.5 right-1.5 md:bottom-2 md:right-2';

  const sortingStyles = isSorting 
     ? 'ring-4 ring-blue-500 scale-[1.02] z-50 shadow-2xl !opacity-100' 
     : isSortingModeActive 
        ? 'opacity-40 scale-95 blur-[1px]' 
        : '';

  const controlBtnClass = `rounded-full hover:bg-black/10 text-gray-700 transition-colors flex items-center justify-center ${btnSize}`;

  const controlsVisibilityClass = isActive 
    ? 'opacity-100 pointer-events-auto' 
    : 'opacity-0 md:group-hover:opacity-100 pointer-events-none md:group-hover:pointer-events-auto';

  // 核心修复：更高效的退出动画
  // 1. 移除 animate-ping (这在安卓上是性能杀手)
  // 2. 使用 scale-75 opacity-0 进行简单的缩小淡出
  // 3. 添加 will-change-transform 和 transform-gpu 强制 GPU 渲染
  const exitStyles = isExiting || isDeleting 
    ? 'opacity-0 scale-75 pointer-events-none duration-200 ease-in' 
    : 'opacity-100 hover:scale-[1.05] hover:z-30 duration-300';

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()} 
      onClick={handleCardClick}
      className={`
        relative group aspect-square w-full flex flex-col items-center justify-center 
        transform paper-texture select-none
        touch-manipulation
        /* 强制开启 GPU 加速，解决安卓掉帧 */
        will-change-transform transform-gpu
        transition-all
        ${exitStyles}
        ${className}
        ${!isZenMode && !isEditing ? 'cursor-pointer active:scale-95' : 'cursor-default'}
        ${isZenMode ? 'p-8' : isDense ? 'p-1' : 'p-2 md:p-6'}
        shadow-[2px_4px_12px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.05)]
        ${sortingStyles}
        ${isActive ? 'z-40 scale-[1.02]' : ''} 
      `}
      style={{ 
        backgroundColor: noteStyle.bg,
        transform: !isZenMode && !isSorting ? `rotate(${task.rotation}deg)` : 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      
      {isZenMode && onClose && (
        <button
          onClick={(e) => { stopProp(e); onClose(); }}
          className="absolute top-2 right-2 p-2 rounded-full bg-black/10 hover:bg-black/20 text-gray-800 transition-colors z-50"
          title="退出专注"
        >
          <X size={24} />
        </button>
      )}

      {/* Controls Area */}
      {!isZenMode && !isExiting && !isEditing && !isDeleting && !isSortingModeActive && (
        <>
          <button
            onClick={handleDelete}
            className={`
              absolute z-40 rounded-full bg-red-500/10 hover:bg-red-500/80 text-red-600/60 hover:text-white 
              transition-all duration-200 flex items-center justify-center
              ${controlsVisibilityClass}
              ${posTopLeft} ${btnSize} p-0
            `}
            title="永久删除"
            onPointerDown={stopProp} onTouchStart={stopProp}
          >
            <Trash2 size={iconSize} strokeWidth={2.5} />
          </button>

          <button
            onClick={(e) => { stopProp(e); onSort && onSort(task.id); }}
            className={`
              absolute z-40 rounded-full bg-black/5 hover:bg-black/15 text-gray-700 
              transition-colors flex items-center justify-center
              ${controlsVisibilityClass}
              ${posTopRight} ${btnSize}
            `}
            title="排序/移动"
            onPointerDown={stopProp} onTouchStart={stopProp}
          >
            <ArrowLeftRight size={iconSize} />
          </button>
          
          <div 
             className={`
               absolute z-40 flex items-center justify-center transition-all duration-200
               bg-white/40 backdrop-blur-[2px] rounded-full shadow-sm border border-white/20
               ${controlsVisibilityClass}
               ${isSmallest ? 'p-0 gap-0' : 'p-0.5 gap-0.5'}
               ${posBottomRight}
             `}
             onClick={stopProp} onPointerDown={stopProp} onTouchStart={stopProp}
          >
             <button onClick={(e) => { stopProp(e); setShowColorPicker(!showColorPicker); }} className={controlBtnClass} title="颜色">
              <Palette size={iconSize} />
            </button>
            <button onClick={(e) => { stopProp(e); handleEditMode(); }} className={controlBtnClass} title="编辑">
              <Pencil size={iconSize} />
            </button>
            <button onClick={(e) => { stopProp(e); onFocus && onFocus(); }} className={controlBtnClass} title="专注">
              <Eye size={iconSize} />
            </button>
          </div>
          
          {showColorPicker && (
             <div 
                ref={colorPickerRef}
                className="absolute bottom-10 right-0 bg-white p-2 rounded-xl shadow-xl z-[60] animate-fade-in-up border border-gray-100 mb-1 grid grid-cols-5 gap-1.5 w-max"
                onMouseDown={stopProp} onTouchStart={stopProp} onClick={stopProp}
             >
                {STYLE_KEYS.map(key => (
                    <button 
                        key={key} 
                        onClick={(e) => { stopProp(e); if(onColorChange) onColorChange(task.id, key); setShowColorPicker(false); }}
                        className="w-5 h-5 md:w-6 md:h-6 rounded-full border border-gray-200 hover:scale-110 transition-transform relative overflow-hidden"
                        style={{ backgroundColor: getStickyStyle(key).bg }}
                        title={getStickyStyle(key).name}
                    />
                ))}
             </div>
          )}
        </>
      )}

      {/* Content Area */}
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={handleKeyDown}
          className="w-full h-full bg-transparent resize-none outline-none text-[#333] font-bold text-center handwritten z-30 placeholder-gray-500"
          style={{ fontSize: isDense ? '0.7rem' : '1.2rem' }}
          onClick={stopProp}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center overflow-hidden pb-4 pointer-events-none">
          <p className={`
            text-[#333] text-center handwritten break-words w-full px-1
            drop-shadow-[0_1px_0px_rgba(255,255,255,0.4)]
            max-h-full overflow-y-auto no-scrollbar
            ${fontSizeClass}
          `}>
            {task.text}
          </p>
        </div>
      )}

      {/* Completion Button */}
      {!isEditing && !showColorPicker && !isSortingModeActive && (
        <div 
            className={`
              absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 
              transition-opacity duration-200 pointer-events-none
              ${isActive ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'}
            `}
        >
          <button
            onClick={handleComplete}
            className={`
              transform hover:scale-110 active:scale-95 transition-transform duration-200 cursor-pointer
              ${isActive ? 'pointer-events-auto' : 'pointer-events-none md:group-hover:pointer-events-auto'}
            `}
            title="完成"
          >
            <div className={`
                bg-emerald-500/20 rounded-full shadow-sm backdrop-blur-[1px] border border-emerald-500/30 
                flex items-center justify-center
                ${isDense ? 'p-1' : 'p-2 md:p-3'} 
            `}>
               <Check 
                 className={`text-emerald-700/90 drop-shadow-sm ${isDense ? 'w-4 h-4' : 'w-8 h-8 md:w-9 md:h-9'}`} 
                 strokeWidth={3} 
               />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};