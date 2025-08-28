import { NextResponse } from 'next/server';
import { getRedSoxGamesForDate, formatGameTimeForVancouver } from '@/lib/mlb-api';
import { sendDailyRedSoxEmail } from '@/lib/email-service';

export async function GET(request) {
    try {
        const recipientEmail = process.env.RECIPIENT_EMAIL;
        if (!recipientEmail) {
            return NextResponse.json(
                { error: 'RECIPIENT_EMAIL environment variable not set' },
                { status: 500 }
            );
        }

        // Use today's actual date (August 28, 2025) to get the real Red Sox @ Orioles game
        const today = new Date('2025-08-28');

        console.log('Fetching Red Sox games for today (August 28, 2025)...');
        const games = await getRedSoxGamesForDate(today);

        console.log(`Found ${games.length} games for today`);

        // Process games to add Vancouver times and opponent info
        const processedGames = games.map(game => ({
            ...game,
            vancouverTime: formatGameTimeForVancouver(game.gameDate),
            opponent: game.isHomeGame ? game.awayTeam : game.homeTeam,
            location: game.isHomeGame ? 'vs' : '@'
        }));

        // Send the email
        const emailResponse = await sendDailyRedSoxEmail(processedGames, recipientEmail);

        return NextResponse.json({
            success: true,
            message: 'Today\'s Red Sox email sent successfully!',
            gameCount: processedGames.length,
            emailId: emailResponse.id,
            recipient: recipientEmail,
            games: processedGames.map(game => ({
                opponent: game.opponent.name,
                time: game.vancouverTime,
                location: game.location,
                status: game.status,
                venue: game.venue.name,
                gameDate: game.gameDate
            }))
        });

    } catch (error) {
        console.error('Error sending today\'s Red Sox email:', error);

        return NextResponse.json(
            {
                error: 'Failed to send today\'s Red Sox email',
                details: error.message
            },
            { status: 500 }
        );
    }
}
