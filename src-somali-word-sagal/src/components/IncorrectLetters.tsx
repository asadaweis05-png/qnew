
import React from 'react';

interface IncorrectLettersProps {
  letters: string[];
}

const IncorrectLetters: React.FC<IncorrectLettersProps> = ({ letters }) => {
  if (letters.length === 0) return null;

  return (
    <div className="flex flex-col items-center mt-4">
      <h3 className="text-lg font-medium mb-2">Incorrect Letters:</h3>
      <div className="flex flex-wrap gap-2 justify-center">
        {letters.map((letter, index) => (
          <div 
            key={index}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-absent text-white font-bold uppercase"
          >
            {letter}
          </div>
        ))}
      </div>
    </div>
  );
};

export default IncorrectLetters;
