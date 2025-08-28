import { format, parseISO } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime, format as formatTz } from 'date-fns-tz';

const MLB_API_BASE = 'https://statsapi.mlb.com/api/v1';
const RED_SOX_TEAM_ID = 111; // Boston Red Sox team ID

/**
 * Fetches Red Sox games for a specific date
 * @param {Date} date - The date to fetch games for
 * @returns {Promise<Array>} Array of game objects
 */
export async function getRedSoxGamesForDate(date) {
    try {
        // Format date as YYYY-MM-DD for MLB API
        const dateString = format(date, 'yyyy-MM-dd');

        const url = `${MLB_API_BASE}/schedule?sportId=1&teamId=${RED_SOX_TEAM_ID}&date=${dateString}&hydrate=team,linescore,venue`;

        console.log(`Fetching Red Sox games for ${dateString}...`);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`MLB API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Extract games from the response
        const games = data.dates?.[0]?.games || [];

        console.log(`Found ${games.length} Red Sox games for ${dateString}`);

        return games.map(game => ({
            gameId: game.gamePk,
            gameDate: game.gameDate,
            status: game.status.detailedState,
            homeTeam: {
                name: game.teams.home.team.name,
                abbreviation: game.teams.home.team.abbreviation
            },
            awayTeam: {
                name: game.teams.away.team.name,
                abbreviation: game.teams.away.team.abbreviation
            },
            venue: {
                name: game.venue.name,
                city: game.venue.location?.city,
                state: game.venue.location?.state
            },
            isHomeGame: game.teams.home.team.id === RED_SOX_TEAM_ID
        }));

    } catch (error) {
        console.error('Error fetching Red Sox games:', error);
        throw error;
    }
}

/**
 * Formats game time to Vancouver timezone
 * @param {string} gameDate - ISO date string from MLB API
 * @returns {string} Formatted time in Vancouver timezone
 */
export function formatGameTimeForVancouver(gameDate) {
    try {
        const utcDate = parseISO(gameDate);
        const vancouverTime = utcToZonedTime(utcDate, 'America/Vancouver');
        return formatTz(vancouverTime, 'h:mm a', { timeZone: 'America/Vancouver' });
    } catch (error) {
        console.error('Error formatting game time:', error);
        return 'TBD';
    }
}

/**
 * Gets today's Red Sox games with Vancouver times
 * @returns {Promise<Array>} Array of formatted game objects
 */
export async function getTodaysRedSoxGames() {
    try {
        // Get today's date in Vancouver timezone
        const now = new Date();
        const vancouverNow = utcToZonedTime(now, 'America/Vancouver');

        const games = await getRedSoxGamesForDate(vancouverNow);

        return games.map(game => ({
            ...game,
            vancouverTime: formatGameTimeForVancouver(game.gameDate),
            opponent: game.isHomeGame ? game.awayTeam : game.homeTeam,
            location: game.isHomeGame ? 'vs' : '@'
        }));

    } catch (error) {
        console.error('Error getting today\'s Red Sox games:', error);
        return [];
    }
}
