import { NextResponse } from 'next/server';
import { getTodaysRedSoxGames } from '@/lib/mlb-api';
import { sendDailyRedSoxEmail } from '@/lib/email-service';
import { parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

// Helper function to format game time for PST or EST
function formatGameTimeForTimezone(gameDate, timezone) {
    try {
        const utcDate = parseISO(gameDate);
        const timezoneMap = {
            'PST': 'America/Los_Angeles',
            'EST': 'America/New_York'
        };

        const ianaTz = timezoneMap[timezone] || 'America/Los_Angeles';
        const startTime = formatInTimeZone(utcDate, ianaTz, 'h:mm a');

        // Add 3 hours for typical baseball game duration
        const endDate = new Date(utcDate.getTime() + (3 * 60 * 60 * 1000));
        const endTime = formatInTimeZone(endDate, ianaTz, 'h:mm a');

        return `${startTime} - ${endTime}`;
    } catch (error) {
        console.error('Error formatting game time:', error);
        return 'TBD';
    }
}

export async function POST(request) {
    try {
        const { email, timezone } = await request.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { error: 'Valid email address is required' },
                { status: 400 }
            );
        }

        console.log(`Sending one-time Red Sox email to ${email} in ${timezone || 'PST'}...`);

        // Fetch today's Red Sox games
        const games = await getTodaysRedSoxGames();

        console.log(`Found ${games.length} games for today`);

        // Convert game times to selected timezone
        const gamesWithLocalTime = games.map(game => ({
            ...game,
            localTime: timezone ? formatGameTimeForTimezone(game.gameDate, timezone) : game.vancouverTime
        }));

        // Send the email to the provided email address
        const emailResponse = await sendDailyRedSoxEmail(gamesWithLocalTime, email);

        console.log('One-time Red Sox email sent successfully');

        return NextResponse.json({
            success: true,
            message: 'Red Sox email sent successfully',
            gameCount: gamesWithLocalTime.length,
            emailId: emailResponse.id,
            recipient: email,
            timezone: timezone || 'PST',
            games: gamesWithLocalTime.map(game => ({
                opponent: game.opponent.name,
                time: game.localTime || game.vancouverTime,
                location: game.location,
                status: game.status,
                venue: game.venue.name
            }))
        });

    } catch (error) {
        console.error('Error in one-time Red Sox email:', error);

        return NextResponse.json(
            {
                error: 'Failed to send Red Sox email',
                details: error.message
            },
            { status: 500 }
        );
    }
}
