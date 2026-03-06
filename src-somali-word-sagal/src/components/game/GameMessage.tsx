
import React from 'react';

interface GameMessageProps {
  message: string;
  wordsGuessed: number;
  points?: number;
}

const GameMessage: React.FC<GameMessageProps> = ({ message, wordsGuessed, points = 0 }) => {
  if (!message) return null;
  
  return (
    <div className="bg-gray-100 p-4 rounded-md text-center animate-bounce-in my-4">
      <p className="text-xl font-bold">{message}</p>
      <div className="flex justify-center gap-4 mt-2">
        <p className="text-md">Words guessed: {wordsGuessed}</p>
        <p className="text-md font-semibold text-primary">Points: {points}</p>
      </div>
    </div>
  );
};

export default GameMessage;
