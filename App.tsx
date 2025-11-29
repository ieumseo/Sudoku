import React, { useState, useEffect, useCallback } from 'react';
import { GameState, Difficulty, BoardState } from './types';
import { generateSudoku } from './services/sudokuGenerator';
import Cell from './components/Cell';
import Controls from './components/Controls';
import { getSmartHint } from './services/geminiService';
import { Sparkles, X, ChevronDown } from 'lucide-react';

const INITIAL_STATE: GameState = {
  board: [],
  difficulty: 'Easy',
  selectedCell: null,
  mistakes: 0,
  timer: 0,
  isGameOver: false,
  isWon: false,
  notesMode: false,
  history: [],
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);

  // Initialize Game
  const startNewGame = useCallback((difficulty: Difficulty = 'Easy') => {
    setLoading(true);
    // Smooth transition simulation
    setTimeout(() => {
      const newBoard = generateSudoku(difficulty);
      setGameState({
        ...INITIAL_STATE,
        board: newBoard,
        difficulty,
        history: [],
      });
      setHintMessage(null);
      setLoading(false);
    }, 300);
  }, []);

  useEffect(() => {
    startNewGame('Easy');
  }, [startNewGame]);

  // Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (!gameState.isGameOver && !gameState.isWon && !loading) {
      interval = setInterval(() => {
        setGameState(prev => ({ ...prev, timer: prev.timer + 1 }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState.isGameOver, gameState.isWon, loading]);

  // Keyboard Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.isGameOver || gameState.isWon) return;

      if (e.key >= '1' && e.key <= '9') {
        handleNumberInput(parseInt(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleErase();
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        moveSelection(e.key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const moveSelection = (key: string) => {
    setGameState(prev => {
      if (!prev.selectedCell) return { ...prev, selectedCell: { row: 0, col: 0 } };
      let { row, col } = prev.selectedCell;
      if (key === 'ArrowUp') row = Math.max(0, row - 1);
      if (key === 'ArrowDown') row = Math.min(8, row + 1);
      if (key === 'ArrowLeft') col = Math.max(0, col - 1);
      if (key === 'ArrowRight') col = Math.min(8, col + 1);
      return { ...prev, selectedCell: { row, col } };
    });
  };

  const handleCellClick = (row: number, col: number) => {
    setGameState(prev => ({ ...prev, selectedCell: { row, col } }));
  };

  const updateHistory = (board: BoardState) => {
      setGameState(prev => ({
          ...prev,
          history: [...prev.history, board.map(row => row.map(cell => ({...cell, notes: [...cell.notes]})))]
      }));
  }

  const handleNumberInput = (num: number) => {
    const { selectedCell, board, notesMode, isGameOver, isWon } = gameState;
    if (!selectedCell || isGameOver || isWon) return;

    const { row, col } = selectedCell;
    const cell = board[row][col];

    if (cell.isFixed) return;

    // Deep copy board
    const newBoard = board.map(r => r.map(c => ({ ...c, notes: [...c.notes] })));
    const currentCell = newBoard[row][col];

    if (notesMode) {
      if (currentCell.notes.includes(num)) {
        currentCell.notes = currentCell.notes.filter(n => n !== num);
      } else {
        currentCell.notes = [...currentCell.notes, num].sort();
      }
      setGameState(prev => ({ ...prev, board: newBoard }));
    } else {
      if (currentCell.value === num) return;
      updateHistory(gameState.board);
      currentCell.value = num;
      
      if (num !== currentCell.solution) {
        currentCell.isError = true;
        const newMistakes = gameState.mistakes + 1;
        setGameState(prev => ({
          ...prev,
          board: newBoard,
          mistakes: newMistakes,
          isGameOver: newMistakes >= 3
        }));
      } else {
        currentCell.isError = false;
        // Auto-clear notes
        for (let i = 0; i < 9; i++) {
             newBoard[row][i].notes = newBoard[row][i].notes.filter(n => n !== num);
             newBoard[i][col].notes = newBoard[i][col].notes.filter(n => n !== num);
        }
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let i=0; i<3; i++) {
            for(let j=0; j<3; j++) {
                newBoard[startRow+i][startCol+j].notes = newBoard[startRow+i][startCol+j].notes.filter(n => n !== num);
            }
        }

        let completed = true;
        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
            if (newBoard[r][c].value !== newBoard[r][c].solution) completed = false;
          }
        }
        
        setGameState(prev => ({
          ...prev,
          board: newBoard,
          isWon: completed
        }));
      }
    }
  };

  const handleErase = () => {
    const { selectedCell, board } = gameState;
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    if (board[row][col].isFixed) return;

    updateHistory(board);
    const newBoard = board.map(r => r.map(c => ({ ...c })));
    newBoard[row][col].value = 0;
    newBoard[row][col].isError = false;
    newBoard[row][col].notes = [];
    setGameState(prev => ({ ...prev, board: newBoard }));
  };

  const handleUndo = () => {
      setGameState(prev => {
          if (prev.history.length === 0) return prev;
          const previousBoard = prev.history[prev.history.length - 1];
          const newHistory = prev.history.slice(0, -1);
          return {
              ...prev,
              board: previousBoard,
              history: newHistory
          };
      });
  };

  const handleHint = async () => {
    setLoadingHint(true);
    const hint = await getSmartHint(gameState.board);
    setHintMessage(hint);
    setLoadingHint(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 py-8 bg-slate-50 text-slate-800">
      
      <div className="w-full max-w-lg flex flex-col gap-6">
        
        {/* Modern Header */}
        <div className="flex justify-between items-start px-1">
          <div>
            <h1 className="text-3xl font-light tracking-tight text-slate-900">
              Sudoku<span className="font-bold text-indigo-600">.</span>
            </h1>
            <div className="flex items-center gap-4 mt-2 text-sm font-medium text-slate-400">
              <span>{gameState.difficulty}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span>{formatTime(gameState.timer)}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className={`${gameState.mistakes > 0 ? 'text-rose-500' : ''}`}>실수 {gameState.mistakes}/3</span>
            </div>
          </div>
          
           {/* Difficulty Dropdown */}
           <div className="relative group">
             <select 
               className="appearance-none bg-white border border-slate-200 text-slate-600 text-sm font-medium py-2 pl-4 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer hover:border-indigo-200 transition-colors"
               value={gameState.difficulty}
               onChange={(e) => startNewGame(e.target.value as Difficulty)}
             >
                <option value="Easy">쉬움</option>
                <option value="Medium">보통</option>
                <option value="Hard">어려움</option>
             </select>
             <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
           </div>
        </div>

        {/* Hint Notification Bubble */}
        {hintMessage && (
            <div className="bg-white border border-indigo-100 p-4 rounded-xl shadow-lg shadow-indigo-100/50 animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-start gap-3">
                    <div className="flex gap-3">
                        <div className="bg-indigo-50 p-1.5 rounded-lg h-fit">
                            <Sparkles size={16} className="text-indigo-600" />
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">{hintMessage}</p>
                    </div>
                    <button onClick={() => setHintMessage(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={16} />
                    </button>
                </div>
            </div>
        )}

        {/* Board Container */}
        {/* Increased padding and ensured borders are visible */}
        <div className="bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/50 relative ring-1 ring-slate-100">
          
          {loading ? (
             <div className="w-full aspect-square flex flex-col items-center justify-center gap-4 text-slate-400">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium">준비 중...</span>
             </div>
          ) : (
            /* Added aspect-square and border-2 for robustness */
            <div className="grid grid-cols-9 aspect-square bg-slate-200 gap-px border-2 border-slate-200 rounded-xl overflow-hidden">
              {gameState.board.map((row, rIndex) => (
                row.map((cell, cIndex) => {
                   // Clean 2D Borders Logic
                   // Use 2px margins for clearer thick lines and to avoid subpixel clipping issues
                   const isRightBlockEdge = (cIndex + 1) % 3 === 0 && cIndex !== 8;
                   const isBottomBlockEdge = (rIndex + 1) % 3 === 0 && rIndex !== 8;
                   
                   return (
                     <div 
                        key={`${rIndex}-${cIndex}`} 
                        className="bg-white relative"
                        style={{
                            marginRight: isRightBlockEdge ? '2px' : '0',
                            marginBottom: isBottomBlockEdge ? '2px' : '0',
                        }}
                     >
                        <Cell 
                          cell={cell}
                          isSelected={gameState.selectedCell?.row === rIndex && gameState.selectedCell?.col === cIndex}
                          isRelated={gameState.selectedCell ? (gameState.selectedCell.row === rIndex || gameState.selectedCell.col === cIndex || (Math.floor(gameState.selectedCell.row/3) === Math.floor(rIndex/3) && Math.floor(gameState.selectedCell.col/3) === Math.floor(cIndex/3))) : false}
                          isSameValue={gameState.selectedCell && gameState.board[gameState.selectedCell.row][gameState.selectedCell.col].value !== 0 ? gameState.board[gameState.selectedCell.row][gameState.selectedCell.col].value === cell.value : false}
                          onClick={() => handleCellClick(rIndex, cIndex)}
                        />
                     </div>
                   );
                })
              ))}
            </div>
          )}

           {/* Overlays */}
           {gameState.isGameOver && (
               <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 p-6 text-center rounded-2xl">
                   <h2 className="text-3xl font-bold text-slate-800 mb-2">Game Over</h2>
                   <p className="text-slate-500 mb-6 text-sm">3번의 실수로 게임이 종료되었습니다.</p>
                   <button onClick={() => startNewGame(gameState.difficulty)} className="bg-slate-900 text-white px-8 py-3 rounded-full font-medium hover:bg-slate-800 transition-all hover:shadow-lg hover:-translate-y-0.5">다시 도전하기</button>
               </div>
           )}
           {gameState.isWon && (
               <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 p-6 text-center rounded-2xl">
                   <h2 className="text-4xl font-bold text-indigo-600 mb-2 tracking-tight">Perfect!</h2>
                   <p className="text-slate-600 mb-8 font-medium">완료 시간 {formatTime(gameState.timer)}</p>
                   <button onClick={() => startNewGame(gameState.difficulty)} className="bg-indigo-600 text-white px-8 py-3 rounded-full font-medium hover:bg-indigo-500 transition-all hover:shadow-lg shadow-indigo-200 hover:-translate-y-0.5">새 게임 시작</button>
               </div>
           )}
        </div>

        {/* Controls */}
        <Controls 
          onNumberClick={handleNumberInput}
          onUndo={handleUndo}
          onErase={handleErase}
          onHint={handleHint}
          onNewGame={() => startNewGame(gameState.difficulty)}
          notesMode={gameState.notesMode}
          toggleNotesMode={() => setGameState(prev => ({ ...prev, notesMode: !prev.notesMode }))}
          loadingHint={loadingHint}
        />
        
      </div>
    </div>
  );
}