
import React from 'react';
import { LetterStatus } from '@/utils/gameLogic';
import { useIsMobile } from '@/hooks/use-mobile';

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  onEnter: () => void;
  onDelete: () => void;
  keyStatus: Record<string, LetterStatus>;
  disabled?: boolean;
}

const Keyboard: React.FC<KeyboardProps> = ({
  onKeyPress,
  onEnter,
  onDelete,
  keyStatus,
  disabled = false
}) => {
  const isMobile = useIsMobile();
  
  const rows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'delete']
  ];

  const getKeyClass = (key: string): string => {
    if (key === 'enter' || key === 'delete') {
      return `key bg-gray-300 text-gray-800 ${isMobile ? 'min-w-[3.2rem]' : 'min-w-[4rem]'}`;
    }
    
    const status = keyStatus[key];
    if (status === 'correct') return 'key key-correct';
    if (status === 'present') return 'key key-present';
    if (status === 'absent') return 'key key-absent';
    
    return 'key bg-gray-200 text-gray-800';
  };

  const handleKeyClick = (key: string) => {
    if (disabled) return;
    
    if (key === 'enter') {
      onEnter();
    } else if (key === 'delete') {
      onDelete();
    } else {
      onKeyPress(key);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-2">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center my-1 gap-1">
          {row.map((key) => (
            <button
              key={key}
              className={`${getKeyClass(key)} ${
                isMobile 
                  ? `${key === 'enter' || key === 'delete' ? 'text-[10px] py-3' : 'text-sm py-3'} px-1.5 h-10`
                  : `${key === 'enter' || key === 'delete' ? 'text-xs' : 'text-base'} px-2 py-4 md:px-3 md:py-5`
              }`}
              onClick={() => handleKeyClick(key)}
              disabled={disabled}
            >
              {key === 'delete' ? '⌫' : key.toUpperCase()}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;
