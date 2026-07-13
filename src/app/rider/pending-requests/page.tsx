'use client'

import axios from "axios";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

const PendingRequest = () => {
    const [bookingRequests, setBookingRequests] = useState([]);
    const fetchPendingRequest = async () => {
        try {
            const { data } = await axios.get("/api/rider/booking/pending")
            console.log("THis is my booking request from ", data)
        } catch (error) {
            console.error("Error in fetching booking requests", error);
            return null
        }

    }
    useEffect(() => {
        fetchPendingRequest();
    }, [])
    return (
        <div>
            <h1>Hey its me </h1>
        </div>
    )
}
export default PendingRequest