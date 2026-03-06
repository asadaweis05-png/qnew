import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_FOOTBALL_KEY = Deno.env.get('API_FOOTBALL_KEY');
const BASE_URL = 'https://v3.football.api-sports.io';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endpoint, params = {} } = await req.json();
    
    console.log(`Fetching football data for endpoint: ${endpoint}`);
    
    if (!API_FOOTBALL_KEY) {
      console.error('API_FOOTBALL_KEY not configured');
      return new Response(JSON.stringify({ 
        error: 'API key not configured',
        data: [] 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const headers = {
      'x-rapidapi-key': API_FOOTBALL_KEY,
      'x-rapidapi-host': 'v3.football.api-sports.io'
    };

    let url = '';
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    switch (endpoint) {
      case 'livescores':
        url = `${BASE_URL}/fixtures?live=all`;
        break;
      
      case 'fixtures_today':
        url = `${BASE_URL}/fixtures?date=${today}`;
        break;
      
      case 'fixtures_tomorrow':
        url = `${BASE_URL}/fixtures?date=${tomorrow}`;
        break;
      
      case 'results_yesterday':
        url = `${BASE_URL}/fixtures?date=${yesterday}`;
        break;
      
      case 'leagues':
        // Get all leagues, not just current season
        url = `${BASE_URL}/leagues`;
        break;
      
      case 'standings':
        const leagueId = params.league_id || 39; // Default to Premier League
        const season = params.season || 2024;
        url = `${BASE_URL}/standings?league=${leagueId}&season=${season}`;
        break;
      
      case 'top_scorers':
        const scorerLeagueId = params.league_id || 39;
        const scorerSeason = params.season || 2024;
        url = `${BASE_URL}/players/topscorers?league=${scorerLeagueId}&season=${scorerSeason}`;
        break;
      
      default:
        return new Response(JSON.stringify({ 
          error: 'Invalid endpoint',
          data: [] 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    console.log(`Calling API: ${url}`);
    
    const response = await fetch(url, { headers });
    const responseText = await response.text();
    
    console.log(`API Response status: ${response.status}`);
    console.log(`API Response headers:`, JSON.stringify(Object.fromEntries(response.headers.entries())));
    console.log(`API Response body (first 500 chars):`, responseText.substring(0, 500));
    
    if (!response.ok) {
      console.error(`API error: ${response.status} - ${responseText}`);
      return new Response(JSON.stringify({ 
        error: `API error: ${response.status}`,
        details: responseText,
        data: [] 
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse JSON response:', responseText.substring(0, 200));
      return new Response(JSON.stringify({ 
        data: [], 
        error: 'API returned non-JSON response' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Check for API errors in response
    if (data.errors && Object.keys(data.errors).length > 0) {
      console.error('API returned errors:', JSON.stringify(data.errors));
      return new Response(JSON.stringify({ 
        error: 'API error',
        details: data.errors,
        data: [] 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log('API Response results:', data.results || 0);

    // Transform API-Football response to a consistent format
    let transformedData = [];
    
    if (endpoint === 'livescores' || endpoint === 'fixtures_today' || 
        endpoint === 'fixtures_tomorrow' || endpoint === 'results_yesterday') {
      transformedData = (data.response || []).map((fixture: any) => ({
        id: fixture.fixture.id,
        home_team: fixture.teams.home.name,
        away_team: fixture.teams.away.name,
        home_team_logo: fixture.teams.home.logo,
        away_team_logo: fixture.teams.away.logo,
        home_score: fixture.goals.home,
        away_score: fixture.goals.away,
        status: fixture.fixture.status.short,
        status_long: fixture.fixture.status.long,
        time: fixture.fixture.status.elapsed,
        date: fixture.fixture.date,
        league_name: fixture.league.name,
        league_logo: fixture.league.logo,
        league_country: fixture.league.country,
        venue: fixture.fixture.venue?.name || 'TBD'
      }));
    } else if (endpoint === 'leagues') {
      // Filter to get major/popular leagues with 2024 season
      const popularLeagueIds = [39, 140, 135, 78, 61, 94, 88, 144, 203, 71, 2, 3]; // Premier League, La Liga, Serie A, Bundesliga, Ligue 1, etc.
      const allLeagues = data.response || [];
      
      // Filter leagues that have 2024 season and prioritize popular ones
      const leaguesWithSeason = allLeagues.filter((league: any) => {
        return league.seasons?.some((s: any) => s.year === 2024);
      });
      
      // Prioritize popular leagues, then add others
      const sortedLeagues = leaguesWithSeason.sort((a: any, b: any) => {
        const aPopular = popularLeagueIds.indexOf(a.league.id);
        const bPopular = popularLeagueIds.indexOf(b.league.id);
        if (aPopular !== -1 && bPopular !== -1) return aPopular - bPopular;
        if (aPopular !== -1) return -1;
        if (bPopular !== -1) return 1;
        return 0;
      });
      
      transformedData = sortedLeagues.slice(0, 40).map((league: any) => {
        const season2024 = league.seasons?.find((s: any) => s.year === 2024);
        return {
          id: league.league.id,
          name: league.league.name,
          logo: league.league.logo,
          country: league.country.name,
          country_flag: league.country.flag,
          season: season2024?.year || 2024
        };
      });
    } else if (endpoint === 'standings') {
      const standings = data.response?.[0]?.league?.standings?.[0] || [];
      transformedData = standings.map((team: any) => ({
        rank: team.rank,
        team_name: team.team.name,
        team_logo: team.team.logo,
        points: team.points,
        played: team.all.played,
        won: team.all.win,
        drawn: team.all.draw,
        lost: team.all.lose,
        goals_for: team.all.goals.for,
        goals_against: team.all.goals.against,
        goal_diff: team.goalsDiff,
        form: team.form
      }));
    } else if (endpoint === 'top_scorers') {
      transformedData = (data.response || []).slice(0, 10).map((player: any) => ({
        player_name: player.player.name,
        player_photo: player.player.photo,
        team_name: player.statistics[0].team.name,
        team_logo: player.statistics[0].team.logo,
        goals: player.statistics[0].goals.total,
        assists: player.statistics[0].goals.assists || 0,
        appearances: player.statistics[0].games.appearences
      }));
    } else {
      transformedData = data.response || [];
    }

    return new Response(JSON.stringify({ 
      data: transformedData,
      results: data.results || transformedData.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Edge function error:', errorMessage);
    return new Response(JSON.stringify({ 
      error: errorMessage,
      data: [] 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
