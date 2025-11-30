import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { History, Volume2, VolumeX, CheckCheck, Settings, RotateCw, Grid, Square, Sparkles, Heart, Filter, LayoutGrid, ArrowUpToLine, ArrowDownToLine, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Task, getRandomColor, getRandomRotation, THEMES, ThemeKey, isDarkTheme, STYLE_KEYS, getStickyStyle } from './types';
import { InputArea } from './components/InputArea';
import { StickyNote } from './components/StickyNote';
import { HistoryModal } from './components/HistoryModal';
import { SettingsModal } from './components/SettingsModal';
import { Toast } from './components/Toast';
import { ProgressBar } from './components/ProgressBar';

const STORAGE_KEYS = {
  TASKS: 'adhd-notes-tasks-v2',
  TITLE: 'task-notes-app-title-v2',
  SOUND: 'adhd-notes-sound',
  VIEW_MODE: 'adhd-notes-view-density',
  THEME: 'adhd-notes-theme',
};

const INITIAL_TASKS_TEXT = [
  "去拿快递",
  "喝水",
  "不再内耗"
];

const SUCCESS_MESSAGES = [
  { emoji: "☕️", text: "今日任务清空，\n去享受生活吧！" },
  { emoji: "🌈", text: "干得漂亮，\n你可以休息啦！" },
  { emoji: "🎉", text: "效率爆表，\n给自己点个赞！" },
  { emoji: "🚀", text: "无敌寂寞，\n还有谁？！" },
  { emoji: "🧘", text: "心无挂碍，\n自在随风。" },
  { emoji: "🛌", text: "收工收工，\n回家躺平！" },
  { emoji: "⭐️", text: "今天也是\n闪闪发光的一天" },
  { emoji: "🎵", text: "听首歌，\n放松一下大脑" },
];

const ADHD_TIPS = [
  "💧 记得喝水，补充水分！",
  "💊 该吃药了吗？别忘了哦",
  "🧘 深呼吸，吸气...呼气...",
  "👀 眼睛累了吧？眺望一下远方",
  "🚶 坐太久了，起来走两步",
  "🍎 吃个水果，补充维C",
  "💪 保持背部挺直，别弯腰",
  "📵 放下手机，专注5分钟",
  "✨ 你已经做得很棒了！",
  "🧠 脑子乱？试着写下来",
  "⏰ 番茄钟开启，专注25分钟",
  "💤 今晚记得早点睡哦"
];

const App: React.FC = () => {
  // --- State Initialization ---
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const savedV2 = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (savedV2) return JSON.parse(savedV2);
      
      // Fallback / First Load
      return INITIAL_TASKS_TEXT.map(text => ({
        id: uuidv4(),
        text,
        color: getRandomColor(),
        createdAt: Date.now(),
        isCompleted: false,
        rotation: getRandomRotation()
      }));
    } catch (e) {
      return [];
    }
  });

  // Data Migration Logic (Run once)
  useEffect(() => {
     try {
         const savedV2 = localStorage.getItem(STORAGE_KEYS.TASKS);
         if (!savedV2 || JSON.parse(savedV2).length === 0) {
             const savedV1 = localStorage.getItem('adhd-notes-tasks');
             if (savedV1) {
                 const v1Data = JSON.parse(savedV1);
                 if (Array.isArray(v1Data) && v1Data.length > 0) {
                     setTasks(v1Data);
                 }
             }
         }
     } catch (e) { console.error("Migration error", e); }
  }, []);

  const [appTitle, setAppTitle] = useState(() => localStorage.getItem(STORAGE_KEYS.TITLE) || "任务便利贴");
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SOUND);
    return saved ? JSON.parse(saved) : true;
  });
  const [viewDensity, setViewDensity] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VIEW_MODE);
    return saved ? Number(saved) : 1;
  });
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return (saved as ThemeKey) || 'DEFAULT';
  });

  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [filterColor, setFilterColor] = useState<string | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  
  const [zenMode, setZenMode] = useState(false);
  const [zenTaskId, setZenTaskId] = useState<string | null>(null);
  const [sortingTaskId, setSortingTaskId] = useState<string | null>(null);

  const [successMsg, setSuccessMsg] = useState(SUCCESS_MESSAGES[0]);
  const [currentTip, setCurrentTip] = useState(ADHD_TIPS[0]);

  const [lastCompletedId, setLastCompletedId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showUndoInToast, setShowUndoInToast] = useState(false);
  
  const filterRef = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Derived State
  const activeTasks = useMemo(() => 
    tasks.filter(t => !t.isCompleted && (filterColor ? t.color === filterColor : true)), 
  [tasks, filterColor]);

  const completedTasks = useMemo(() => tasks.filter(t => t.isCompleted), [tasks]);
  const isDark = isDarkTheme(currentTheme);

  const todayCompletedCount = useMemo(() => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startTimestamp = startOfDay.getTime();
    return completedTasks.filter(t => t.completedAt && t.completedAt >= startTimestamp).length;
  }, [completedTasks]);

  // --- Effects for Persistence & Theme ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TITLE, appTitle);
    localStorage.setItem(STORAGE_KEYS.SOUND, JSON.stringify(soundEnabled));
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, JSON.stringify(viewDensity));
    localStorage.setItem(STORAGE_KEYS.THEME, currentTheme);
    
    // Apply theme
    document.body.style.backgroundColor = THEMES[currentTheme];
    document.documentElement.style.backgroundColor = THEMES[currentTheme];
  }, [appTitle, soundEnabled, viewDensity, currentTheme]);

  // Random Success Message
  useEffect(() => {
    if (activeTasks.length === 0 && !filterColor) {
      setSuccessMsg(SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)]);
    }
  }, [activeTasks.length, filterColor]);
  
  useEffect(() => {
    setCurrentTip(ADHD_TIPS[Math.floor(Math.random() * ADHD_TIPS.length)]);
  }, []);

  // Click Outside Filter
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (showFilterMenu && filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
    };
    if (showFilterMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showFilterMenu]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
          if (zenMode) exitZenMode();
          if (sortingTaskId) setSortingTaskId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zenMode, sortingTaskId]);

  // --- Audio Logic (Optimized) ---
  const initAudio = useCallback(() => {
    if (!soundEnabled) return;
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
  }, [soundEnabled]);

  useEffect(() => {
    // Initialize audio on first interaction to comply with browser policies
    const events = ['touchstart', 'click', 'keydown'];
    const handleInteraction = () => {
      initAudio();
      events.forEach(e => document.removeEventListener(e, handleInteraction));
    };
    events.forEach(e => document.addEventListener(e, handleInteraction, { passive: true }));
    return () => events.forEach(e => document.removeEventListener(e, handleInteraction));
  }, [initAudio]);

  const playSound = useCallback((type: 'complete' | 'add' | 'silent') => {
    if (!soundEnabled || !audioCtxRef.current) return;
    
    try {
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        if (type === 'silent') {
            gain.gain.setValueAtTime(0, now);
            osc.start(now);
            osc.stop(now + 0.01);
        } else if (type === 'complete') {
            osc.type = 'sine'; 
            osc.frequency.setValueAtTime(1568, now); 
            gain.gain.setValueAtTime(0.2, now); // Slightly lower volume
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
            osc.start(now);
            osc.stop(now + 1.2);
        } else if (type === 'add') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
            gain.gain.setValueAtTime(0.3, now); 
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.08);
        }
    } catch(e) {
        console.error("Audio error", e);
    }
  }, [soundEnabled]);

const triggerFeedback = useCallback(() => {
    // 1. 震动反馈 (保留！这对安卓不卡，而且手感很好)
    if (navigator.vibrate) navigator.vibrate(50);

    // 2. 核心修改：检测是否为安卓设备
    const ua = navigator.userAgent;
    const isAndroid = /Android/i.test(ua);

    // 3. 如果是安卓，直接 return，不执行后面的烟花逻辑
    if (isAndroid) return;

    // 4. 只有 iOS 和 电脑端 才放烟花
    if ((window as any).confetti) {
        // iOS 依然做轻量化处理
        const isIOS = /iPhone|iPad|iPod/i.test(ua);
        
        (window as any).confetti({
            particleCount: isIOS ? 40 : 80, // iOS 40个粒子，PC 80个
            spread: isIOS ? 50 : 70,
            origin: { y: 0.6 },
            colors: ['#FFC8C8', '#BDE0FE', '#FDFD96', '#C1E1C1', '#E2C6E8'],
            disableForReducedMotion: true,
            scalar: isIOS ? 1.2 : 1,
            ticks: 200
        });
    }
  }, []);

  const triggerToast = useCallback((msg: string = "", isUndo: boolean = false) => {
      setToastMessage(msg);
      setShowUndoInToast(isUndo);
      setShowToast(true);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => {
        setShowToast(false);
      }, isUndo ? 2000 : 1500); 
  }, []);

  // --- Task Handlers (Wrapped in useCallback) ---
  const addTask = useCallback((text: string, color: string | null) => {
    playSound('add');
    const newTask: Task = {
      id: uuidv4(),
      text,
      color: color || getRandomColor(),
      createdAt: Date.now(),
      isCompleted: false,
      rotation: getRandomRotation()
    };
    setTasks(prev => [...prev, newTask]);
    
    // Smooth scroll to bottom
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  }, [playSound]);

  const editTask = useCallback((id: string, newText: string) => {
    setTasks(prev => prev.map(task => task.id === id ? { ...task, text: newText } : task));
  }, []);
  
  const changeTaskColor = useCallback((id: string, newColor: string) => {
      setTasks(prev => prev.map(task => task.id === id ? { ...task, color: newColor } : task));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

const completeTask = useCallback((id: string) => {
    // 立即播放声音和震动
    playSound('complete');
    triggerFeedback(); // 安卓只会震动，不会放烟花
    
    // 立即更新数据，不需要延迟了
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { ...task, isCompleted: true, completedAt: Date.now() } 
        : task
    ));
    
    if (zenMode && id === zenTaskId) {
        setZenMode(false);
        setZenTaskId(null);
    }
    
    setLastCompletedId(id);
    triggerToast("", true);
  }, [playSound, triggerFeedback, triggerToast, zenMode, zenTaskId]);

  const restoreTask = useCallback((id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id
        ? { ...task, isCompleted: false, completedAt: undefined }
        : task
    ));
  }, []);

  const handleUndo = useCallback(() => {
    if (!lastCompletedId) return;
    restoreTask(lastCompletedId);
    setShowToast(false);
    setLastCompletedId(null);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, [lastCompletedId, restoreTask]);

const completeActiveTasks = useCallback(() => {
    const count = tasks.filter(t => !t.isCompleted).length;
    if (count === 0) {
        triggerToast("当前没有待办任务！", false);
        return;
    }
    playSound('silent'); 
    setTimeout(() => {
        if (window.confirm(`【一键完成】\n\n确认将屏幕上的 ${count} 个任务全部标记为完成吗？`)) {
           // 1. 先特效
           playSound('complete');
           triggerFeedback();
           
           // 2. 后更新数据
           requestAnimationFrame(() => {
               setTimeout(() => {
                   setTasks(prev => prev.map(t => 
                     !t.isCompleted ? { ...t, isCompleted: true, completedAt: Date.now() } : t
                   ));
               }, 50);
           });
        }
    }, 10);
  }, [tasks, playSound, triggerFeedback, triggerToast]);

  // --- Sorting Logic ---
  const handleSortRequest = useCallback((id: string) => {
      if (filterColor) {
          triggerToast("请先取消筛选再排序", false);
          return;
      }
      setSortingTaskId(id);
  }, [filterColor, triggerToast]);

  const moveTask = useCallback((direction: 'top' | 'up' | 'down' | 'bottom') => {
      if (!sortingTaskId || filterColor) return;

      setTasks(prevTasks => {
          const _completed = prevTasks.filter(t => t.isCompleted);
          const _active = prevTasks.filter(t => !t.isCompleted);
          
          const currentIndex = _active.findIndex(t => t.id === sortingTaskId);
          if (currentIndex === -1) return prevTasks;
          
          const item = _active[currentIndex];
          const newActive = [..._active];
          newActive.splice(currentIndex, 1);
          
          let newIndex = currentIndex;
          if (direction === 'top') newIndex = 0;
          else if (direction === 'bottom') newIndex = newActive.length;
          else if (direction === 'up') newIndex = Math.max(0, currentIndex - 1);
          else if (direction === 'down') newIndex = Math.min(newActive.length, currentIndex + 1);
          
          newActive.splice(newIndex, 0, item);
          return [...newActive, ..._completed];
      });
  }, [sortingTaskId, filterColor]);

  // --- UI Helpers ---
  const enterZenMode = useCallback((id: string) => {
    setZenTaskId(id);
    setZenMode(true);
  }, []);

  const exitZenMode = useCallback(() => {
    setZenMode(false);
    setZenTaskId(null);
  }, []);

  const toggleViewDensity = useCallback(() => setViewDensity(prev => (prev + 1) % 3), []);
  
  const handleRefresh = useCallback(() => {
    triggerToast("正在刷新应用...", false);
    setTimeout(() => window.location.reload(), 500);
  }, [triggerToast]);

  const getGridClasses = () => {
      if (viewDensity === 0) return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';
      if (viewDensity === 1) return 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5';
      return 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6';
  };
  
  const bgClass = isDark ? 'text-gray-100' : 'text-gray-800';
  const buttonBg = isDark ? 'bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700' : 'bg-white/70 text-gray-600 hover:bg-white border-white/60';

  // --- Import/Export ---
  const handleExport = useCallback(() => {
    const data = { title: appTitle, tasks, soundEnabled, exportedAt: Date.now() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `task-notes-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  }, [appTitle, tasks, soundEnabled]);

  const handleImport = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!data || typeof data !== 'object') throw new Error();
        
        if (window.confirm(`确认覆盖当前数据？(包含 ${Array.isArray(data.tasks) ? data.tasks.length : 0} 个任务)`)) {
            if (Array.isArray(data.tasks)) setTasks(data.tasks);
            if (data.title) setAppTitle(data.title);
            if (data.soundEnabled !== undefined) setSoundEnabled(data.soundEnabled);
            setSettingsOpen(false);
            triggerToast("数据导入成功！", false);
        }
      } catch { alert('导入失败：文件格式错误。'); }
    };
    reader.readAsText(file);
  }, [triggerToast]);

  return (
    <div 
      className={`min-h-[100dvh] safe-top relative overflow-x-hidden transition-colors duration-500 font-sans ${bgClass}`}
      style={{ backgroundColor: zenMode ? '#2C2C2C' : THEMES[currentTheme] }}
    >
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 md:px-12 pt-[calc(env(safe-area-inset-top)+3.5rem)] md:pt-16 mb-2">
        <div className="flex flex-col items-center gap-4">
          
          {/* Title */}
          <div className="w-full text-center relative group flex items-center justify-center">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-16 bg-white/40 blur-3xl rounded-full opacity-60 animate-pulse pointer-events-none"></div>
             <Sparkles className="text-yellow-400 mr-2 md:mr-4 animate-bounce-slight" size={28} strokeWidth={3} />
             <input 
              value={appTitle}
              onChange={(e) => setAppTitle(e.target.value)}
              className={`relative max-w-[80%] text-5xl md:text-7xl tracking-wide bg-transparent border-none outline-none transition-all placeholder-gray-400 text-center z-10 font-happy ${isDark ? 'text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]' : 'text-gray-800 text-shadow-light'}`}
              style={{ textShadow: isDark ? '2px 2px 0px #000' : '2px 2px 0px rgba(255,255,255,0.8), 0px 4px 12px rgba(0,0,0,0.05)' }}
            />
            <Sparkles className="text-blue-400 ml-2 md:ml-4 animate-bounce-slight" size={20} strokeWidth={3} style={{ animationDelay: '1s' }} />
          </div>

          {/* Tips */}
          <div className={`border rounded-full px-4 py-1.5 flex items-center gap-2 text-sm backdrop-blur-md animate-fade-in-up shadow-sm ${isDark ? 'bg-gray-800/60 border-gray-700 text-gray-300' : 'bg-white/60 border-white/40 text-gray-600'}`}>
            <Heart size={14} className="text-pink-500" fill="currentColor" />
            <span className="font-bold">{currentTip}</span>
          </div>

          {/* Controls */}
          <div className={`flex flex-wrap items-center justify-center gap-2 sm:gap-3 transition-opacity duration-300 mt-2 ${zenMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <button onClick={() => setSoundEnabled(!soundEnabled)} className={`p-2.5 rounded-full transition-all backdrop-blur-sm active:scale-95 shadow-sm border ${soundEnabled ? (isDark ? 'bg-blue-900/50 text-blue-300 border-blue-800' : 'bg-white text-blue-500 border-blue-100') : (isDark ? 'bg-gray-800 text-gray-500 border-transparent' : 'bg-gray-100 text-gray-400 border-transparent')}`} title={soundEnabled ? "静音" : "开启音效"}>
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button onClick={toggleViewDensity} className={`p-2.5 rounded-full transition-all backdrop-blur-sm active:scale-95 shadow-sm border ${buttonBg}`} title="切换布局">
              {viewDensity === 0 ? <Square size={18} /> : viewDensity === 1 ? <LayoutGrid size={18} /> : <Grid size={18} />}
            </button>

            {/* Filter Button */}
            <div className="relative" ref={filterRef}>
                <button onClick={() => setShowFilterMenu(!showFilterMenu)} className={`p-2.5 rounded-full transition-all backdrop-blur-sm active:scale-95 shadow-sm border ${filterColor ? 'ring-2 ring-offset-1 ring-blue-400' : ''} ${buttonBg}`} title="筛选颜色">
                   {filterColor ? (
                      <div className="w-[18px] h-[18px] rounded-full border border-gray-300 relative overflow-hidden" style={{ backgroundColor: getStickyStyle(filterColor).bg, backgroundImage: getStickyStyle(filterColor).css !== 'none' ? getStickyStyle(filterColor).css : undefined }}></div>
                  ) : <Filter size={18} />}
                </button>
                {showFilterMenu && (
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white p-2 rounded-xl shadow-xl flex gap-1 z-[60] border border-gray-100 items-center max-w-[90vw] overflow-x-auto">
                        <button onClick={() => { setFilterColor(null); setShowFilterMenu(false); }} className={`px-3 h-6 rounded-full border border-gray-200 hover:scale-105 transition-transform bg-gradient-to-r from-pink-200 via-blue-200 to-green-200 flex items-center justify-center text-[10px] font-bold text-gray-600 shadow-sm whitespace-nowrap ${filterColor === null ? 'ring-2 ring-blue-300 ring-offset-1' : ''}`}>ALL</button>
                        <div className="w-px h-4 bg-gray-200 mx-1 flex-shrink-0"></div>
                        {STYLE_KEYS.map(key => (
                            <button key={key} onClick={() => { setFilterColor(key); setShowFilterMenu(false); }} className="w-6 h-6 rounded-full border border-gray-200 hover:scale-110 transition-transform shadow-sm flex-shrink-0 relative overflow-hidden" style={{ backgroundColor: getStickyStyle(key).bg }} title={getStickyStyle(key).name} />
                        ))}
                    </div>
                )}
            </div>

            <button onClick={handleRefresh} className={`p-2.5 rounded-full transition-all backdrop-blur-sm active:scale-95 shadow-sm border ${buttonBg}`} title="刷新应用"><RotateCw size={18} /></button>
            <button onClick={() => setSettingsOpen(true)} className={`p-2.5 rounded-full transition-all backdrop-blur-sm active:scale-95 shadow-sm border ${buttonBg}`} title="设置"><Settings size={18} /></button>
            <button onClick={completeActiveTasks} className={`p-2.5 rounded-full transition-all backdrop-blur-sm active:scale-95 shadow-sm border ${isDark ? 'bg-gray-800 text-gray-400 hover:text-green-400 border-gray-700' : 'bg-white/70 text-gray-600 hover:text-green-600 border-white/60 hover:bg-green-50'}`} title="一键完成"><CheckCheck size={18} /></button>
            <button onClick={() => setHistoryOpen(true)} className={`p-2.5 sm:px-4 sm:py-2 rounded-full flex items-center justify-center sm:justify-start gap-2 transition-all shadow-sm backdrop-blur-sm active:scale-95 border relative ${buttonBg}`} title="历史记录">
              <History size={18} />
              <span className="hidden sm:inline font-bold text-sm">历史</span>
            </button>
          </div>
        </div>
      </div>

      <ProgressBar activeCount={activeTasks.length} completedCount={todayCompletedCount} />

      {/* Grid Area */}
      <div className="max-w-5xl mx-auto px-4 md:px-12 relative min-h-[400px] pb-32">
        {activeTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-8 md:mt-16 text-center select-none animate-fade-in-up px-4">
            <div className="text-7xl md:text-8xl mb-6 animate-bounce-slight filter drop-shadow-xl">{successMsg.emoji}</div>
            <p className={`text-lg md:text-xl font-bold tracking-wide leading-relaxed handwritten opacity-90 whitespace-pre-line ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {successMsg.text}
            </p>
          </div>
        ) : (
          <>
            <div className={`
              grid gap-3 md:gap-8 auto-rows-fr transition-all duration-500
              ${getGridClasses()}
              ${zenMode ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 scale-100'}
            `}>
              {activeTasks.map((task, index) => (
                <StickyNote 
                  key={task.id} 
                  index={index}
                  task={task} 
                  onComplete={completeTask}
                  onDelete={deleteTask}
                  onFocus={() => enterZenMode(task.id)}
                  onEdit={editTask}
                  onColorChange={changeTaskColor}
                  onSort={handleSortRequest}
                  densityLevel={viewDensity}
                  isSorting={sortingTaskId === task.id}
                  isSortingModeActive={!!sortingTaskId}
                />
              ))}
            </div>

            {zenMode && zenTaskId && activeTasks.find(t => t.id === zenTaskId) && (
              <div className="fixed inset-0 flex flex-col items-center justify-center z-40 pointer-events-auto px-6">
                <div className="w-full max-w-sm transform scale-105 md:scale-125 transition-all duration-500">
                   <StickyNote 
                     task={activeTasks.find(t => t.id === zenTaskId)!} 
                     onComplete={completeTask} 
                     onDelete={deleteTask}
                     onEdit={editTask}
                     onColorChange={changeTaskColor}
                     onClose={exitZenMode} 
                     className="shadow-2xl rotate-0"
                     isZenMode={true}
                   />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {!sortingTaskId && <InputArea onAdd={addTask} isDark={isDark} />}

      <HistoryModal 
        isOpen={historyOpen} 
        onClose={() => setHistoryOpen(false)} 
        completedTasks={completedTasks} 
        onRestore={restoreTask}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onExport={handleExport}
        onImport={handleImport}
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
      />

      {showToast && (
          <Toast 
            show={showToast} 
            message={toastMessage}
            onUndo={handleUndo} 
            showUndoButton={showUndoInToast}
          />
      )}

      {/* Sorting Control Bar */}
      {sortingTaskId && (
         <div className="fixed bottom-0 left-0 right-0 z-[120] animate-fade-in-up">
            <div className={`w-full backdrop-blur-xl border-t shadow-[0_-4px_30px_rgba(0,0,0,0.1)] rounded-t-3xl pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6 transition-colors duration-300 ${isDark ? 'bg-gray-900/90 border-gray-700' : 'bg-white/90 border-white/40'}`}>
                <div className="max-w-md mx-auto px-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className={`text-sm font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>正在调整顺序...</span>
                        <button onClick={() => setSortingTaskId(null)} className="bg-black text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md active:scale-95 transition-transform flex items-center gap-1">
                            <Check size={14} /> 完成
                        </button>
                    </div>
                    <div className="flex justify-between gap-2">
                        {['top', 'up', 'down', 'bottom'].map(dir => (
                            <button key={dir} onClick={() => moveTask(dir as any)} className={`flex-1 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all ${isDark ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-gray-800 border border-gray-200 shadow-sm'}`}>
                                {dir === 'top' ? <ArrowUpToLine size={20} /> : dir === 'up' ? <ArrowLeft size={20} /> : dir === 'down' ? <ArrowRight size={20} /> : <ArrowDownToLine size={20} />}
                                <span className="text-[10px] font-bold opacity-60">{{top:'置顶',up:'前移',down:'后移',bottom:'沉底'}[dir]}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default App;