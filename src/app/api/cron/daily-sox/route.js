import { NextResponse } from 'next/server';
import { getTodaysRedSoxGames } from '@/lib/mlb-api';
import { sendDailyRedSoxEmail } from '@/lib/email-service';

export async function GET(request) {
    try {
        // Verify this is a Vercel cron job request
        const userAgent = request.headers.get('user-agent');
        if (!userAgent || !userAgent.includes('vercel-cron')) {
            return NextResponse.json(
                { error: 'Unauthorized - This endpoint is only for Vercel cron jobs' },
                { status: 401 }
            );
        }

        console.log('Daily Red Sox cron job started...');

        // Get your email from environment variables
        const recipientEmail = process.env.RECIPIENT_EMAIL;
        if (!recipientEmail) {
            console.error('RECIPIENT_EMAIL environment variable not set');
            return NextResponse.json(
                { error: 'Recipient email not configured' },
                { status: 500 }
            );
        }

        // Fetch today's Red Sox games
        console.log('Fetching today\'s Red Sox games...');
        const games = await getTodaysRedSoxGames();

        console.log(`Found ${games.length} games for today`);

        // Send the email
        console.log(`Sending daily email to ${recipientEmail}...`);
        const emailResponse = await sendDailyRedSoxEmail(games, recipientEmail);

        console.log('Daily Red Sox email sent successfully');

        return NextResponse.json({
            success: true,
            message: 'Daily Red Sox email sent successfully',
            gameCount: games.length,
            emailId: emailResponse.id,
            games: games.map(game => ({
                opponent: game.opponent.name,
                time: game.vancouverTime,
                location: game.location,
                status: game.status
            }))
        });

    } catch (error) {
        console.error('Error in daily Red Sox cron job:', error);

        return NextResponse.json(
            {
                error: 'Failed to send daily Red Sox email',
                details: error.message
            },
            { status: 500 }
        );
    }
}

// Also handle POST requests for manual testing
export async function POST(request) {
    try {
        console.log('Manual trigger of daily Red Sox email...');

        const recipientEmail = process.env.RECIPIENT_EMAIL;
        if (!recipientEmail) {
            console.error('RECIPIENT_EMAIL environment variable not set');
            return NextResponse.json(
                { error: 'Recipient email not configured' },
                { status: 500 }
            );
        }

        // Fetch today's Red Sox games
        const games = await getTodaysRedSoxGames();

        // Send the email
        const emailResponse = await sendDailyRedSoxEmail(games, recipientEmail);

        return NextResponse.json({
            success: true,
            message: 'Daily Red Sox email sent successfully (manual trigger)',
            gameCount: games.length,
            emailId: emailResponse.id,
            games: games.map(game => ({
                opponent: game.opponent.name,
                time: game.vancouverTime,
                location: game.location,
                status: game.status
            }))
        });

    } catch (error) {
        console.error('Error in manual Red Sox email trigger:', error);

        return NextResponse.json(
            {
                error: 'Failed to send daily Red Sox email',
                details: error.message
            },
            { status: 500 }
        );
    }
}
