import React, { useRef, useState } from 'react';
import { Download, Upload, X, Settings, Palette, FileJson, ToggleLeft, ToggleRight, AlertTriangle } from 'lucide-react';
import { THEMES, ThemeKey } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  // 修改：onImport 接收第二个参数 isMerge
  onImport: (file: File, isMerge: boolean) => void;
  currentTheme: ThemeKey;
  onThemeChange: (theme: ThemeKey) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  onExport, 
  onImport,
  currentTheme,
  onThemeChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 默认为合并模式，防止误删数据
  const [isMergeMode, setIsMergeMode] = useState(true);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 将文件和当前的模式状态一起传给父组件
      onImport(file, isMergeMode);
      e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-sm bg-[#3A3A3A] rounded-2xl shadow-2xl border border-gray-700 p-6 animate-fade-in-up flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="text-gray-400" />
            备份与同步
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-8 overflow-y-auto custom-scrollbar pr-1">
          
          {/* Theme Selection */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-gray-300 text-sm font-bold uppercase tracking-wider">
              <Palette size={14} />
              <span>主题风格</span>
            </div>
            <div className="grid grid-cols-6 gap-3">
              {(Object.keys(THEMES) as ThemeKey[]).map((themeKey) => (
                <button
                  key={themeKey}
                  onClick={() => onThemeChange(themeKey)}
                  className={`
                    w-full aspect-square rounded-xl border-2 transition-all duration-300 shadow-lg
                    ${currentTheme === themeKey 
                      ? 'border-white scale-110 ring-2 ring-white/20' 
                      : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'}
                  `}
                  style={{ backgroundColor: THEMES[themeKey] }}
                  title={themeKey}
                />
              ))}
            </div>
          </section>

          <div className="h-px bg-gray-700"></div>

          {/* Data Management */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2 text-gray-300 text-sm font-bold uppercase tracking-wider">
              <FileJson size={14} />
              <span>数据同步</span>
            </div>

            {/* Export Button */}
            <button 
              onClick={onExport}
              className="w-full bg-[#2C2C2C] hover:bg-[#333] active:bg-[#252525] text-gray-200 p-4 rounded-xl flex items-center justify-between group transition-all border border-gray-600 hover:border-gray-500"
            >
              <div className="flex flex-col items-start">
                <span className="font-bold">导出备份文件</span>
                <span className="text-xs text-gray-500 mt-1">保存当前所有数据为 JSON</span>
              </div>
              <Download className="text-blue-400 group-hover:scale-110 transition-transform" size={20} />
            </button>

            {/* Merge/Overwrite Toggle Switch */}
            <div 
              className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-gray-700/50 cursor-pointer select-none group transition-colors hover:border-gray-600"
              onClick={() => setIsMergeMode(!isMergeMode)}
            >
              <div className="flex flex-col">
                <span className={`text-sm font-medium transition-colors ${isMergeMode ? 'text-green-400' : 'text-red-400'}`}>
                  {isMergeMode ? '合并模式 (推荐)' : '覆盖模式 (慎用)'}
                </span>
                <span className="text-xs text-gray-500 mt-0.5">
                  {isMergeMode ? '保留现有任务，合并新数据' : '清空现有任务，完全替换'}
                </span>
              </div>
              {isMergeMode ? (
                <ToggleRight className="text-green-500 transition-transform group-active:scale-95" size={32} />
              ) : (
                <ToggleLeft className="text-gray-500 transition-transform group-active:scale-95" size={32} />
              )}
            </div>

            {/* Import Button */}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-[#2C2C2C] hover:bg-[#333] active:bg-[#252525] text-gray-200 p-4 rounded-xl flex items-center justify-between group transition-all border border-gray-600 hover:border-gray-500"
            >
              <div className="flex flex-col items-start">
                <span className="font-bold">导入备份文件</span>
                <span className="text-xs text-gray-500 mt-1">
                  {isMergeMode ? '从其他设备合并数据' : '恢复数据 (将会覆盖)'}
                </span>
              </div>
              <Upload className={`${isMergeMode ? 'text-green-400' : 'text-red-400'} group-hover:scale-110 transition-transform`} size={20} />
            </button>
            
            {!isMergeMode && (
              <div className="flex items-center gap-2 text-xs text-red-400/80 bg-red-900/10 p-2 rounded-lg border border-red-900/20">
                <AlertTriangle size={12} className="flex-shrink-0" />
                <span>警告：覆盖模式将永久删除当前设备上的所有数据。</span>
              </div>
            )}
          </section>
          
          {/* Hidden File Input */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json" 
            className="hidden" 
          />
        </div>
      </div>
    </div>
  );
};