export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface CellData {
  row: number;
  col: number;
  value: number; // 0 for empty
  solution: number;
  isFixed: boolean; // True if part of the initial puzzle
  isError: boolean;
  notes: number[];
}

export type BoardState = CellData[][];

export interface GameState {
  board: BoardState;
  difficulty: Difficulty;
  selectedCell: { row: number; col: number } | null;
  mistakes: number;
  timer: number;
  isGameOver: boolean;
  isWon: boolean;
  notesMode: boolean;
  history: BoardState[]; // For undo
}