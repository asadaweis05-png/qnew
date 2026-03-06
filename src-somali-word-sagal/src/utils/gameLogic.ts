export type LetterStatus = "correct" | "present" | "absent" | "empty";

export interface TileData {
  letter: string;
  status: LetterStatus;
}

// Update GameState to properly type the gameStatus field
export interface GameState {
  currentRow: number;
  currentTile: number;
  board: TileData[][];
  keyStatus: Record<string, LetterStatus>;
  gameStatus: "playing" | "won" | "lost";
  attempts: number;
  maxAttempts: number;
  incorrectLetters: string[]; // New property to track incorrect letters
}

export const evaluateGuess = (
  guess: string,
  solution: string
): LetterStatus[] => {
  const solutionLetters = [...solution.toLowerCase()];
  const guessLetters = [...guess.toLowerCase()];
  const result: LetterStatus[] = Array(guess.length).fill("absent");
  
  // Mark correct letters
  for (let i = 0; i < guessLetters.length; i++) {
    if (guessLetters[i] === solutionLetters[i]) {
      result[i] = "correct";
      solutionLetters[i] = "#"; // Mark as used
    }
  }
  
  // Mark present letters
  for (let i = 0; i < guessLetters.length; i++) {
    if (result[i] !== "correct") {
      const index = solutionLetters.indexOf(guessLetters[i]);
      if (index !== -1) {
        result[i] = "present";
        solutionLetters[index] = "#"; // Mark as used
      }
    }
  }
  
  return result;
};

export const updateKeyStatus = (
  currentStatus: Record<string, LetterStatus>,
  guess: string,
  evaluation: LetterStatus[]
): Record<string, LetterStatus> => {
  const newStatus = { ...currentStatus };
  
  for (let i = 0; i < guess.length; i++) {
    const letter = guess[i].toLowerCase();
    const status = evaluation[i];
    
    // Only update if new status is more informative
    if (!newStatus[letter] || 
        (newStatus[letter] === "absent" && status !== "absent") ||
        (newStatus[letter] === "present" && status === "correct")) {
      newStatus[letter] = status;
    }
  }
  
  return newStatus;
};

export const createEmptyBoard = (rows: number, cols: number): TileData[][] => {
  return Array(rows)
    .fill(null)
    .map(() => 
      Array(cols)
        .fill(null)
        .map(() => ({ letter: "", status: "empty" }))
    );
};

// Modified to automatically place the letter and support single row gameplay
export const addLetter = (
  gameState: GameState,
  letter: string,
  solution: string,
  solutionLength: number
): GameState => {
  if (
    gameState.gameStatus !== "playing" ||
    gameState.currentTile >= solutionLength
  ) {
    return gameState;
  }
  
  const newBoard = [...gameState.board];
  const currentRow = gameState.currentRow;
  const currentTile = gameState.currentTile;
  
  // Place the letter in the current position
  newBoard[currentRow][currentTile] = {
    letter,
    status: letter.toLowerCase() === solution[currentTile].toLowerCase() ? "correct" : "absent"
  };
  
  // Check if the letter is in the solution but in a different position
  if (newBoard[currentRow][currentTile].status === "absent" && 
      solution.toLowerCase().includes(letter.toLowerCase())) {
    newBoard[currentRow][currentTile].status = "present";
  }
  
  // Update the key status based on the evaluation
  const newKeyStatus = { ...gameState.keyStatus };
  newKeyStatus[letter.toLowerCase()] = newBoard[currentRow][currentTile].status;
  
  // Add to incorrect letters if the letter is absent
  let newIncorrectLetters = [...gameState.incorrectLetters];
  if (newBoard[currentRow][currentTile].status === "absent" && 
      !newIncorrectLetters.includes(letter.toLowerCase())) {
    newIncorrectLetters.push(letter.toLowerCase());
  }
  
  // Check if we've reached the end of the row (word)
  const isRowComplete = currentTile === solutionLength - 1;
  let newGameStatus: "playing" | "won" | "lost" = gameState.gameStatus;
  let newTile = currentTile + 1;
  let newAttempts = gameState.attempts;
  
  if (isRowComplete) {
    // Check if all letters in the row are correct
    const isCorrectWord = newBoard[currentRow].every(tile => tile.status === "correct");
    
    if (isCorrectWord) {
      newGameStatus = "won";
    } else {
      newAttempts += 1;
      
      // Since we now only have one row, we set game to lost if word is wrong
      newGameStatus = "lost";
    }
  }
  
  return {
    ...gameState,
    board: newBoard,
    currentTile: newTile,
    keyStatus: newKeyStatus,
    gameStatus: newGameStatus,
    attempts: newAttempts,
    incorrectLetters: newIncorrectLetters
  };
};

export const removeLetter = (gameState: GameState): GameState => {
  if (
    gameState.gameStatus !== "playing"
  ) {
    return gameState;
  }
  
  // Create a copy of the board
  const newBoard = [...gameState.board];
  let letterRemoved = false;
  
  // Find the last non-empty tile in the current row and clear it
  for (let i = newBoard[gameState.currentRow].length - 1; i >= 0; i--) {
    if (newBoard[gameState.currentRow][i].letter !== "") {
      newBoard[gameState.currentRow][i] = {
        letter: "",
        status: "empty"
      };
      letterRemoved = true;
      break;
    }
  }
  
  if (!letterRemoved) {
    return gameState; // No letter to remove
  }
  
  return {
    ...gameState,
    board: newBoard
  };
};

// Reset the game with a new word
export const resetGame = (
  solutionLength: number
): GameState => {
  return {
    currentRow: 0,
    currentTile: 0,
    board: createEmptyBoard(1, solutionLength), // Only 1 row now
    keyStatus: {},
    gameStatus: "playing",
    attempts: 0,
    maxAttempts: 1, // Only 1 attempt now
    incorrectLetters: [] // Reset incorrect letters
  };
};

// This function is no longer used but kept for compatibility
export const submitGuess = (
  gameState: GameState,
  solution: string,
  isValidWord: (word: string) => boolean
): { gameState: GameState; isValid: boolean; message: string } => {
  // Since we're checking letter by letter, this is no longer needed
  // But we'll keep the function signature for compatibility
  return {
    gameState,
    isValid: true,
    message: ""
  };
};

export const initializeGame = (
  solutionLength: number
): GameState => {
  return {
    currentRow: 0,
    currentTile: 0,
    board: createEmptyBoard(1, solutionLength), // Only 1 row now
    keyStatus: {},
    gameStatus: "playing",
    attempts: 0,
    maxAttempts: 1, // Only 1 attempt now
    incorrectLetters: [] // Initialize incorrect letters array
  };
};
