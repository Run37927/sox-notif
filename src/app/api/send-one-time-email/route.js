import { NextResponse } from 'next/server';
import { getTodaysRedSoxGames } from '@/lib/mlb-api';
import { sendDailyRedSoxEmail } from '@/lib/email-service';

export async function POST(request) {
    try {
        const { email } = await request.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { error: 'Valid email address is required' },
                { status: 400 }
            );
        }

        console.log(`Sending one-time Red Sox email to ${email}...`);

        // Fetch today's Red Sox games
        const games = await getTodaysRedSoxGames();

        console.log(`Found ${games.length} games for today`);

        // Send the email to the provided email address
        const emailResponse = await sendDailyRedSoxEmail(games, email);

        console.log('One-time Red Sox email sent successfully');

        return NextResponse.json({
            success: true,
            message: 'Red Sox email sent successfully',
            gameCount: games.length,
            emailId: emailResponse.id,
            recipient: email,
            games: games.map(game => ({
                opponent: game.opponent.name,
                time: game.vancouverTime,
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
