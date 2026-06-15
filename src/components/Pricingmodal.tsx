'use client'
import react, { useState } from "react";
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'motion/react';
import { IVehicle } from "@/models/vehicle.model";
import { ImagePlus } from "lucide-react";
type PropsType = {
    open: boolean,
    onClose: (a: boolean) => void,
    data: IVehicle | null
}
const PricingModal = ({ open, onClose, data }: PropsType) => {
    const [image, setImage] = useState<File | null>();
    const [preview, setPreview] = useState<string | null>();
    const [baseFare, setBaseFare] = useState("");
    const [pricePerKM, setpricePerKM] = useState("");
    const [waitingCharge, setWaitingCharge] = useState("");
    return (
        <AnimatePresence>
            {open && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{
                    opacity: 0
                }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
                    <motion.div initial={{ scale: 0.85 }} animate={{ scale: 1 }} className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-bold">Pricing & Vehicle Image</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <label htmlFor="imageLabel" className="relative h-44 border-2 border-dashed rounded-2xl flex items-center justify-center cursor-pointer">
                                {!preview ? (<ImagePlus />) : (
                                    <img src={preview} className="absolute inset-0 w-full h-full object-cover rounded-2xl" alt="" />
                                )}
                                <input type="file" id='imageLabel' accept="image/*" hidden onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        setImage(e.target.files[0])
                                        setPreview(URL.createObjectURL(e.target.files[0]))

                                    }
                                }} />
                            </label>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default PricingModal