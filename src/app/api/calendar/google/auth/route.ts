import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { auth } from '@/auth';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.AUTH_URL || 'http://localhost:3000';
        
        const oauth2Client = new google.auth.OAuth2(
            process.env.AUTH_GOOGLE_ID,
            process.env.AUTH_GOOGLE_SECRET,
            `${baseUrl}/api/calendar/google/callback`
        );

        const scopes = [
            'https://www.googleapis.com/auth/calendar.events'
        ];

        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent', // Force consent to get a refresh token
            scope: scopes,
            state: session.user.id // Pass the user ID in the state parameter
        });

        return NextResponse.redirect(url);
    } catch (error) {
        console.error("Google Auth Error:", error);
        return NextResponse.json({ error: "Failed to generate auth url" }, { status: 500 });
    }
}
