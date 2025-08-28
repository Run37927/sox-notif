import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Generates HTML email content for Red Sox games
 * @param {Array} games - Array of game objects
 * @returns {string} HTML email content
 */
function generateEmailHTML(games) {
    if (games.length === 0) {
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Red Sox Today</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #C8102E 0%, #BD3039 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">⚾ Red Sox Today</h1>
            <p style="color: #FFE5E5; margin: 10px 0 0 0; font-size: 16px;">Your daily Boston Red Sox update</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 12px; text-align: center; border-left: 4px solid #C8102E;">
            <h2 style="color: #C8102E; margin: 0 0 15px 0; font-size: 24px;">No Games Today</h2>
            <p style="color: #666; font-size: 18px; margin: 0;">The Red Sox have no games scheduled for today. Enjoy your day off!</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 14px;">
            <p>Boston Red Sox Daily Notifications • Vancouver Time</p>
          </div>
        </body>
      </html>
    `;
    }

    const gamesHTML = games.map(game => {
        const isHome = game.location === 'vs';
        const locationText = isHome ? 'vs' : '@';
        const venueText = isHome ? 'Fenway Park' : `${game.venue.name}`;

        return `
      <div style="background: white; border: 1px solid #e1e5e9; border-radius: 8px; padding: 20px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
          <h3 style="color: #C8102E; margin: 0; font-size: 18px; font-weight: bold;">
            Red Sox ${locationText} ${game.opponent.name}
          </h3>
          <span style="background: #C8102E; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: bold;">
            ${game.vancouverTime}
          </span>
        </div>
        
        <div style="color: #666; font-size: 14px;">
          <p style="margin: 5px 0;">📍 ${venueText}</p>
          <p style="margin: 5px 0;">🕐 Vancouver Time</p>
          ${game.status !== 'Scheduled' ? `<p style="margin: 5px 0; color: #C8102E; font-weight: bold;">Status: ${game.status}</p>` : ''}
        </div>
      </div>
    `;
    }).join('');

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Red Sox Today</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: linear-gradient(135deg, #C8102E 0%, #BD3039 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">⚾ Red Sox Today</h1>
          <p style="color: #FFE5E5; margin: 10px 0 0 0; font-size: 16px;">Your daily Boston Red Sox update</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h2 style="color: #C8102E; margin: 0 0 20px 0; font-size: 22px; text-align: center;">
            ${games.length} Game${games.length > 1 ? 's' : ''} Today
          </h2>
          ${gamesHTML}
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #999; font-size: 14px;">
          <p>Boston Red Sox Daily Notifications • Vancouver Time</p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generates plain text email content for Red Sox games
 * @param {Array} games - Array of game objects
 * @returns {string} Plain text email content
 */
function generateEmailText(games) {
    if (games.length === 0) {
        return `RED SOX TODAY

No games scheduled for today. Enjoy your day off!

---
Boston Red Sox Daily Notifications
Vancouver Time`;
    }

    const gamesText = games.map(game => {
        const isHome = game.location === 'vs';
        const locationText = isHome ? 'vs' : '@';
        const venueText = isHome ? 'Fenway Park' : game.venue.name;

        return `Red Sox ${locationText} ${game.opponent.name}
Time: ${game.vancouverTime} (Vancouver Time)
Venue: ${venueText}${game.status !== 'Scheduled' ? `\nStatus: ${game.status}` : ''}`;
    }).join('\n\n');

    return `RED SOX TODAY

${games.length} game${games.length > 1 ? 's' : ''} scheduled for today:

${gamesText}

---
Boston Red Sox Daily Notifications
Vancouver Time`;
}

/**
 * Sends daily Red Sox email notification
 * @param {Array} games - Array of game objects
 * @param {string} toEmail - Recipient email address
 * @returns {Promise<Object>} Resend response
 */
export async function sendDailyRedSoxEmail(games, toEmail) {
    try {
        const gameCount = games.length;
        const subject = gameCount === 0
            ? 'Red Sox Today: No games today'
            : `Red Sox Today: ${gameCount} game${gameCount > 1 ? 's' : ''}`;

        const htmlContent = generateEmailHTML(games);
        const textContent = generateEmailText(games);

        console.log(`Sending Red Sox email to ${toEmail} with subject: ${subject}`);

        const response = await resend.emails.send({
            from: 'Red Sox Notifier <onboarding@resend.dev>', // You can customize this
            to: [toEmail],
            subject: subject,
            html: htmlContent,
            text: textContent,
        });

        console.log('Email sent successfully:', response);
        return response;

    } catch (error) {
        console.error('Error sending Red Sox email:', error);
        throw error;
    }
}

/**
 * Sends a test email to verify the service is working
 * @param {string} toEmail - Recipient email address
 * @returns {Promise<Object>} Resend response
 */
export async function sendTestEmail(toEmail) {
    try {
        const mockGames = [
            {
                gameId: 'test-123',
                gameDate: new Date().toISOString(),
                status: 'Scheduled',
                homeTeam: { name: 'Boston Red Sox', abbreviation: 'BOS' },
                awayTeam: { name: 'New York Yankees', abbreviation: 'NYY' },
                venue: { name: 'Fenway Park', city: 'Boston', state: 'MA' },
                isHomeGame: true,
                vancouverTime: '7:10 PM',
                opponent: { name: 'New York Yankees', abbreviation: 'NYY' },
                location: 'vs'
            }
        ];

        return await sendDailyRedSoxEmail(mockGames, toEmail);
    } catch (error) {
        console.error('Error sending test email:', error);
        throw error;
    }
}
