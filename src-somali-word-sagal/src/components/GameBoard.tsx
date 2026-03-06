
import React from 'react';
import { TileData } from '@/utils/gameLogic';
import { useIsMobile } from '@/hooks/use-mobile';

interface GameBoardProps {
  board: TileData[][];
  currentRow: number;
}

const GameBoard: React.FC<GameBoardProps> = ({ board, currentRow }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="grid grid-cols-1 gap-1 p-2 mx-auto">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1">
          {row.map((tile, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`${
                isMobile ? 'w-12 h-12 text-xl' : 'w-14 h-14 text-2xl'
              } inline-flex items-center justify-center font-bold uppercase border-2 border-gray-300 select-none ${
                tile.status === 'correct' ? 'tile-correct' : 
                tile.status === 'present' ? 'tile-present' : 
                tile.letter ? 'bg-gray-200' : ''
              }`}
            >
              {tile.letter}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default GameBoard;
