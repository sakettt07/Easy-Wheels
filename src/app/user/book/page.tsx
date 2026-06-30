'use client'
import React, { useState } from 'react'
import { motion } from "motion/react";
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bike, Car, Package, Truck, Zap } from 'lucide-react';
import { vehicleType } from '@/models/vehicle.model';
import axios from 'axios';
import { p } from 'motion/react-client';

const stepVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 }
}
const vehicles = [
  { id: "bike", label: "Bike", icon: Bike, desc: "2W" },
  { id: "auto", label: "Auto", icon: Car, desc: "3W" },
  { id: "car", label: "Car", icon: Car, desc: "4W" },
  { id: "loader", label: "Loader", icon: Package, desc: "Goods" },
  { id: "traveller", label: "Traveller", icon: Truck, desc: "Family" },
  { id: "ev", label: "EV", icon: Zap, desc: "Eco" },
]

const page = () => {
  const router = useRouter();
  const [vehicle, setVehicle] = useState<vehicleType>();
  const [mobile, setMobile] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropAddress, setDropAddress] = useState("");
  const [pickupCountry, setPickupCountry] = useState("");
  const [pickupLat, setPickupLat] = useState("");
  const [pickupLon, setPickupLon] = useState("");

  const progress = [!!vehicle, !!mobile, !!pickupAddress, !!dropAddress].filter(Boolean).length;

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const { data } = await axios.get(`https:photon.komoot.io/reverse?lon=${coords.longitude}&lat=${coords.latitude}`);
        if (data.features.length) {
          const properties = data.features[0].properties;
          const address = [p.name, p.street, p.city, p.state, p.country].filter(Boolean).join(",");

        }
      } catch (error) {

      }
    })
  }
  return (
    <div className='min-h-screen bg-zinc-100 flex items-center justify-center px-4 py-10'>
      <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className='w-full max-w-md'>
        <div className='flex items-center gap-4 mb-6 px-1'>
          <motion.button whileTap={{ scale: 0.88 }} onClick={() => router.push("/")} className='w-11 h-11 rounded-2xl bg-white border border-zinc-200 shadow-sm flex items-center justify-center hover:bg-zinc-50 transition-colors shrink-0'>
            <ArrowLeft size={13} className='text-zinc-900' />
          </motion.button>
          <div className='flex-1 min-w-0'>
            <h1 className='text-zinc-900 text-xl font-black tracking-tight'>Book a Ride</h1>
            <p className='text-zinc-400 text-xs mt-0.5'>Fill in the details below</p>
          </div>
          <div className='flex items-center gap-1.5 shrink-0'>
            {[0, 1, 2, 3].map((d, i) => (
              <motion.div key={i} animate={{
                width: i < progress ? 20 : 8, background: i < progress ? "#09090b" : "#d4d4d8"
              }} transition={{ duration: 0.3 }} className='h-2 rounded-full'>

              </motion.div>
            ))}

          </div>
        </div>

        <div className='bg-white rounded-3xl border border-zinc-200'>
          <div className='h-1 bg-zinc-900 w-full' />
          <div className='p-6 space-y-7'>
            <motion.div variants={stepVariants} initial={"hidden"} animate={"visible"} transition={{ delay: 0.05 }}>
              <div className='flex items-centergap-2 mb-3'>
                <div className='w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0'>
                  <span className='text-white text-[9px] font-black'>1</span>
                </div>
                <p className='text-xs font-bold text-zinc-500 uppercase tracking-widest'>
                  Choose Vehicle
                </p>
              </div>
              <div className='grid grid-cols-2 gap-2.5'>
                {vehicles.map((v, i) => {
                  const active = vehicle == v.id
                  return (

                  )
                })}
              </div>

            </motion.div>
          </div>

        </div>

      </motion.div>
    </div>
  )
}

export default page