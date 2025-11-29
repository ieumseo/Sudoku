import { BoardState, CellData, Difficulty } from '../types';

// Helper to check validity
const isValid = (board: number[][], row: number, col: number, num: number): boolean => {
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num || board[x][col] === num) return false;
  }
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[startRow + i][startCol + j] === num) return false;
    }
  }
  return true;
};

// Backtracking solver to fill the board
const fillBoard = (board: number[][]): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
        for (const num of nums) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (fillBoard(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
};

// Generate a playable board
export const generateSudoku = (difficulty: Difficulty): BoardState => {
  // 1. Create full solution
  const rawBoard: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));
  fillBoard(rawBoard);
  
  // Clone for solution reference
  const solutionBoard = rawBoard.map(row => [...row]);

  // 2. Remove digits based on difficulty
  let attempts = difficulty === 'Easy' ? 30 : difficulty === 'Medium' ? 45 : 55;
  while (attempts > 0) {
    let row = Math.floor(Math.random() * 9);
    let col = Math.floor(Math.random() * 9);
    while (rawBoard[row][col] === 0) {
      row = Math.floor(Math.random() * 9);
      col = Math.floor(Math.random() * 9);
    }
    rawBoard[row][col] = 0;
    attempts--;
  }

  // 3. Map to CellData structure
  const board: BoardState = rawBoard.map((row, rIndex) => 
    row.map((val, cIndex) => ({
      row: rIndex,
      col: cIndex,
      value: val,
      solution: solutionBoard[rIndex][cIndex],
      isFixed: val !== 0,
      isError: false,
      notes: []
    }))
  );

  return board;
};