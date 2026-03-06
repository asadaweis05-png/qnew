import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTopScores } from '@/lib/userScores';
import Header from '@/components/Header';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Clock, Star } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import AdSense from '@/components/AdSense';

const Leaderboard: React.FC = () => {
  const { data: scores, isLoading, error } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => getTopScores(20)
  });
  
  const isMobile = useIsMobile();

  const formatTime = (seconds: number) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate time efficiency as percentage (lower is better)
  const getEfficiencyPercentage = (time: number, wordCount: number) => {
    if (!time || !wordCount) return "N/A";
    // Average time per word as percentage of total allowed time (60 seconds)
    const avgTimePerWord = time / wordCount;
    const efficiency = 100 - ((avgTimePerWord / 60) * 100);
    return `${Math.round(Math.max(0, Math.min(100, efficiency)))}%`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onOpenHowToPlay={() => {}} />
      
      {/* Single AdSense Banner at the top - Only on desktop */}
      {!isMobile && (
        <div className="w-full flex justify-center py-2 bg-white/5">
          <AdSense 
            adClient="ca-pub-8055550781914254" 
            adSlot="6361286418" 
            style={{ width: '100%', maxWidth: '320px', height: '100px' }} 
            className="ad-leaderboard-top"
          />
        </div>
      )}
      
      <main className="flex-1 container mx-auto py-4 px-2 sm:py-8 sm:px-4 max-w-4xl">
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold">Leaderboard</h1>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/play" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Game
            </Link>
          </Button>
        </div>
        
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="p-4 border border-red-300 bg-red-50 text-red-700 rounded-md">
            Failed to load leaderboard data. Please try again later.
          </div>
        ) : scores && scores.length > 0 ? (
          <div className="overflow-x-auto -mx-2 px-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={isMobile ? "w-12 px-2" : "w-16"}>Rank</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Trophy className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                      <span>{isMobile ? "Pts" : "Points"}</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                      <span>Words</span>
                    </div>
                  </TableHead>
                  {!isMobile && (
                    <TableHead className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Efficiency</span>
                      </div>
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {scores.map((score, index) => (
                  <TableRow key={score.id} className={index < 3 ? "bg-primary-50" : ""}>
                    <TableCell className="font-medium">
                      <div className={`flex items-center justify-center ${isMobile ? 'w-6 h-6 text-sm' : 'w-8 h-8'} rounded-full ${
                        index === 0 ? "bg-yellow-100 text-yellow-700" : 
                        index === 1 ? "bg-gray-100 text-gray-700" : 
                        index === 2 ? "bg-amber-100 text-amber-700" : 
                        "bg-slate-50 text-slate-700"
                      }`}>
                        {index + 1}
                      </div>
                    </TableCell>
                    <TableCell className={isMobile ? "max-w-[100px] truncate" : ""}>
                      {score.profile?.display_name || score.profile?.username || 'Anonymous Player'}
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {score.points || 0}
                    </TableCell>
                    <TableCell className="text-center">
                      {score.score}
                    </TableCell>
                    {!isMobile && (
                      <TableCell className="text-right">
                        {getEfficiencyPercentage(score.completion_time, score.score)}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center p-8 text-gray-500">
            No scores yet. Be the first to play and get on the leaderboard!
          </div>
        )}
      </main>
    </div>
  );
};

export default Leaderboard;
