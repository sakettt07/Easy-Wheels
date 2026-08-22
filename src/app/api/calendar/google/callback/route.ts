import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import connectDb from '@/lib/db';
import User from '@/models/user.model';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get('code');
        const userId = searchParams.get('state'); // We passed the user ID in the state parameter

        if (!code || !userId) {
            return NextResponse.redirect(new URL('/user/bookings?error=calendar_auth_failed', request.url));
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.AUTH_URL || 'http://localhost:3000';

        const oauth2Client = new google.auth.OAuth2(
            process.env.AUTH_GOOGLE_ID,
            process.env.AUTH_GOOGLE_SECRET,
            `${baseUrl}/api/calendar/google/callback`
        );

        const { tokens } = await oauth2Client.getToken(code);
        logger.info(`Google callback hit! State (User ID): ${userId}. Tokens received: ${Object.keys(tokens).join(', ')}`);

        if (tokens.refresh_token) {
            await connectDb();
            const updatedUser = await User.findByIdAndUpdate(userId, {
                googleCalendarRefreshToken: tokens.refresh_token
            }, { new: true });

            if (updatedUser) {
                logger.info(`Saved Google Calendar refresh token for user ${userId}`);
            } else {
                logger.error(`Failed to find user with ID ${userId} to save refresh token!`);
            }
        } else {
            // If they already authorized before, Google might not send a refresh token again
            // unless prompt=consent is used (which we did in auth/route.ts)
            logger.info(`No refresh token received for user ${userId}. Prompt consent might not have worked or token already exists.`);

            // Just for debugging, save access_token if refresh_token is missing, so we know it hit this code block
            await connectDb();
            await User.findByIdAndUpdate(userId, {
                googleCalendarRefreshToken: "access_token_fallback_for_debugging"
            });
        }

        return NextResponse.redirect(new URL('/user/bookings?calendar=connected', request.url));
    } catch (error: any) {
        logger.error("Google Callback Error:", error);
        return NextResponse.redirect(new URL('/user/bookings?error=calendar_callback_failed', request.url));
    }
}
