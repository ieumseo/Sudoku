import React from 'react';
import { Pencil, Undo, Brain, Eraser, RotateCcw } from 'lucide-react';

interface ControlsProps {
  onNumberClick: (num: number) => void;
  onUndo: () => void;
  onErase: () => void;
  onHint: () => void;
  onNewGame: () => void;
  notesMode: boolean;
  toggleNotesMode: () => void;
  loadingHint: boolean;
}

const Controls: React.FC<ControlsProps> = ({ 
  onNumberClick, 
  onUndo, 
  onErase, 
  onHint, 
  onNewGame,
  notesMode, 
  toggleNotesMode,
  loadingHint
}) => {
  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto mt-4">
      
      {/* Tools Row */}
      <div className="flex justify-between gap-4 px-2">
        <button onClick={onUndo} className="flex flex-col items-center gap-1 group text-slate-500 hover:text-slate-800">
          <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5 transition-all">
            <Undo size={20} strokeWidth={2} />
          </div>
          <span className="text-[10px] font-medium tracking-wide">실행취소</span>
        </button>
        
        <button onClick={toggleNotesMode} className={`flex flex-col items-center gap-1 group ${notesMode ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}>
           <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm transition-all border ${notesMode ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-200' : 'bg-white border-slate-200 group-hover:shadow-md group-hover:-translate-y-0.5'}`}>
            <Pencil size={20} strokeWidth={2} />
          </div>
          <span className="text-[10px] font-medium tracking-wide">메모 {notesMode ? 'ON' : 'OFF'}</span>
        </button>

        <button onClick={onErase} className="flex flex-col items-center gap-1 group text-slate-500 hover:text-slate-800">
           <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5 transition-all">
            <Eraser size={20} strokeWidth={2} />
          </div>
          <span className="text-[10px] font-medium tracking-wide">지우기</span>
        </button>
        
        <button onClick={onHint} disabled={loadingHint} className="flex flex-col items-center gap-1 group text-slate-500 hover:text-slate-800 disabled:opacity-50">
           <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5 transition-all">
            <Brain size={20} strokeWidth={2} className={loadingHint ? "animate-spin text-indigo-500" : ""} />
          </div>
          <span className="text-[10px] font-medium tracking-wide">힌트</span>
        </button>
      </div>

      {/* Number Pad */}
      <div className="grid grid-cols-9 gap-1 sm:gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => onNumberClick(num)}
            className="aspect-[4/5] sm:aspect-square flex items-center justify-center text-xl sm:text-2xl font-light text-indigo-600 bg-white hover:bg-indigo-50 rounded-lg sm:rounded-xl shadow-sm border border-slate-200 hover:border-indigo-200 hover:shadow-md active:scale-95 transition-all"
          >
            {num}
          </button>
        ))}
      </div>

      {/* Footer Actions */}
       <div className="flex justify-center mt-2">
         <button 
          onClick={onNewGame} 
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-full shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-all hover:shadow-md"
        >
          <RotateCcw size={16} />
          새로운 게임 시작
        </button>
       </div>

    </div>
  );
};

export default Controls;