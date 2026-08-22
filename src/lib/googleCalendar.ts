import { google } from 'googleapis';
import { logger } from './logger';

export const getGoogleCalendarClient = (refreshToken: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.AUTH_URL || 'http://localhost:3000';

    const oauth2Client = new google.auth.OAuth2(
        process.env.AUTH_GOOGLE_ID,
        process.env.AUTH_GOOGLE_SECRET,
        `${baseUrl}/api/calendar/google/callback` // Though not strictly needed for just using the refresh token, it's good practice
    );

    oauth2Client.setCredentials({ refresh_token: refreshToken });
    return google.calendar({ version: 'v3', auth: oauth2Client });
};

export const createRideEvent = async (
    refreshToken: string,
    riderName: string,
    pickupAddress: string,
    dropAddress: string
) => {
    try {
        const calendar = getGoogleCalendarClient(refreshToken);

        // Since no specific time is required, just the date, we can use an all-day event for today
        const today = new Date();
        const dateString = today.toISOString().split('T')[0];

        const event = {
            summary: `Ride with ${riderName}`,
            description: `Pickup: ${pickupAddress}\nDrop: ${dropAddress}`,
            start: {
                date: dateString,
            },
            end: {
                date: dateString,
            },
        };

        logger.info(`Attempting to insert Google Calendar event with payload: ${JSON.stringify(event)}`);
        
        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
        });

        logger.info(`Google Calendar API Response status: ${response.status}`);
        logger.info(`Calendar event successfully created. Link: ${response.data.htmlLink}`);
        return response.data;
    } catch (error: any) {
        logger.error('Google Calendar API Error Details:', error?.response?.data || error);
        throw error;
    }
};
