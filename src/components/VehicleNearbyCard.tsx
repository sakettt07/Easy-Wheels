'use client'

import React from 'react'
import { ArrowRight, Bike, CircleDollarSign, Clock3, ShieldCheck } from 'lucide-react'
import { motion } from 'motion/react'

type NearbyVehicle = {
  _id: string
  owner: string
  type: string
  vehicleNumber: string
  vehicleModel: string
  status: string
  isActive: boolean
  baseFare?: number
  pricePerKM?: number
  waitingCharge?: number
  imageUrl?: string
}

interface VehicleNearbyCardProps {
  vehicle: NearbyVehicle
  routeDistance: string | null
  vehicleMeta: Record<string, { label: string; icon: React.ComponentType<{ size?: number; className?: string }> }>
  onBook: (vehicle: NearbyVehicle) => void
}

const VehicleNearbyCard: React.FC<VehicleNearbyCardProps> = ({
  vehicle,
  routeDistance,
  vehicleMeta,
  onBook
}) => {
  const vehicleType = vehicle.type?.toLowerCase() ?? ''
  const matchedMeta = vehicleMeta[vehicleType]
  const Icon = matchedMeta?.icon ?? Bike
  const distanceNum = Number(routeDistance) || 0
  const estFareNum = Math.max(
    Math.round((vehicle.baseFare ?? 0) + distanceNum * (vehicle.pricePerKM ?? 0)),
    vehicle.baseFare ?? 0
  )

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.06)' }}
      transition={{ duration: 0.3, ease: [0.25, 0.8, 0.25, 1] }}
      className='group relative overflow-hidden rounded-[24px] border border-zinc-100 bg-white p-5 transition-all duration-300 hover:border-zinc-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)]'
    >
      <div className='flex gap-5 flex-col sm:flex-row'>
        {/* Left Side: Vehicle Visual */}
        <div className='relative h-28 w-full sm:w-28 shrink-0 overflow-hidden rounded-2xl bg-zinc-50 border border-zinc-100/50 flex items-center justify-center'>
          {vehicle.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={vehicle.imageUrl}
              alt={vehicle.vehicleModel}
              className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
            />
          ) : (
            <div className='flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100/80 text-zinc-600 transition-colors group-hover:text-zinc-950'>
              <Icon size={32} className='stroke-[1.5]' />
            </div>
          )}
          {/* Vehicle Type Badge overlay */}
          <div className='absolute bottom-2 left-2 rounded-full bg-white/95 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-900 shadow-sm border border-zinc-100/30 backdrop-blur'>
            {matchedMeta?.label ?? 'Ride'}
          </div>
        </div>

        {/* Right Side: Details & Action */}
        <div className='flex-1 flex flex-col justify-between min-w-0'>
          {/* Header Info: Model, status and number */}
          <div>
            <div className='flex items-start justify-between gap-3'>
              <div className='min-w-0'>
                <h4 className='text-base font-black tracking-tight text-zinc-900 group-hover:text-zinc-950 truncate transition-colors'>
                  {vehicle.vehicleModel || 'Vehicle'}
                </h4>
                <p className='mt-0.5 text-[10px] font-mono font-medium tracking-wide text-zinc-400 uppercase'>
                  {vehicle.vehicleNumber}
                </p>
              </div>
              <div
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase border ${
                  vehicle.isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    : 'bg-zinc-100 text-zinc-500 border-zinc-200/50'
                }`}
              >
                <span className={`h-1 w-1 rounded-full ${vehicle.isActive ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                {vehicle.isActive ? 'Ready' : 'Busy'}
              </div>
            </div>

            {/* Micro Details (Fare Info & Area) */}
            <div className='mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-zinc-500 font-medium'>
              <span className='flex items-center gap-1.5'>
                <CircleDollarSign size={13} className='text-zinc-400' />
                <span>₹{vehicle.baseFare ?? 0} base • ₹{vehicle.pricePerKM ?? 0}/km</span>
              </span>
              <span className='flex items-center gap-1.5'>
                <Clock3 size={13} className='text-zinc-400' />
                <span>₹{vehicle.waitingCharge ?? 0} wait/m</span>
              </span>
              <span className='flex items-center gap-1.5'>
                <ShieldCheck size={13} className='text-emerald-500' />
                <span>Instant confirmation</span>
              </span>
            </div>
          </div>

          {/* Pricing & Call to Action */}
          <div className='mt-3.5 pt-3 border-t border-zinc-50 flex items-center justify-between gap-4'>
            <div>
              <p className='text-[9px] font-bold uppercase tracking-widest text-zinc-400'>Est. Total Fare</p>
              <p className='mt-0.5 text-xl font-black text-zinc-900 tracking-tight'>
                ₹{estFareNum.toLocaleString('en-IN')}
              </p>
            </div>
            
            <button
              type='button'
              onClick={() => onBook(vehicle)}
              className='relative inline-flex items-center gap-1.5 rounded-xl bg-zinc-950 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:bg-zinc-800 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer overflow-hidden group/btn'
            >
              <span>Book Ride</span>
              <ArrowRight size={12} className='transition-transform duration-200 group-hover/btn:translate-x-0.5' />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

export default VehicleNearbyCard
