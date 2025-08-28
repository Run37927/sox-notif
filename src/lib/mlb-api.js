import { format, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

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
 * Formats game time to Vancouver timezone with start and end times
 * @param {string} gameDate - ISO date string from MLB API
 * @returns {string} Formatted time range in Vancouver timezone (e.g., "10:05 AM - 1:05 PM")
 */
export function formatGameTimeForVancouver(gameDate) {
    try {
        const utcDate = parseISO(gameDate);
        const startTime = formatInTimeZone(utcDate, 'America/Vancouver', 'h:mm a');

        // Add 3 hours for typical baseball game duration
        const endDate = new Date(utcDate.getTime() + (3 * 60 * 60 * 1000));
        const endTime = formatInTimeZone(endDate, 'America/Vancouver', 'h:mm a');

        return `${startTime} - ${endTime}`;
    } catch (error) {
        console.error('Error formatting game time:', error, 'for date:', gameDate);
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
        // Just use the current date since we're formatting it as YYYY-MM-DD anyway
        const games = await getRedSoxGamesForDate(now);

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
