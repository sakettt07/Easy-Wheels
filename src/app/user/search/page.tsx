'use client'
import { logger } from "@/lib/logger";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Bike, Car, Clock3, MapPin, Sparkles, Truck, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import dynamic from 'next/dynamic'
const SearchMap = dynamic(() => import('@/components/SearchMap'), { ssr: false })
import VehicleNearbyCard from '@/components/VehicleNearbyCard'
import axios from 'axios'

const vehicleMeta: Record<string, { label: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
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

const SearchPageContent = () => {
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

  const [routeDistance, setRouteDistance] = useState<string | null>(null)
  const [routeDuration, setRouteDuration] = useState<string | null>(null)
  const [pickupLocation, setPickupLocation] = useState<MapLocation>({ label: pickup, lat: pickupLat, lng: pickupLng })
  const [dropLocation, setDropLocation] = useState<MapLocation>({ label: drop, lat: dropLat, lng: dropLng })
  const [nearbyVehicles, setNearbyVehicles] = useState<NearbyVehicle[]>([])
  const [nearbyVehiclesLoading, setNearbyVehiclesLoading] = useState(false)

  // Booking states
  const [bookingVehicle, setBookingVehicle] = useState<NearbyVehicle | null>(null)
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'requesting' | 'confirmed'>('idle')
  const [hasActiveBooking, setHasActiveBooking] = useState(false)

  useEffect(() => {
    const checkActiveBooking = async () => {
      try {
        const { data } = await axios.get('/api/booking/accept')
        if (data?.booking && data.booking !== 'idle') {
          setHasActiveBooking(true)
        }
      } catch (error: any) {
        logger.error('Error checking active booking', error)
      }
    }
    checkActiveBooking()
  }, [])

  useEffect(() => {
    setPickupLocation({ label: pickup, lat: pickupLat, lng: pickupLng })
  }, [pickup, pickupLat, pickupLng])

  useEffect(() => {
    setDropLocation({ label: drop, lat: dropLat, lng: dropLng })
  }, [drop, dropLat, dropLng])

  const locations = useMemo<MapLocation[]>(() => [pickupLocation, dropLocation], [pickupLocation, dropLocation])

  const getNearByVehicles = async (latitude: number, longitude: number, vehicleType: string) => {
    if (!latitude || !longitude || !vehicleType) {
      setNearbyVehicles([])
      return
    }

    try {
      setNearbyVehiclesLoading(true)
      const { data } = await axios.post('/api/vehicles/near-by', {
        latitude, longitude, vehicleType
      })
      setNearbyVehicles(Array.isArray(data) ? data : [])
    } catch (error) {
      logger.info(error)
      setNearbyVehicles([])
    } finally {
      setNearbyVehiclesLoading(false)
    }
  }

  const handleRouteLoaded = (route: { distanceKm: number | null; durationMin: number | null }) => {
    setRouteDistance(route.distanceKm !== null ? `${route.distanceKm}` : null)
    setRouteDuration(route.durationMin !== null ? `${route.durationMin}` : null)
  }

  const handleLocationChanged = (type: 'pickup' | 'drop', location: MapLocation) => {
    if (type === 'pickup') {
      setPickupLocation(location)
    } else {
      setDropLocation(location)
    }
  }

  useEffect(() => {
    getNearByVehicles(pickupLat, pickupLng, vehicle)
  }, [pickupLat, pickupLng, vehicle])

  const handleInitBook = (v: NearbyVehicle) => {
    setBookingVehicle(v)
    setBookingStatus('idle')
  }

  const handleConfirmBook = () => {
    if (!bookingVehicle) return
    if (hasActiveBooking) {
      router.push('/user/bookings');
      return;
    }
    const fare = Math.max(
      Math.round((bookingVehicle.baseFare ?? 0) + (Number(routeDistance) || 0) * (bookingVehicle.pricePerKM ?? 0)),
      bookingVehicle.baseFare ?? 0
    )

    const params = new URLSearchParams()
    params.set('pickup', pickupLocation.label)
    params.set('drop', dropLocation.label)
    params.set('vehicleType', bookingVehicle.type || '')
    params.set('vehicleModel', bookingVehicle.vehicleModel || '')
    if (bookingVehicle.imageUrl) {
      params.set('vehicleImage', bookingVehicle.imageUrl)
    }
    params.set('mobile', mobile)
    params.set('fare', fare.toString())

    // Additional parameters required for the booking API
    params.set('riderId', bookingVehicle.owner)
    params.set('vehicleId', bookingVehicle._id)
    params.set('pickupLat', pickupLocation.lat.toString())
    params.set('pickupLng', pickupLocation.lng.toString())
    params.set('dropLat', dropLocation.lat.toString())
    params.set('dropLng', dropLocation.lng.toString())

    router.push(`/user/checkout?${params.toString()}`)
  }

  return (
    <div className='min-h-screen bg-zinc-50/20 lg:h-screen lg:overflow-hidden flex flex-col lg:flex-row'>
      {/* Left Panel: Booking Details & Nearby Options */}
      <div className='w-full lg:w-[460px] xl:w-[500px] 2xl:w-[540px] flex flex-col bg-white border-r border-zinc-100 shadow-[20px_0_40px_rgba(0,0,0,0.015)] z-10 lg:h-screen lg:overflow-y-auto shrink-0 order-2 lg:order-1'>

        {/* Header */}
        <div className='p-6 pb-4 border-b border-zinc-100/80 shrink-0'>
          <div className='flex items-center gap-4'>
            <button
              type='button'
              onClick={() => router.push('/user/book')}
              className='flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:bg-zinc-50 hover:scale-105 active:scale-95 cursor-pointer'
            >
              <ArrowLeft size={16} className='text-zinc-950' />
            </button>
            <div className='flex items-center gap-3'>
              <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-sm'>
                <Sparkles size={16} />
              </div>
              <div>
                <h1 className='text-base font-black tracking-tight text-zinc-900'>Ride route on map</h1>
                <p className='text-[10px] text-zinc-500 font-bold uppercase tracking-wider'>Route Details</p>
              </div>
            </div>
          </div>
        </div>

        {hasActiveBooking && (
          <div className="mx-6 mt-6 p-4 bg-red-50 text-red-600 rounded-xl flex flex-col gap-2 shadow-sm border border-red-100 shrink-0">
            <p className="text-sm font-bold flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              Active Ride in Progress
            </p>
            <p className="text-xs text-red-500/80 leading-relaxed font-medium">Please complete or cancel your current booking before starting a new one.</p>
            <button
              onClick={() => router.push('/user/bookings')}
              className="mt-1 bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold self-start hover:bg-red-700 transition-colors shadow-sm"
            >
              View Active Booking
            </button>
          </div>
        )}

        {/* Timeline Route & Badges */}
        <div className='p-6 border-b border-zinc-100/80 space-y-5 shrink-0'>
          <div className='relative flex flex-col gap-6 pl-6 border-l border-dashed border-zinc-200 ml-2.5 py-1'>
            {/* Pickup */}
            <div className='relative'>
              <span className='absolute -left-[30px] top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white border-2 border-zinc-900 shadow-sm'>
                <span className='h-1.5 w-1.5 rounded-full bg-zinc-900' />
              </span>
              <div>
                <p className='text-[9px] font-bold uppercase tracking-widest text-zinc-400'>Pickup Point</p>
                <p className='mt-0.5 text-sm font-bold text-zinc-900 leading-snug'>{pickupLocation.label}</p>
                <p className='mt-0.5 text-[11px] text-zinc-500 font-medium'>{pickupCountry || 'Country not provided'}</p>
              </div>
            </div>

            {/* Drop-off */}
            <div className='relative'>
              <span className='absolute -left-[30px] top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white border-2 border-red-500 shadow-sm'>
                <span className='h-1.5 w-1.5 rounded-full bg-red-500' />
              </span>
              <div>
                <p className='text-[9px] font-bold uppercase tracking-widest text-zinc-400'>Drop-off Point</p>
                <p className='mt-0.5 text-sm font-bold text-zinc-900 leading-snug'>{dropLocation.label}</p>
                <p className='mt-0.5 text-[11px] text-zinc-500 font-medium'>{dropCountry || 'Country not provided'}</p>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className='flex flex-wrap gap-2 pt-1'>
            {routeDistance && (
              <span className='inline-flex items-center gap-1.5 rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-1.5 text-xs font-bold text-zinc-900 shadow-sm'>
                <MapPin size={12} className='text-zinc-500' />
                {routeDistance} km
              </span>
            )}
            {routeDuration && (
              <span className='inline-flex items-center gap-1.5 rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-1.5 text-xs font-bold text-zinc-900 shadow-sm'>
                <Clock3 size={12} className='text-zinc-500' />
                ~{routeDuration} min
              </span>
            )}
          </div>
        </div>

        {/* Selected Specs */}
        <div className='p-6 border-b border-zinc-100/80 grid grid-cols-2 gap-4 shrink-0'>
          <div className='rounded-2xl border border-zinc-100 bg-zinc-50/40 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)]'>
            <p className='text-[9px] font-bold uppercase tracking-widest text-zinc-400'>Selected Ride</p>
            <p className='mt-1 text-sm font-black text-zinc-900 flex items-center gap-1.5'>
              {(() => {
                const IconComponent = vehicleMeta[vehicle]?.icon ?? Car
                return <IconComponent size={14} className='text-zinc-700' />
              })()}
              {vehicleLabel}
            </p>
          </div>
          <div className='rounded-2xl border border-zinc-100 bg-zinc-50/40 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)]'>
            <p className='text-[9px] font-bold uppercase tracking-widest text-zinc-400'>Contact Number</p>
            <p className='mt-1 text-sm font-black text-zinc-900 truncate' title={mobile || undefined}>
              {mobile || 'Not provided'}
            </p>
          </div>
        </div>

        {/* Nearby Vehicles */}
        <div className='flex-1 p-6 bg-zinc-50/30 flex flex-col min-h-0'>
          <div className='flex items-center justify-between gap-4 mb-4 shrink-0'>
            <div>
              <p className='text-[9px] font-bold uppercase tracking-widest text-zinc-400'>Available Options</p>
              <h3 className='mt-0.5 text-base font-black text-zinc-900'>Rides close to your pickup</h3>
            </div>
            <span className='rounded-full bg-zinc-950 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm shrink-0'>
              {nearbyVehicles.length} available
            </span>
          </div>

          {/* Cards List */}
          <div className='space-y-4 overflow-y-auto pr-1 flex-1 min-h-0'>
            {nearbyVehiclesLoading ? (
              [1, 2].map((item) => (
                <div key={item} className='animate-pulse rounded-[24px] border border-zinc-100 bg-white p-5 shadow-sm'>
                  <div className='flex gap-4'>
                    <div className='h-24 w-24 rounded-2xl bg-zinc-100 shrink-0' />
                    <div className='flex-1 space-y-3 py-1 min-w-0'>
                      <div className='h-4 bg-zinc-100 rounded w-1/2' />
                      <div className='h-3 bg-zinc-100 rounded w-1/3' />
                      <div className='h-3 bg-zinc-100 rounded w-3/4' />
                      <div className='h-8 bg-zinc-100 rounded-xl w-full mt-2' />
                    </div>
                  </div>
                </div>
              ))
            ) : nearbyVehicles.length === 0 ? (
              <div className='rounded-[24px] border border-dashed border-zinc-200 bg-white p-8 text-center shadow-sm'>
                <p className='text-sm font-bold text-zinc-900'>No nearby vehicles are available right now.</p>
                <p className='mt-1.5 text-xs text-zinc-400 max-w-[280px] mx-auto leading-relaxed'>
                  Try adjusting your pickup point on the map or choose a different vehicle type.
                </p>
              </div>
            ) : (
              nearbyVehicles.map((v) => (
                <VehicleNearbyCard
                  key={v._id}
                  vehicle={v}
                  routeDistance={routeDistance}
                  vehicleMeta={vehicleMeta}
                  onBook={handleInitBook}
                />
              ))
            )}
          </div>
        </div>

      </div>

      {/* Right Panel: Map */}
      <div className='flex-1 h-[45vh] lg:h-full relative z-0 order-1 lg:order-2 shrink-0 lg:shrink'>
        <SearchMap locations={locations} onLocationChanged={handleLocationChanged} onRouteLoaded={handleRouteLoaded} />
      </div>

      {/* Booking Confirmation Modal */}
      <AnimatePresence>
        {bookingVehicle && (
          <div className='fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm'>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className='w-full max-w-md overflow-hidden rounded-[32px] border border-zinc-100 bg-white p-6 shadow-2xl'
            >
              {bookingStatus === 'idle' && (
                <div>
                  <div className='flex items-center justify-between border-b border-zinc-100 pb-4'>
                    <h3 className='text-lg font-black tracking-tight text-zinc-900'>Confirm Booking</h3>
                    <button
                      type='button'
                      onClick={() => setBookingVehicle(null)}
                      className='rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-950 transition cursor-pointer'
                    >
                      <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2.5' d='M6 18L18 6M6 6l12 12' />
                      </svg>
                    </button>
                  </div>

                  <div className='mt-5 space-y-4'>
                    {/* Vehicle Quick Summary */}
                    <div className='flex items-center gap-4 rounded-2xl bg-zinc-50/50 border border-zinc-100 p-4'>
                      <div className='h-16 w-16 overflow-hidden rounded-xl bg-white border border-zinc-100 flex items-center justify-center shrink-0 shadow-sm'>
                        {bookingVehicle.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={bookingVehicle.imageUrl} alt={bookingVehicle.vehicleModel} className='h-full w-full object-cover' />
                        ) : (
                          (() => {
                            const IconComponent = vehicleMeta[bookingVehicle.type?.toLowerCase() ?? '']?.icon ?? Car
                            return <IconComponent size={24} className='text-zinc-600' />
                          })()
                        )}
                      </div>
                      <div className='min-w-0 flex-1'>
                        <h4 className='font-black text-zinc-900 truncate'>{bookingVehicle.vehicleModel}</h4>
                        <p className='text-[10px] font-mono text-zinc-400 uppercase tracking-wide mt-0.5'>{bookingVehicle.vehicleNumber}</p>
                        <p className='text-xs font-semibold text-zinc-500 mt-1'>
                          ₹{bookingVehicle.baseFare ?? 0} base fare • ₹{bookingVehicle.pricePerKM ?? 0}/km
                        </p>
                      </div>
                    </div>

                    {/* Route Quick Summary */}
                    <div className='space-y-3 rounded-2xl border border-zinc-100 p-4 text-xs font-medium text-zinc-600'>
                      <div className='flex gap-2.5 items-start'>
                        <span className='h-3 w-3 rounded-full bg-zinc-900 border-2 border-white shadow-sm shrink-0 mt-0.5' />
                        <div className='min-w-0'>
                          <p className='text-[9px] font-bold uppercase tracking-widest text-zinc-400'>From</p>
                          <p className='text-zinc-900 font-bold truncate mt-0.5'>{pickupLocation.label}</p>
                        </div>
                      </div>
                      <div className='flex gap-2.5 items-start'>
                        <span className='h-3 w-3 rounded-full bg-red-500 border-2 border-white shadow-sm shrink-0 mt-0.5' />
                        <div className='min-w-0'>
                          <p className='text-[9px] font-bold uppercase tracking-widest text-zinc-400'>To</p>
                          <p className='text-zinc-900 font-bold truncate mt-0.5'>{dropLocation.label}</p>
                        </div>
                      </div>
                      {routeDistance && (
                        <div className='pt-2 border-t border-zinc-50 flex items-center justify-between text-[11px] font-bold text-zinc-900'>
                          <span>Estimated Distance</span>
                          <span>{routeDistance} km</span>
                        </div>
                      )}
                    </div>

                    {/* Fare and Action */}
                    <div className='pt-2 flex items-center justify-between'>
                      <div>
                        <p className='text-[9px] font-bold uppercase tracking-widest text-zinc-400'>Estimated Fare</p>
                        <p className='text-3xl font-black text-zinc-900 tracking-tight mt-0.5'>
                          ₹{Math.max(
                            Math.round((bookingVehicle.baseFare ?? 0) + (Number(routeDistance) || 0) * (bookingVehicle.pricePerKM ?? 0)),
                            bookingVehicle.baseFare ?? 0
                          ).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='mt-6 grid grid-cols-2 gap-3'>
                    <button
                      type='button'
                      onClick={() => setBookingVehicle(null)}
                      className='rounded-xl border border-zinc-200 bg-white py-3 text-xs font-bold text-zinc-700 transition hover:bg-zinc-50 active:scale-95 cursor-pointer'
                    >
                      Cancel
                    </button>
                    <button
                      type='button'
                      onClick={handleConfirmBook}
                      disabled={hasActiveBooking}
                      className={`rounded-xl py-3 text-xs font-bold shadow-md transition cursor-pointer ${hasActiveBooking ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed' : 'bg-zinc-950 text-white hover:bg-zinc-800 active:scale-95'}`}
                    >
                      {hasActiveBooking ? 'Cannot Book' : 'Confirm Ride'}
                    </button>
                  </div>
                </div>
              )}

              {bookingStatus === 'requesting' && (
                <div className='py-8 text-center flex flex-col items-center justify-center'>
                  <div className='relative flex items-center justify-center h-28 w-full'>
                    {/* Ripple rings */}
                    <span className='absolute inline-flex h-24 w-24 animate-ping rounded-full bg-zinc-100 opacity-75' />
                    <span className='absolute inline-flex h-16 w-16 animate-ping rounded-full bg-zinc-200 opacity-50' />
                    <div className='relative flex h-12 w-12 items-center justify-center rounded-full bg-zinc-950 text-white shadow-lg z-10'>
                      {(() => {
                        const IconComponent = vehicleMeta[bookingVehicle.type?.toLowerCase() ?? '']?.icon ?? Car
                        return <IconComponent size={20} className='animate-pulse' />
                      })()}
                    </div>
                  </div>
                  <h4 className='mt-8 text-lg font-black text-zinc-900'>Contacting drivers nearby…</h4>
                  <p className='mt-2 text-xs text-zinc-500 font-medium max-w-xs leading-relaxed'>
                    We are sending your request to the nearest drivers for {bookingVehicle.vehicleModel}. Please hold on.
                  </p>
                </div>
              )}

              {bookingStatus === 'confirmed' && (
                <div className='py-8 text-center flex flex-col items-center justify-center'>
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className='flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  >
                    <svg className='h-8 w-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='3' d='M5 13l4 4L19 7' />
                    </svg>
                  </motion.div>
                  <h4 className='mt-6 text-lg font-black text-zinc-900'>Ride Confirmed!</h4>
                  <p className='mt-2 text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100'>
                    Driver is heading your way
                  </p>
                  <p className='mt-4 text-[11px] text-zinc-400 font-medium'>
                    Redirecting you to your active bookings screen…
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

const SearchPage = () => (
  <Suspense fallback={<div className="min-h-screen bg-zinc-50 flex items-center justify-center font-bold text-zinc-500">Loading route...</div>}>
    <SearchPageContent />
  </Suspense>
)

export default SearchPage