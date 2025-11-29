import React from 'react';
import { CellData } from '../types';

interface CellProps {
  cell: CellData;
  isSelected: boolean;
  isRelated: boolean; // Same row/col/box
  isSameValue: boolean; // Highlights all 5s if 5 is selected
  onClick: () => void;
}

const Cell: React.FC<CellProps> = ({ cell, isSelected, isRelated, isSameValue, onClick }) => {
  const { value, isFixed, isError, notes } = cell;

  // Modern Color Logic
  let bgClass = "bg-white"; // Default
  let textClass = "text-slate-800";
  
  if (isError) {
    bgClass = "bg-rose-50";
    textClass = "text-rose-500";
  } else if (isSelected) {
    bgClass = "bg-indigo-500";
    textClass = "text-white";
  } else if (isSameValue && value !== 0) {
    bgClass = "bg-indigo-100";
    textClass = "text-indigo-900";
  } else if (isRelated) {
    bgClass = "bg-slate-50"; // Very subtle highlight for row/col
  }

  // Text Styling - adjusted sizes slightly
  const fontClass = isFixed 
    ? "font-semibold text-slate-900" // Fixed numbers are darker/bolder
    : "font-medium text-indigo-600"; // User inputs are colored

  return (
    <div
      onClick={onClick}
      className={`
        w-full h-full flex items-center justify-center 
        cursor-pointer select-none
        ${bgClass}
        transition-colors duration-150 ease-out
      `}
    >
      {value !== 0 ? (
        <span className={`text-xl sm:text-3xl ${fontClass} ${isSelected || isError ? textClass : ''}`}>
          {value}
        </span>
      ) : (
        // Notes Grid
        <div className="grid grid-cols-3 gap-px w-full h-full p-[2px] pointer-events-none">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <div key={n} className="flex items-center justify-center text-[8px] sm:text-[9px] leading-none text-slate-400 font-medium">
              {notes.includes(n) ? n : ''}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(Cell);