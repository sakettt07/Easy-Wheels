'use client'
import react from "react";
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'motion/react';
import { IVehicle } from "@/models/vehicle.model";
type PropsType = {
    open: boolean,
    onClose: (a: boolean) => void,
    data: IVehicle | null
}
const PricingModal = ({ open, onClose, data }: PropsType) => {
    return (
        <div>
            <h1>PricingModal</h1>
        </div>
    )
}

export default PricingModal