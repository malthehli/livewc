"use server";

export interface LiveMatch {
  id: string;
  date: string; // ISO string
  status: 'STATUS_SCHEDULED' | 'STATUS_IN_PROGRESS' | 'STATUS_FINAL' | string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  homeLogo: string;
  awayLogo: string;
}

export async function getLiveWorldCupMatches(): Promise<LiveMatch[]> {
  try {
    // Fetching live World Cup matches
    const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard', {
      next: { revalidate: 15 } // revalidate every 15 seconds
    });
    
    if (!res.ok) return [];
    
    const data = await res.json();
    
    if (!data.events || data.events.length === 0) return [];
    
    return data.events.map((event: any) => {
      const comp = event.competitions[0];
      const home = comp.competitors.find((c: any) => c.homeAway === 'home');
      const away = comp.competitors.find((c: any) => c.homeAway === 'away');
      
      return {
        id: event.id,
        date: event.date,
        status: event.status.type.name,
        homeTeam: home.team.displayName,
        awayTeam: away.team.displayName,
        homeScore: parseInt(home.score) >= 0 ? parseInt(home.score) : null,
        awayScore: parseInt(away.score) >= 0 ? parseInt(away.score) : null,
        homeLogo: home.team.logo,
        awayLogo: away.team.logo,
      };
    });
  } catch (error) {
    console.error("Error fetching ESPN API", error);
    return [];
  }
}
