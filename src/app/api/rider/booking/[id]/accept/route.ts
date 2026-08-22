import { logger } from "@/lib/logger";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import axios from "axios";
import { NextRequest } from "next/server";

export async function GET(reque: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        await connectDb();
        const { id } = await context.params;
        if (!id) {
            return Response.json({
                message: "Booking id is required"
            }, { status: 400 })
        }
        const booking = await Booking.findById(id).populate('user rider');

        if (!booking || booking.bookingStatus != "requested") {
            return Response.json({
                message: "Booking not found or status is not requested"
            }, { status: 400 })
        }
        booking.bookingStatus = "awaiting_payment"
        booking.paymentDeadline = new Date(Date.now() + 5 * 60 * 1000);
        await booking.save();
        await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/emit`, {
            event: "booking-accepted",
            to: booking.user._id,
            data: booking.bookingStatus
        })

        // Trigger Google Calendar event creation
        logger.info(`Checking if user has Google Calendar connected... User ID: ${booking.user._id}, Has token: ${!!booking.user.googleCalendarRefreshToken}`);
        
        if (booking.user && booking.user.googleCalendarRefreshToken) {
            logger.info('Google Calendar refresh token found. Triggering createRideEvent...');
            import('@/lib/googleCalendar').then(({ createRideEvent }) => {
                createRideEvent(
                    booking.user.googleCalendarRefreshToken,
                    booking.rider ? booking.rider.name : 'your driver',
                    booking.pickupAddress,
                    booking.dropAddress
                ).then(() => logger.info("Calendar event creation promise resolved!"))
                 .catch(err => logger.error("Failed to create calendar event:", err));
            });
        } else {
            logger.info('No Google Calendar refresh token found for this user. Skipping event creation.');
        }
        return Response.json({
            message: "Booking accepted successfully"
        }, { status: 200 })

    } catch (error: any) {
        logger.error("Error accepting booking", error);
        return Response.json({
            message: `Internal server error at accept booking ${error}`
        }, { status: 500 })
    }
}