
import React, { useRef } from 'react';
import { Download, Upload, X, Settings, Palette } from 'lucide-react';
import { THEMES, ThemeKey } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
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

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-sm bg-[#3A3A3A] rounded-xl shadow-2xl border border-gray-700 p-6 animate-fade-in-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="text-gray-400" />
            设置与管理
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          
          {/* Theme Selection */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-gray-300 text-sm font-bold">
              <Palette size={16} />
              <span>主题背景</span>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {(Object.keys(THEMES) as ThemeKey[]).map((themeKey) => (
                <button
                  key={themeKey}
                  onClick={() => onThemeChange(themeKey)}
                  className={`
                    w-10 h-10 rounded-full border-2 transition-all shadow-md
                    ${currentTheme === themeKey ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'}
                  `}
                  style={{ backgroundColor: THEMES[themeKey] }}
                  title={themeKey}
                />
              ))}
            </div>
          </div>

          <div className="h-px bg-gray-600/50"></div>

          {/* Data Management */}
          <div className="space-y-3">
             <button 
              onClick={onExport}
              className="w-full bg-black/20 hover:bg-black/40 text-gray-200 p-3 rounded-xl flex items-center justify-between group transition-all border border-gray-600 hover:border-gray-500"
            >
              <div className="flex flex-col items-start">
                <span className="font-bold">导出备份</span>
              </div>
              <Download className="text-blue-400" size={20} />
            </button>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-black/20 hover:bg-black/40 text-gray-200 p-3 rounded-xl flex items-center justify-between group transition-all border border-gray-600 hover:border-gray-500"
            >
              <div className="flex flex-col items-start">
                <span className="font-bold">导入备份</span>
              </div>
              <Upload className="text-green-400" size={20} />
            </button>
          </div>

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
