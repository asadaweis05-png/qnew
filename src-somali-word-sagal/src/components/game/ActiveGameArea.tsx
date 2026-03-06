
import React from 'react';
import GameBoard from '@/components/GameBoard';
import Keyboard from '@/components/Keyboard';
import IncorrectLetters from '@/components/IncorrectLetters';
import GameMessage from '@/components/game/GameMessage';
import { GameState } from '@/utils/gameLogic';
import { useIsMobile } from '@/hooks/use-mobile';

interface ActiveGameAreaProps {
  gameState: GameState;
  message: string;
  wordsGuessed: number;
  points: number;
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onNewWord: () => void;
}

const ActiveGameArea: React.FC<ActiveGameAreaProps> = ({ 
  gameState, 
  message, 
  wordsGuessed,
  points, 
  onKeyPress, 
  onDelete, 
  onNewWord 
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col gap-2 mt-4">
      <GameBoard 
        board={gameState.board} 
        currentRow={gameState.currentRow} 
      />
      
      <IncorrectLetters letters={gameState.incorrectLetters} />
      
      {message && <GameMessage message={message} wordsGuessed={wordsGuessed} points={points} />}
      
      {(gameState.gameStatus !== 'playing') && (
        <button 
          onClick={onNewWord}
          className={`mt-3 ${isMobile ? 'px-3 py-1.5' : 'mt-4 px-4 py-2'} bg-primary text-white rounded-md mx-auto block`}
        >
          New Word
        </button>
      )}
      
      <div className={`mt-auto ${isMobile ? 'py-2 sticky bottom-0 bg-background/90 backdrop-blur-sm z-10' : 'pb-2'}`}>
        <Keyboard 
          onKeyPress={onKeyPress}
          onEnter={() => {}} // No longer needed, but keeping for compatibility
          onDelete={onDelete}
          keyStatus={gameState.keyStatus}
          disabled={gameState.gameStatus !== 'playing'}
        />
      </div>
    </div>
  );
};

export default ActiveGameArea;
