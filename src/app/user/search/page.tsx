'use client'

import React, { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Bike, Car, Phone, Sparkles, Truck, Zap } from 'lucide-react'
import { motion } from 'motion/react'
import SearchMap from '@/components/SearchMap'

const vehicleMeta: Record<string, { label: string; icon: typeof Bike }> = {
  bike: { label: 'Bike', icon: Bike },
  auto: { label: 'Auto', icon: Car },
  car: { label: 'Car', icon: Car },
  loader: { label: 'Loader', icon: Truck },
  traveller: { label: 'Traveller', icon: Truck },
  ev: { label: 'EV', icon: Zap },
}

type MapLocation = {
  label: string
  lat: number
  lng: number
}

const SearchPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const pickup = searchParams.get('pickup') ?? 'Not selected'
  const drop = searchParams.get('drop') ?? 'Not selected'
  const vehicle = searchParams.get('vehicle') ?? ''
  const mobile = searchParams.get('mobile') ?? ''
  const pickupCountry = searchParams.get('pickupCountry') ?? ''
  const dropCountry = searchParams.get('dropCountry') ?? ''
  const pickupLat = Number(searchParams.get('pickuplat') ?? '0')
  const pickupLng = Number(searchParams.get('pickuplng') ?? '0')
  const dropLat = Number(searchParams.get('droplat') ?? '0')
  const dropLng = Number(searchParams.get('droplng') ?? '0')

  const vehicleLabel = vehicleMeta[vehicle]?.label ?? 'Vehicle'
  const VehicleIcon = vehicleMeta[vehicle]?.icon ?? Bike

  const [routeDistance, setRouteDistance] = useState<string | null>(null)
  const [routeDuration, setRouteDuration] = useState<string | null>(null)

  const locations = useMemo<MapLocation[]>(() => [
    { label: pickup, lat: pickupLat, lng: pickupLng },
    { label: drop, lat: dropLat, lng: dropLng },
  ], [drop, dropLat, dropLng, pickup, pickupLat, pickupLng])

  const handleRouteLoaded = (route: { distanceKm: number | null; durationMin: number | null }) => {
    setRouteDistance(route.distanceKm !== null ? `${route.distanceKm}` : null)
    setRouteDuration(route.durationMin !== null ? `${route.durationMin}` : null)
  }

  return (
    <div className='min-h-screen p-9'>
      <div className='mx-auto flex w-full max-w-7xl flex-col gap-4 rounded-4xl'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className='flex-1 rounded-[28px]'
        >
          <button
            type='button'
            onClick={() => router.push('/user/book')}
            className='flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white shadow-sm transition-colors hover:bg-zinc-50'
          >
            <ArrowLeft size={14} className='text-zinc-900' />
          </button>

          <div className='mt-5 flex items-start gap-3'>
            <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-900 text-white'>
              <Sparkles size={18} />
            </div>
            <div>
              <h1 className='text-2xl font-black tracking-tight text-zinc-900'>Ride route on map</h1>
              <p className='mt-1 text-sm text-zinc-500'>Pickup, drop, and distance are shown clearly in the map below.</p>
            </div>
          </div>

          <div className='mt-6 overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)]' style={{ height: '60vh' }}>
            <SearchMap locations={locations} onRouteLoaded={handleRouteLoaded} />
          </div>

          <div className='mt-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm'>
            <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500'>Route details</p>
                <h2 className='mt-2 text-2xl font-black text-zinc-900'>Trip summary</h2>
              </div>
              <div className='flex flex-wrap items-center gap-3 text-sm text-zinc-600'>
                {routeDistance && (
                  <span className='rounded-full border border-zinc-200 bg-zinc-50 px-3 py-2 font-semibold text-zinc-900'>
                    {routeDistance} km
                  </span>
                )}
                {routeDuration && (
                  <span className='rounded-full border border-zinc-200 bg-zinc-50 px-3 py-2 font-semibold text-zinc-900'>
                    ~{routeDuration} min
                  </span>
                )}
              </div>
            </div>

            <div className='mt-6 grid gap-4 sm:grid-cols-2'>
              <div className='rounded-3xl bg-zinc-50 p-5'>
                <div className='flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500'>
                  <span className='inline-flex h-2.5 w-2.5 rounded-full bg-zinc-900' />
                  Pickup
                </div>
                <p className='mt-3 text-sm font-semibold text-zinc-900'>{pickup}</p>
                <p className='mt-2 text-sm text-zinc-500'>{pickupCountry || 'Country not provided'}</p>
              </div>
              <div className='rounded-3xl bg-zinc-50 p-5'>
                <div className='flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500'>
                  <span className='inline-flex h-2.5 w-2.5 rounded-full bg-zinc-900' />
                  Drop
                </div>
                <p className='mt-3 text-sm font-semibold text-zinc-900'>{drop}</p>
                <p className='mt-2 text-sm text-zinc-500'>{dropCountry || 'Country not provided'}</p>
              </div>
            </div>

            <div className='mt-6 grid gap-4 sm:grid-cols-2'>
              <div className='rounded-3xl border border-zinc-200 bg-white p-5'>
                <p className='text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500'>Vehicle</p>
                <p className='mt-3 text-base font-semibold text-zinc-900'>{vehicleLabel}</p>
              </div>
              <div className='rounded-3xl border border-zinc-200 bg-white p-5'>
                <p className='text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500'>Contact</p>
                <p className='mt-3 text-base font-semibold text-zinc-900'>{mobile || 'No number provided'}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default SearchPage