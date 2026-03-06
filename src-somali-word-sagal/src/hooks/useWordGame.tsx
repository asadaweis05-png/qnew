
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getTodaysWord, isValidWord } from '@/data/wordList';
import { GameState, initializeGame, removeLetter, resetGame } from '@/utils/gameLogic';

interface UseWordGameProps {
  user: any;
  onScoreUpdate: (score: number, points: number, completionTime: number) => void;
}

export const useWordGame = ({ user, onScoreUpdate }: UseWordGameProps) => {
  const { toast } = useToast();
  const [solution, setSolution] = useState("");
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [message, setMessage] = useState("");
  const [wordsGuessed, setWordsGuessed] = useState(0);
  const [points, setPoints] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [completionTime, setCompletionTime] = useState(0);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds = 1 minute
  const [timerActive, setTimerActive] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Initialize the game
  const initGame = useCallback(() => {
    const newWord = getTodaysWord();
    setSolution(newWord);
    setGameState(initializeGame(newWord.length));
    setMessage("");
    setTimeLeft(60); // Reset timer to 60 seconds
    setTimerActive(false); // Don't start the timer immediately
    setGameStarted(false); // Reset game started state
  }, []);

  // Start the game
  const startGame = useCallback(() => {
    if (gameStarted) return;
    
    setGameStarted(true);
    setTimerActive(true);
    setStartTime(Date.now());
    toast({
      title: "Game started!",
      description: "You have 1 minute to guess as many words as you can!",
    });
  }, [gameStarted, toast]);

  // Handle New Word button
  const handleNewWord = useCallback(() => {
    initGame();
    toast({
      title: "New word loaded",
      description: "Try to guess the new word!",
    });
  }, [initGame, toast]);

  // Handle Delete key
  const handleDeleteKey = useCallback(() => {
    if (!gameState || gameState.gameStatus !== 'playing' || !gameStarted) return;
    setGameState(removeLetter(gameState));
  }, [gameState, gameStarted]);

  // Updated key press handler to handle repeated letters
  const handleKeyPress = useCallback((key: string) => {
    if (!gameState || gameState.gameStatus !== 'playing' || !gameStarted) return;
    
    const keyLower = key.toLowerCase();
    const solutionLower = solution.toLowerCase();
    
    // Check if the letter is in the solution
    if (!solutionLower.includes(keyLower)) {
      // Letter not in solution
      toast({
        title: "Incorrect letter",
        description: `"${key.toUpperCase()}" is not in the word`,
        variant: "destructive",
      });
      
      // Add to incorrect letters list
      if (!gameState.incorrectLetters.includes(keyLower)) {
        setGameState({
          ...gameState,
          incorrectLetters: [...gameState.incorrectLetters, keyLower]
        });
      }
      return;
    }
    
    // Create a copy of the current board state
    const updatedBoard = [...gameState.board];
    const currentRow = gameState.currentRow;
    
    // Find the next available position for this letter
    const letterPositions = [];
    for (let i = 0; i < solutionLower.length; i++) {
      if (solutionLower[i] === keyLower) {
        letterPositions.push(i);
      }
    }
    
    // Find the first unfilled position for this letter
    let placedLetter = false;
    for (const pos of letterPositions) {
      if (!updatedBoard[currentRow][pos].letter) {
        // Position is empty, place the letter
        updatedBoard[currentRow][pos] = {
          letter: keyLower,
          status: 'correct'
        };
        
        placedLetter = true;
        
        // Show toast for correct placement
        toast({
          title: "Correct placement!",
          description: `"${key.toUpperCase()}" is in position ${pos + 1}`,
        });
        
        break;
      }
    }
    
    // If all positions for this letter are already filled
    if (!placedLetter) {
      toast({
        title: "Letter already used",
        description: `All positions for "${key.toUpperCase()}" are already filled`,
      });
      return;
    }
    
    // Update key status in keyboard
    const newKeyStatus = { ...gameState.keyStatus };
    newKeyStatus[keyLower] = 'correct';
    
    // Check if all positions are filled correctly
    const allCorrect = updatedBoard[currentRow].every((tile, idx) => 
      tile.letter === solutionLower[idx]
    );
    
    // Initialize with current game status
    let newGameStatus: "playing" | "won" | "lost" = gameState.gameStatus;
    
    if (allCorrect && updatedBoard[currentRow].every(tile => tile.letter)) {
      // All letters are correct and all positions filled
      newGameStatus = "won";
      
      // Calculate current completion time
      const wordCompletionTime = startTime ? ((Date.now() - startTime) / 1000) : 0;
      setCompletionTime(prev => prev + wordCompletionTime);
      
      // Add 5 points for each completed word
      setPoints(prev => prev + 5);
      
      setWordsGuessed(prev => {
        const newScore = prev + 1;
        // Update points and completion time along with words guessed
        onScoreUpdate(newScore, points + 5, wordCompletionTime);
        return newScore;
      });
      
      setMessage("Correct! You found the word!");
      setTimerActive(false); // Stop the timer when word is guessed
      
      toast({
        title: "Great job!",
        description: `You guessed "${solution.toUpperCase()}" correctly! +5 points`,
      });
      
      // Reset game with a new word after a short delay
      setTimeout(() => {
        initGame();
      }, 2000);
    }
    
    // Update the game state
    setGameState({
      ...gameState,
      board: updatedBoard,
      keyStatus: newKeyStatus,
      gameStatus: newGameStatus
    });
  }, [gameState, solution, toast, initGame, gameStarted, onScoreUpdate, points, startTime]);

  // Timer effect
  useEffect(() => {
    let timer: number | null = null;
    
    if (timerActive && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      // Time's up
      setTimerActive(false);
      setGameStarted(false);
      toast({
        title: "Time's up!",
        description: `The word was "${solution.toUpperCase()}"`,
        variant: "destructive",
      });
      setMessage(`Time's up! The word was "${solution.toUpperCase()}"`);
      
      // Update final score with all metrics
      onScoreUpdate(wordsGuessed, points, completionTime);
      
      // Reset game with a new word after a short delay
      setTimeout(() => {
        initGame();
      }, 2000);
    }
    
    // Clear timer when component unmounts or timer stops
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timeLeft, timerActive, solution, toast, initGame, wordsGuessed, points, completionTime, onScoreUpdate]);

  // Stop timer when game is won
  useEffect(() => {
    if (gameState?.gameStatus === "won") {
      setTimerActive(false);
    }
  }, [gameState?.gameStatus]);

  // Handle physical keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameState || gameState.gameStatus !== 'playing' || !gameStarted) return;
      
      if (e.key === 'Backspace') {
        handleDeleteKey();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKeyPress(e.key.toLowerCase());
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState, gameStarted, handleKeyPress, handleDeleteKey]);

  // Reset start time when starting a new game
  useEffect(() => {
    if (gameStarted) {
      setStartTime(Date.now());
    }
  }, [gameStarted]);

  return {
    gameState,
    message,
    wordsGuessed,
    points,
    timeLeft,
    gameStarted,
    solution,
    completionTime,
    initGame,
    startGame,
    handleKeyPress,
    handleDeleteKey,
    handleNewWord,
    setWordsGuessed,
    setPoints,
  };
};
