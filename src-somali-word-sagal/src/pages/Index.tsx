
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import HowToPlay from '@/components/HowToPlay';
import UserMenu from '@/components/UserMenu';
import { useAuth } from '@/hooks/useAuth';
import { updateUserScore } from '@/lib/userScores';
import { useWordGame } from '@/hooks/useWordGame';
import GameTimer from '@/components/game/GameTimer';
import GameStartScreen from '@/components/game/GameStartScreen';
import ActiveGameArea from '@/components/game/ActiveGameArea';
import AdSense from '@/components/AdSense';
import { useIsMobile } from '@/hooks/use-mobile';

const Index: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  
  // Game state management using the custom hook
  const { 
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
    setPoints
  } = useWordGame({ 
    user, 
    onScoreUpdate: (score, points, completionTime) => {
      // Save score when it changes
      if (score > 0) {
        // Save to localStorage for non-logged in users
        localStorage.setItem('wordsGuessed', score.toString());
        localStorage.setItem('points', points.toString());
        
        // Save to database for logged in users
        if (user) {
          updateUserScore(user, score, points, completionTime);
        }
      }
    }
  });

  const handleSignOut = () => {
    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    });
  };

  // Initialize on first load
  useEffect(() => {
    initGame();
    
    // Show how to play on first visit
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    if (!hasVisited) {
      setIsHowToPlayOpen(true);
      localStorage.setItem('hasVisitedBefore', 'true');
    }

    // Load saved score from local storage if not logged in
    if (!user) {
      const savedScore = localStorage.getItem('wordsGuessed');
      const savedPoints = localStorage.getItem('points');
      if (savedScore) {
        setWordsGuessed(parseInt(savedScore, 10));
      }
      if (savedPoints) {
        setPoints(parseInt(savedPoints, 10));
      }
    }
  }, [initGame, user, setWordsGuessed, setPoints]);

  if (!gameState) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center min-h-screen">
      <Header onOpenHowToPlay={() => setIsHowToPlayOpen(true)}>
        <UserMenu user={user} onSignOut={handleSignOut} />
      </Header>
      
      <main className={`flex-1 w-full ${isMobile ? 'px-2' : 'max-w-md'} mx-auto flex flex-col justify-between py-4`}>
        <div className="flex-1 flex flex-col">
          <div className="text-center mb-2 flex justify-center space-x-4">
            <span className="text-sm font-medium">Words: {wordsGuessed}</span>
            <span className="text-sm font-medium text-primary">Points: {points}</span>
          </div>
          
          <GameTimer timeLeft={timeLeft} totalTime={60} />
          
          {!gameStarted ? (
            <GameStartScreen onStart={startGame} isLoggedIn={!!user} />
          ) : (
            <ActiveGameArea
              gameState={gameState}
              message={message}
              wordsGuessed={wordsGuessed}
              points={points}
              onKeyPress={handleKeyPress}
              onDelete={handleDeleteKey}
              onNewWord={handleNewWord}
            />
          )}
        </div>
      </main>
      
      {/* Single AdSense Banner at the bottom - Only on desktop */}
      {!isMobile && !gameStarted && (
        <div className="w-full flex justify-center py-2 bg-white/5 mt-4">
          <AdSense 
            adClient="ca-pub-8055550781914254" 
            adSlot="6361286418" 
            style={{ width: '100%', maxWidth: '320px', height: '100px' }} 
            className="ad-game-bottom"
          />
        </div>
      )}
      
      <HowToPlay 
        isOpen={isHowToPlayOpen} 
        onClose={() => setIsHowToPlayOpen(false)} 
      />
    </div>
  );
};

export default Index;
