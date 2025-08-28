import { NextResponse } from 'next/server';
import { getTodaysRedSoxGames } from '@/lib/mlb-api';
import { sendDailyRedSoxEmail, sendTestEmail } from '@/lib/email-service';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const testMode = searchParams.get('test') === 'true';

        const recipientEmail = process.env.RECIPIENT_EMAIL;
        if (!recipientEmail) {
            return NextResponse.json(
                { error: 'RECIPIENT_EMAIL environment variable not set' },
                { status: 500 }
            );
        }

        if (testMode) {
            console.log('Sending test email...');
            const emailResponse = await sendTestEmail(recipientEmail);

            return NextResponse.json({
                success: true,
                message: 'Test email sent successfully',
                emailId: emailResponse.id,
                recipient: recipientEmail
            });
        }

        // Fetch real games
        console.log('Fetching real Red Sox games for today...');
        const games = await getTodaysRedSoxGames();

        console.log(`Found ${games.length} games for today`);

        // Send the email
        const emailResponse = await sendDailyRedSoxEmail(games, recipientEmail);

        return NextResponse.json({
            success: true,
            message: 'Red Sox email sent successfully',
            gameCount: games.length,
            emailId: emailResponse.id,
            recipient: recipientEmail,
            games: games.map(game => ({
                opponent: game.opponent.name,
                time: game.vancouverTime,
                location: game.location,
                status: game.status,
                venue: game.venue.name
            }))
        });

    } catch (error) {
        console.error('Error in test email endpoint:', error);

        return NextResponse.json(
            {
                error: 'Failed to send test email',
                details: error.message
            },
            { status: 500 }
        );
    }
}
