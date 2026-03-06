import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Trophy, Calendar, Activity, RefreshCw, Clock, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  home_team_logo?: string;
  away_team_logo?: string;
  home_score?: number;
  away_score?: number;
  status: string;
  status_long?: string;
  time?: number;
  date: string;
  league_name: string;
  league_logo?: string;
  league_country?: string;
  venue?: string;
}

interface Standing {
  rank: number;
  team_name: string;
  team_logo?: string;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_diff: number;
  form?: string;
}

interface League {
  id: number;
  name: string;
  logo?: string;
  country: string;
  country_flag?: string;
  season?: number;
}

const Football = () => {
  const navigate = useNavigate();
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [todayFixtures, setTodayFixtures] = useState<Match[]>([]);
  const [tomorrowFixtures, setTomorrowFixtures] = useState<Match[]>([]);
  const [yesterdayResults, setYesterdayResults] = useState<Match[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("live");
  const [selectedLeague, setSelectedLeague] = useState<number>(39); // Premier League

  const fetchData = async (endpoint: string, params?: Record<string, unknown>) => {
    try {
      const { data, error } = await supabase.functions.invoke('football-data', {
        body: { endpoint, params }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      return null;
    }
  };

  const loadData = async () => {
    setLoading(true);
    
    // First fetch leagues to get the correct season
    const leaguesData = await fetchData('leagues');
    const leaguesList: League[] = Array.isArray(leaguesData?.data) ? leaguesData.data : [];
    setLeagues(leaguesList);
    
    // Find the selected league to get its season
    const currentLeague = leaguesList.find(l => l.id === selectedLeague) || leaguesList[0];
    const leagueSeason = currentLeague?.season || 2024;
    
    const [
      liveData, 
      todayData, 
      tomorrowData, 
      yesterdayData,
      standingsData
    ] = await Promise.all([
      fetchData('livescores'),
      fetchData('fixtures_today'),
      fetchData('fixtures_tomorrow'),
      fetchData('results_yesterday'),
      fetchData('standings', { league_id: selectedLeague, season: leagueSeason })
    ]);

    if (liveData?.data) {
      setLiveMatches(Array.isArray(liveData.data) ? liveData.data : []);
    }
    if (todayData?.data) {
      setTodayFixtures(Array.isArray(todayData.data) ? todayData.data : []);
    }
    if (tomorrowData?.data) {
      setTomorrowFixtures(Array.isArray(tomorrowData.data) ? tomorrowData.data : []);
    }
    if (yesterdayData?.data) {
      setYesterdayResults(Array.isArray(yesterdayData.data) ? yesterdayData.data : []);
    }
    if (standingsData?.data) {
      setStandings(Array.isArray(standingsData.data) ? standingsData.data : []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [selectedLeague]);

  const formatTime = (datetime?: string) => {
    if (!datetime) return '';
    try {
      const date = new Date(datetime);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return '';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'LIVE':
      case '1H':
      case '2H':
      case 'HT':
      case 'ET':
        return 'text-green-500';
      case 'FT':
      case 'AET':
      case 'PEN':
        return 'text-muted-foreground';
      case 'PST':
      case 'CANC':
      case 'ABD':
        return 'text-red-500';
      case 'NS':
        return 'text-primary';
      default:
        return 'text-primary';
    }
  };

  const getStatusText = (status?: string, time?: number) => {
    switch (status?.toUpperCase()) {
      case 'LIVE':
      case '1H':
      case '2H':
        return time ? `${time}'` : 'LIVE';
      case 'HT':
        return 'Half Time';
      case 'FT':
        return 'Full Time';
      case 'NS':
        return 'Not Started';
      case 'PST':
        return 'Postponed';
      case 'CANC':
        return 'Cancelled';
      default:
        return status || '';
    }
  };

  const MatchCard = ({ match, showScore = true }: { match: Match; showScore?: boolean }) => (
    <Card className="bg-card/50 border-border/50 hover:bg-card/80 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <div className="flex items-center gap-2">
            {match.league_logo && (
              <img src={match.league_logo} alt="" className="w-4 h-4 object-contain" />
            )}
            <span className="truncate max-w-[150px]">{match.league_name}</span>
          </div>
          <span className={getStatusColor(match.status)}>
            {getStatusText(match.status, match.time)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex-1 text-right pr-3 flex items-center justify-end gap-2">
            <p className="font-medium text-sm truncate">{match.home_team}</p>
            {match.home_team_logo && (
              <img src={match.home_team_logo} alt="" className="w-6 h-6 object-contain" />
            )}
          </div>
          <div className="px-3 text-center min-w-[60px]">
            {showScore && (match.home_score !== undefined || match.away_score !== undefined) ? (
              <p className="text-lg font-bold text-primary">
                {match.home_score ?? 0} - {match.away_score ?? 0}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">{formatTime(match.date) || 'vs'}</p>
            )}
          </div>
          <div className="flex-1 text-left pl-3 flex items-center gap-2">
            {match.away_team_logo && (
              <img src={match.away_team_logo} alt="" className="w-6 h-6 object-contain" />
            )}
            <p className="font-medium text-sm truncate">{match.away_team}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const MatchSection = ({ title, icon: Icon, matches, showScore = true }: { 
    title: string; 
    icon: React.ComponentType<{ className?: string }>;
    matches: Match[];
    showScore?: boolean;
  }) => (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">{title}</h3>
        <span className="text-xs text-muted-foreground">({matches.length})</span>
      </div>
      {matches.length > 0 ? (
        <div className="space-y-2">
          {matches.slice(0, 15).map((match, index) => (
            <MatchCard key={match.id || index} match={match} showScore={showScore} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          No matches available
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Football Scores</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={loadData}
            disabled={loading}
            className="ml-auto"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start px-4 bg-transparent border-b border-border rounded-none overflow-x-auto">
          <TabsTrigger value="live" className="flex items-center gap-1.5 text-xs">
            <Activity className="h-3.5 w-3.5" />
            Live
          </TabsTrigger>
          <TabsTrigger value="today" className="flex items-center gap-1.5 text-xs">
            <Calendar className="h-3.5 w-3.5" />
            Today
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center gap-1.5 text-xs">
            <Clock className="h-3.5 w-3.5" />
            Tomorrow
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-1.5 text-xs">
            <History className="h-3.5 w-3.5" />
            Results
          </TabsTrigger>
          <TabsTrigger value="standings" className="flex items-center gap-1.5 text-xs">
            <Trophy className="h-3.5 w-3.5" />
            Standings
          </TabsTrigger>
        </TabsList>

        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <TabsContent value="live" className="mt-0">
                <MatchSection 
                  title="Live Matches" 
                  icon={Activity} 
                  matches={liveMatches} 
                />
                {liveMatches.length === 0 && (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No live matches right now</p>
                    <p className="text-xs text-muted-foreground mt-1">Check today's fixtures</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="today" className="mt-0">
                <MatchSection 
                  title="Today's Matches" 
                  icon={Calendar} 
                  matches={todayFixtures}
                  showScore={true}
                />
              </TabsContent>

              <TabsContent value="upcoming" className="mt-0">
                <MatchSection 
                  title="Tomorrow's Matches" 
                  icon={Clock} 
                  matches={tomorrowFixtures}
                  showScore={false}
                />
              </TabsContent>

              <TabsContent value="results" className="mt-0">
                <MatchSection 
                  title="Yesterday's Results" 
                  icon={History} 
                  matches={yesterdayResults}
                  showScore={true}
                />
              </TabsContent>

              <TabsContent value="standings" className="mt-0">
                {leagues.length > 0 && (
                  <div className="mb-4">
                    <select 
                      value={selectedLeague}
                      onChange={(e) => setSelectedLeague(Number(e.target.value))}
                      className="w-full p-2 rounded-md bg-card border border-border text-sm"
                    >
                      {leagues.map((league) => (
                        <option key={league.id} value={league.id}>
                          {league.name} ({league.country})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {standings.length > 0 ? (
                  <Card className="bg-card/50 border-border/50">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-border bg-muted/30">
                              <th className="text-left p-2 w-8">#</th>
                              <th className="text-left p-2">Team</th>
                              <th className="text-center p-2 w-8">P</th>
                              <th className="text-center p-2 w-8">W</th>
                              <th className="text-center p-2 w-8">D</th>
                              <th className="text-center p-2 w-8">L</th>
                              <th className="text-center p-2 w-10">GF</th>
                              <th className="text-center p-2 w-10">GA</th>
                              <th className="text-center p-2 w-10">GD</th>
                              <th className="text-center p-2 w-10 font-bold">Pts</th>
                            </tr>
                          </thead>
                          <tbody>
                            {standings.map((team, index) => (
                              <tr key={index} className="border-b border-border/50 hover:bg-muted/20">
                                <td className="p-2 font-medium">{team.rank}</td>
                                <td className="p-2">
                                  <div className="flex items-center gap-2">
                                    {team.team_logo && (
                                      <img src={team.team_logo} alt="" className="w-4 h-4 object-contain" />
                                    )}
                                    <span className="font-medium truncate max-w-[100px]">{team.team_name}</span>
                                  </div>
                                </td>
                                <td className="text-center p-2">{team.played}</td>
                                <td className="text-center p-2 text-green-500">{team.won}</td>
                                <td className="text-center p-2">{team.drawn}</td>
                                <td className="text-center p-2 text-red-500">{team.lost}</td>
                                <td className="text-center p-2">{team.goals_for}</td>
                                <td className="text-center p-2">{team.goals_against}</td>
                                <td className="text-center p-2">{team.goal_diff}</td>
                                <td className="text-center p-2 font-bold text-primary">{team.points}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No standings available</p>
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default Football;
