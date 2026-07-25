/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import {
  ArrowLeft,
  Bike,
  Car,
  ChevronRight,
  Loader2,
  LocateFixed,
  MapPin,
  Navigation2,
  Package,
  Phone,
  Search,
  Truck,
  X,
  Zap,
} from 'lucide-react'

type Place = {
  id: string
  name: string
  city: string
  state: string
  country: string
  lat: number
  lng: number
  fullLabel: string
}

type VehicleOption = {
  id: string
  label: string
  icon: typeof Bike
  desc: string
}

const VEHICLES: VehicleOption[] = [
  { id: 'bike', label: 'Bike', icon: Bike, desc: '2W' },
  { id: 'auto', label: 'Auto', icon: Car, desc: '3W' },
  { id: 'car', label: 'Car', icon: Car, desc: '4W' },
  { id: 'loader', label: 'Loader', icon: Package, desc: 'Goods' },
  { id: 'traveller', label: 'Traveller', icon: Truck, desc: 'Family' },
  { id: 'ev', label: 'EV', icon: Zap, desc: 'Eco' },
]

const featureToPlace = (feature: {
  id?: string
  properties: {
    name?: string
    street?: string
    city?: string
    county?: string
    state?: string
    country: string
  }
  geometry: {
    coordinates: [number, number]
  }
}): Place => {
  const properties = feature.properties
  const parts = [properties.name, properties.street, properties.city ?? properties.county, properties.state, properties.country].filter(Boolean)

  return {
    id: feature.id ?? Math.random().toString(),
    name: properties.name ?? properties.street ?? 'Unknown',
    city: properties.city ?? properties.county ?? '',
    state: properties.state ?? '',
    country: properties.country ?? '',
    lat: feature.geometry.coordinates[1],
    lng: feature.geometry.coordinates[0],
    fullLabel: parts.join(', '),
  }
}

const searchLocation = async (query: string, countryCode?: string): Promise<Place[]> => {
  if (!query || query.trim().length < 3) return []

  const params = new URLSearchParams({
    text: query.trim(),
    limit: '7',
    apiKey: process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || '',
  })

  if (countryCode) {
    params.set('filter', `countrycode:${countryCode.toLowerCase()}`)
  }

  const { data } = await axios.get(`https://api.geoapify.com/v1/geocode/autocomplete?${params.toString()}`)
  const results = (data.features ?? []).map(featureToPlace)

  return results
}

const reverseGeocode = async (lat: number, lon: number): Promise<Place | null> => {
  const { data } = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`)
  if (!data.features?.length) return null
  return featureToPlace(data.features[0])
}

function useDebounce<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

type AddressFieldProps = {
  label: string
  value: string
  icon: React.ReactNode
  placeholder: string
  onChange: (value: string) => void
  onSelect: (place: Place) => void
  onClear: () => void
  showLocationButton?: boolean
  onUseLocation?: () => void
  locationLoading?: boolean
  countryRestriction?: string
}

const AddressField = ({
  label,
  value,
  icon,
  placeholder,
  onChange,
  onSelect,
  onClear,
  showLocationButton,
  onUseLocation,
  locationLoading,
  countryRestriction,
}: AddressFieldProps) => {
  const [results, setResults] = useState<Place[]>([])
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const [selected, setSelected] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedValue = useDebounce(value, 380)

  useEffect(() => {
    if (selected) {
      setSelected(false)
      return
    }

    if (!focused) return

    setLoading(true)
    searchLocation(debouncedValue, countryRestriction)
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [countryRestriction, debouncedValue, focused, selected])

  const handleSelect = (place: Place) => {
    setSelected(true)
    setResults([])
    setFocused(false)
    inputRef.current?.blur()
    onSelect(place)
  }

  const showDropdown = focused && (loading || results.length > 0 || value.length >= 3)

  return (
    <div className='relative w-full'>
      {label && <p className='mb-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-zinc-400'>{label}</p>}
      <div
        className={`flex items-center gap-3 rounded-2xl border bg-white px-4 py-3.5 transition-all duration-200 ${focused
          ? 'border-zinc-950 shadow-[0_0_0_4px_rgba(9,9,11,0.05)]'
          : 'border-zinc-200/80 hover:border-zinc-300'
          }`}
      >
        <span className='shrink-0 text-zinc-400'>{icon}</span>
        <input
          ref={inputRef}
          type='text'
          value={value}
          placeholder={placeholder}
          className='min-w-0 flex-1 bg-transparent text-sm font-semibold text-zinc-900 outline-none placeholder:text-zinc-300'
          onChange={(event) => {
            onChange(event.target.value)
            setSelected(false)
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 200)}
        />
        <div className='flex shrink-0 items-center gap-1.5'>
          {value && (
            <button
              type='button'
              onClick={onClear}
              className='flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 transition-all hover:bg-zinc-200 cursor-pointer'
            >
              <X size={10} className='text-zinc-500' />
            </button>
          )}
          {showLocationButton && (
            <button
              type='button'
              onClick={onUseLocation}
              disabled={locationLoading}
              className='flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 transition-all hover:bg-zinc-950 hover:text-white disabled:opacity-50 cursor-pointer'
              title='Use my location'
            >
              {locationLoading ? <Loader2 size={13} className='animate-spin' /> : <LocateFixed size={13} />}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className='absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.08)]'
          >
            {loading ? (
              <div className='flex items-center gap-2.5 px-4 py-3.5 text-xs text-zinc-400 font-medium'>
                <Loader2 size={13} className='shrink-0 animate-spin' />
                Searching…
              </div>
            ) : results.length > 0 ? (
              <ul className='max-h-56 divide-y divide-zinc-50 overflow-y-auto'>
                {results.map((place) => (
                  <li key={place.id}>
                    <button
                      type='button'
                      onMouseDown={(event) => {
                        event.preventDefault()
                        handleSelect(place)
                      }}
                      className='flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-50 cursor-pointer'
                    >
                      <MapPin size={13} className='mt-0.5 shrink-0 text-zinc-300' />
                      <div className='min-w-0'>
                        <p className='truncate text-xs font-bold text-zinc-800'>{place.name}</p>
                        <p className='mt-0.5 truncate text-[10px] text-zinc-400 font-medium'>
                          {[place.city, place.state, place.country].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : value.length >= 3 && !loading ? (
              <div className='flex items-center gap-2 px-4 py-3.5 text-xs text-zinc-400 font-medium'>
                <Search size={12} className='shrink-0' />
                No results found
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const BookingPage = () => {
  const router = useRouter()

  const [vehicle, setVehicle] = useState('')
  const [mobile, setMobile] = useState('')
  const [pickupText, setPickupText] = useState('')
  const [dropText, setDropText] = useState('')
  const [pickupPlace, setPickupPlace] = useState<Place | null>(null)
  const [dropPlace, setDropPlace] = useState<Place | null>(null)
  const [locLoading, setLocLoading] = useState(false)
  const [locError, setLocError] = useState('')

  const progress = useMemo(
    () => [!!vehicle, mobile.length === 10, !!pickupPlace, !!dropPlace].filter(Boolean).length,
    [dropPlace, mobile.length, pickupPlace, vehicle],
  )

  const useCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocError('Geolocation not supported')
      return
    }

    setLocLoading(true)
    setLocError('')

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const place = await reverseGeocode(coords.latitude, coords.longitude)
          if (place) {
            setPickupPlace(place)
            setPickupText(place.fullLabel)
          } else {
            setLocError("Couldn't resolve your location")
          }
        } catch {
          setLocError('Location lookup failed')
        } finally {
          setLocLoading(false)
        }
      },
      () => {
        setLocError('Location access denied')
        setLocLoading(false)
      },
      { timeout: 8000 },
    )
  }, [])

  const canBook = Boolean(vehicle && mobile.length === 10 && pickupPlace && dropPlace)
  const countryRestriction = pickupPlace?.country?.toLowerCase() === 'india' ? 'in' : undefined

  const handleContinue = useCallback(() => {
    if (!canBook || !pickupPlace || !dropPlace) return

    const params = new URLSearchParams({
      pickup: pickupPlace.fullLabel,
      drop: dropPlace.fullLabel,
      vehicle,
      mobile,
      pickuplat: pickupPlace.lat.toString(),
      pickuplng: pickupPlace.lng.toString(),
      droplat: dropPlace.lat.toString(),
      droplng: dropPlace.lng.toString(),
      pickupCountry: pickupPlace.country,
      dropCountry: dropPlace.country,
    })

    router.push(`/user/search?${params.toString()}`)
  }, [canBook, dropPlace, mobile, pickupPlace, router, vehicle])

  return (
    <div className='min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(9,9,11,0.03),_transparent_45%),linear-gradient(135deg,_#f5f5f5,_#fbfbfb)] px-4 py-6 sm:px-6 sm:py-10 lg:px-8 flex items-center justify-center'>
      <div className='mx-auto flex w-full max-w-5xl flex-col gap-6 lg:flex-row items-stretch'>

        {/* Left Side: Booking Form */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className='w-full rounded-[32px] border border-zinc-100 bg-white/80 p-5 shadow-[0_24px_80px_rgba(9,9,11,0.03)] backdrop-blur-md sm:p-8 lg:flex-1 flex flex-col justify-between'
        >
          {/* Header */}
          <div className='flex items-start justify-between gap-4 border-b border-zinc-100 pb-5'>
            <div className='flex items-center gap-3'>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/')}
                className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-sm transition-colors hover:bg-zinc-50 cursor-pointer'
              >
                <ArrowLeft size={16} className='text-zinc-900' />
              </motion.button>
              <div>
                <h1 className='text-lg font-black tracking-tight text-zinc-900'>Book a Ride</h1>
                <p className='text-[10px] text-zinc-500 font-bold uppercase tracking-wider'>Vehicle & Details</p>
              </div>
            </div>

            <div className='flex items-center gap-1.5'>
              {[0, 1, 2, 3].map((_, index) => (
                <motion.div
                  key={index}
                  animate={{ width: index < progress ? 18 : 6, background: index < progress ? '#09090b' : '#e4e4e7' }}
                  transition={{ duration: 0.3 }}
                  className='h-1.5 rounded-full'
                />
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className='mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]'>

            {/* Column 1: Vehicle & Phone */}
            <div className='space-y-6'>

              {/* Step 1: Choose Vehicle */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <div className='mb-3.5 flex items-center gap-2'>
                  <div className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-900 shadow-sm'>
                    <span className='text-[9px] font-black text-white'>1</span>
                  </div>
                  <p className='text-xs font-black uppercase tracking-[0.24em] text-zinc-500'>Choose vehicle</p>
                </div>

                <div className='grid grid-cols-3 gap-2.5'>
                  {VEHICLES.map((option) => {
                    const Icon = option.icon
                    const isActive = vehicle === option.id

                    return (
                      <motion.button
                        key={option.id}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setVehicle(option.id)}
                        className={`relative flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all duration-300 cursor-pointer ${isActive
                          ? 'border-zinc-900 bg-zinc-900 text-white shadow-[0_12px_20px_rgba(9,9,11,0.12)]'
                          : 'border-zinc-100 bg-zinc-50/50 text-zinc-600 hover:border-zinc-300 hover:bg-white'
                          }`}
                      >
                        <div className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${isActive ? 'bg-white/10 text-white' : 'bg-white text-zinc-700 border border-zinc-100 shadow-sm'
                          }`}>
                          <Icon size={16} strokeWidth={2} />
                        </div>
                        <div className='text-center'>
                          <span className='block text-[11px] font-black leading-none tracking-tight'>{option.label}</span>
                          <span className={`block text-[9px] mt-1 font-bold ${isActive ? 'text-zinc-300/80' : 'text-zinc-400'}`}>
                            {option.desc}
                          </span>
                        </div>
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className='absolute right-2 top-2 flex h-2 w-2 items-center justify-center rounded-full bg-white shadow-sm'
                          />
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>

              {/* Step 2: Mobile Number */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className='mb-3.5 flex items-center gap-2'>
                  <div className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-900 shadow-sm'>
                    <span className='text-[9px] font-black text-white'>2</span>
                  </div>
                  <p className='text-xs font-black uppercase tracking-[0.24em] text-zinc-500'>Mobile number</p>
                </div>

                <div className={`flex items-center gap-3 rounded-2xl border bg-white px-4 py-3.5 transition-all duration-200 ${mobile.length === 10
                  ? 'border-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.05)]'
                  : 'border-zinc-200 focus-within:border-zinc-950 focus-within:shadow-[0_0_0_4px_rgba(9,9,11,0.05)] hover:border-zinc-300'
                  }`}>
                  <Phone size={15} className='shrink-0 text-zinc-400' />
                  <span className='shrink-0 text-sm font-semibold text-zinc-500'>+91</span>
                  <div className='h-4 w-px shrink-0 bg-zinc-200' />
                  <input
                    type='tel'
                    inputMode='numeric'
                    maxLength={10}
                    value={mobile}
                    placeholder='Enter mobile number'
                    className='min-w-0 flex-1 bg-transparent text-sm font-semibold tracking-wider text-zinc-900 outline-none placeholder:text-zinc-300 placeholder:font-normal'
                    onChange={(event) => setMobile(event.target.value.replace(/\D/g, '').slice(0, 10))}
                  />
                  {mobile.length === 10 && (
                    <div className='flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-emerald-500 shadow-sm'>
                      <span className='text-[8px] font-black text-white'>✓</span>
                    </div>
                  )}
                </div>
                {mobile.length > 0 && mobile.length < 10 && (
                  <p className='ml-1 mt-1.5 text-[10px] font-semibold text-amber-500'>{10 - mobile.length} more digits needed</p>
                )}
              </motion.div>
            </div>

            {/* Column 2: Pickup & Drop Location (Connected visual timeline) */}
            <div className='space-y-6'>

              <div className='relative flex flex-col gap-5 pl-8'>
                {/* Dashed vertical connector */}
                <div className='absolute left-[13px] top-[40px] bottom-[40px] w-0.5 border-l border-dashed border-zinc-200 z-0' />

                {/* Step 3: Pickup Location */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className='relative z-20 space-y-2'>
                  <span className='absolute -left-[28px] top-[41px] flex h-5 w-5 items-center justify-center rounded-full bg-white border-2 border-zinc-900 shadow-sm'>
                    <span className='h-1.5 w-1.5 rounded-full bg-zinc-900' />
                  </span>
                  <div className='flex items-center gap-2'>
                    <p className='text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400'>Pickup location</p>
                  </div>
                  <AddressField
                    label=''
                    value={pickupText}
                    icon={<Navigation2 size={15} className='text-zinc-400' />}
                    placeholder='Where should we pick you up?'
                    onChange={(value) => {
                      setPickupText(value)
                      if (!value) setPickupPlace(null)
                    }}
                    onSelect={(place) => {
                      setPickupPlace(place)
                      setPickupText(place.fullLabel)
                    }}
                    onClear={() => {
                      setPickupText('')
                      setPickupPlace(null)
                    }}
                    showLocationButton
                    onUseLocation={useCurrentLocation}
                    locationLoading={locLoading}
                  />
                  {locError && <p className='ml-1 mt-1 text-[10px] font-semibold text-red-500'>{locError}</p>}
                  {pickupPlace && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className='flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/50 px-3 py-1.5'>
                      <div className='h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 animate-pulse' />
                      <p className='truncate text-[10px] font-bold text-emerald-700'>{pickupPlace.fullLabel}</p>
                    </motion.div>
                  )}
                </motion.div>

                {/* Step 4: Drop Location */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className='relative z-10 space-y-2'>
                  <span className='absolute -left-[28px] top-[41px] flex h-5 w-5 items-center justify-center rounded-full bg-white border-2 border-red-500 shadow-sm'>
                    <span className='h-1.5 w-1.5 rounded-full bg-red-500' />
                  </span>
                  <div className='flex items-center gap-2'>
                    <p className='text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400'>Drop location</p>
                  </div>
                  <AddressField
                    label=''
                    value={dropText}
                    icon={<MapPin size={15} className='text-zinc-400' />}
                    placeholder='Where are you heading?'
                    onChange={(value) => {
                      setDropText(value)
                      if (!value) setDropPlace(null)
                    }}
                    onSelect={(place) => {
                      setDropPlace(place)
                      setDropText(place.fullLabel)
                    }}
                    onClear={() => {
                      setDropText('')
                      setDropPlace(null)
                    }}
                    countryRestriction={countryRestriction}
                  />
                  {dropPlace && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className='flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50/60 px-3 py-1.5'>
                      <div className='h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400' />
                      <p className='truncate text-[10px] font-bold text-zinc-600'>{dropPlace.fullLabel}</p>
                    </motion.div>
                  )}
                </motion.div>
              </div>

            </div>

          </div>
        </motion.div>

        {/* Right Side: Elegant Trip Summary */}
        <motion.aside
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className='w-full rounded-[32px] border border-zinc-800 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 p-6 text-white shadow-[0_30px_70px_rgba(9,9,11,0.15)] sm:p-8 lg:max-w-sm flex flex-col justify-between shrink-0'
        >
          {/* Sidebar Header */}
          <div className='flex items-start justify-between gap-3 border-b border-zinc-800 pb-5 shrink-0'>
            <div>
              <p className='text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500'>Trip Summary</p>
              <h2 className='mt-1 text-lg font-black tracking-tight text-white'>Journey overview</h2>
            </div>
            <div className='rounded-full border border-zinc-800 bg-zinc-800/40 px-2.5 py-1 text-[10px] font-black tracking-wider text-zinc-300 uppercase shrink-0'>
              {progress}/4 completed
            </div>
          </div>

          {/* Sidebar Content (Journey list with mini timelines) */}
          <div className='my-6 space-y-5 flex-1 min-h-0 overflow-y-auto pr-1'>

            {/* Selected Vehicle Badge */}
            <div className='flex items-center gap-3 bg-white/5 border border-white/5 rounded-2xl p-3.5 shadow-sm'>
              <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-white text-zinc-900 shadow-sm shrink-0'>
                {(() => {
                  const selectedOption = VEHICLES.find((option) => option.id === vehicle)
                  const Icon = selectedOption?.icon ?? Car
                  return <Icon size={20} className='stroke-[1.8]' />
                })()}
              </div>
              <div className='min-w-0'>
                <p className='text-[9px] font-black uppercase tracking-widest text-zinc-400'>Selected Preference</p>
                <p className='text-sm font-black text-white mt-0.5 truncate'>
                  {VEHICLES.find((option) => option.id === vehicle)?.label ?? 'Choose vehicle'}
                </p>
              </div>
            </div>

            {/* Visual connected timeline summary */}
            <div className='relative flex flex-col gap-4 pl-5 border-l border-dashed border-zinc-800 ml-3.5 py-1 text-xs'>
              {/* Pickup location */}
              <div className='relative'>
                <span className='absolute -left-[24px] top-1.5 flex h-2 w-2 rounded-full bg-zinc-400 border border-zinc-950' />
                <div>
                  <p className='text-[9px] font-black uppercase tracking-widest text-zinc-500'>Pickup Location</p>
                  <p className='text-[13px] font-bold text-zinc-200 truncate mt-0.5' title={pickupPlace?.fullLabel || undefined}>
                    {pickupPlace?.name ?? 'Not chosen yet'}
                  </p>
                </div>
              </div>

              {/* Destination */}
              <div className='relative'>
                <span className='absolute -left-[24px] top-1.5 flex h-2 w-2 rounded-full bg-red-500 border border-zinc-950' />
                <div>
                  <p className='text-[9px] font-black uppercase tracking-widest text-zinc-500'>Destination</p>
                  <p className='text-[13px] font-bold text-zinc-200 truncate mt-0.5' title={dropPlace?.fullLabel || undefined}>
                    {dropPlace?.name ?? 'Not chosen yet'}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact details */}
            <div className='flex items-center gap-3 bg-white/5 border border-white/5 rounded-2xl p-3.5 shadow-sm'>
              <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300 shrink-0'>
                <Phone size={14} />
              </div>
              <div className='min-w-0'>
                <p className='text-[9px] font-black uppercase tracking-widest text-zinc-400'>Contact Details</p>
                <p className='text-xs font-bold text-white mt-0.5 truncate'>{mobile ? `+91 ${mobile}` : 'Enter your number'}</p>
              </div>
            </div>

          </div>

          {/* Sidebar CTA Footer */}
          <div className='shrink-0 pt-4 border-t border-zinc-900'>
            <motion.button
              whileHover={canBook ? { scale: 1.01 } : {}}
              whileTap={canBook ? { scale: 0.975 } : {}}
              disabled={!canBook}
              onClick={handleContinue}
              className='flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-4 text-sm font-black text-zinc-900 transition-all hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-20 cursor-pointer shadow-lg shadow-black/10'
            >
              <span>Find Available Rides</span>
              <ChevronRight size={15} />
            </motion.button>

            {!canBook && (
              <p className='mt-3.5 text-center text-[10px] font-semibold text-zinc-500 leading-normal'>
                {!vehicle ? 'Select a vehicle preference' : mobile.length !== 10 ? 'Enter your 10-digit mobile number' : !pickupPlace ? 'Select your pickup point' : 'Select your destination point'}
              </p>
            )}
          </div>
        </motion.aside>

      </div>
    </div>
  )
}

export default BookingPage