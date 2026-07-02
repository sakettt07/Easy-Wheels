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

const featureToPlace = (feature: any): Place => {
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

const searchPhoton = async (query: string, countryCode?: string): Promise<Place[]> => {
  if (!query || query.trim().length < 3) return []

  const params = new URLSearchParams({
    q: query.trim(),
    limit: '7',
    lang: 'en',
  })

  if (countryCode) {
    params.set('countrycode', countryCode)
  }

  const { data } = await axios.get(`https://photon.komoot.io/api/?${params.toString()}`)
  const results = (data.features ?? []).map(featureToPlace)

  if (!countryCode) return results

  return results.filter((place: Place) => place.country.toLowerCase().includes('india'))
}

const reverseGeocode = async (lat: number, lon: number): Promise<Place | null> => {
  const { data } = await axios.get(`https://photon.komoot.io/reverse?lon=${lon}&lat=${lat}`)
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
    searchPhoton(debouncedValue, countryRestriction)
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
    <div className='relative'>
      <p className='mb-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-zinc-400'>{label}</p>
      <div
        className={`flex items-center gap-3 rounded-2xl border bg-white px-4 py-3.5 transition-all ${focused ? 'border-zinc-900 shadow-[0_0_0_3px_rgba(9,9,11,0.06)]' : 'border-zinc-200'
          }`}
      >
        <span className='shrink-0 text-zinc-400'>{icon}</span>
        <input
          ref={inputRef}
          type='text'
          value={value}
          placeholder={placeholder}
          className='min-w-0 flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-300'
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
              className='flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 transition-all hover:bg-zinc-200'
            >
              <X size={10} className='text-zinc-500' />
            </button>
          )}
          {showLocationButton && (
            <button
              type='button'
              onClick={onUseLocation}
              disabled={locationLoading}
              className='flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 transition-all hover:bg-zinc-900 hover:text-white disabled:opacity-50'
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
            className='absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)]'
          >
            {loading ? (
              <div className='flex items-center gap-2.5 px-4 py-3.5 text-xs text-zinc-400'>
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
                      className='flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-50'
                    >
                      <MapPin size={13} className='mt-0.5 shrink-0 text-zinc-300' />
                      <div className='min-w-0'>
                        <p className='truncate text-xs font-bold text-zinc-800'>{place.name}</p>
                        <p className='mt-0.5 truncate text-[10px] text-zinc-400'>
                          {[place.city, place.state, place.country].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : value.length >= 3 && !loading ? (
              <div className='flex items-center gap-2 px-4 py-3.5 text-xs text-zinc-400'>
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
    <div className='min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(24,24,27,0.08),_transparent_40%),linear-gradient(135deg,_#f5f5f5,_#fafafa)] px-4 py-4 sm:px-6 sm:py-8 lg:px-8'>
      <div className='mx-auto flex w-full max-w-6xl flex-col gap-4 lg:flex-row'>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className='w-full rounded-[32px] border border-zinc-200 bg-white/90 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.08)] backdrop-blur sm:p-6 lg:flex-1'
        >
          <div className='flex items-start justify-between gap-4'>
            <div className='flex items-center gap-3'>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => router.push('/')}
                className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-zinc-200 bg-white shadow-sm transition-colors hover:bg-zinc-50'
              >
                <ArrowLeft size={14} className='text-zinc-900' />
              </motion.button>
              <div>
                <h1 className='text-xl font-black tracking-tight text-zinc-900'>Book a Ride</h1>
                <p className='mt-1 text-xs text-zinc-500'>A smooth booking flow for your next trip</p>
              </div>
            </div>

            <div className='flex items-center gap-1.5'>
              {[0, 1, 2, 3].map((_, index) => (
                <motion.div
                  key={index}
                  animate={{ width: index < progress ? 20 : 8, background: index < progress ? '#09090b' : '#d4d4d8' }}
                  transition={{ duration: 0.3 }}
                  className='h-2 rounded-full'
                />
              ))}
            </div>
          </div>

          <div className='mt-6 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]'>
            <div className='space-y-5'>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <div className='mb-3 flex items-center gap-2'>
                  <div className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-900'>
                    <span className='text-[9px] font-black text-white'>1</span>
                  </div>
                  <p className='text-xs font-black uppercase tracking-[0.24em] text-zinc-500'>Choose vehicle</p>
                </div>
                <div className='grid grid-cols-3 gap-2'>
                  {VEHICLES.map((option) => {
                    const Icon = option.icon
                    const isActive = vehicle === option.id

                    return (
                      <motion.button
                        key={option.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setVehicle(option.id)}
                        className={`relative flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3.5 transition-all ${isActive
                          ? 'border-zinc-900 bg-zinc-900 text-white shadow-[0_4px_16px_rgba(0,0,0,0.2)]'
                          : 'border-zinc-100 text-zinc-600 hover:border-zinc-300'
                          }`}
                      >
                        <div className={`flex h-9 w-9 items-center justify-center rounded-full ${isActive ? 'bg-white text-zinc-900' : 'bg-zinc-50 text-zinc-600'}`}>
                          <Icon size={16} strokeWidth={1.8} />
                        </div>
                        <span className='text-[11px] font-black leading-none'>{option.label}</span>
                        <span className='text-[9px] leading-none text-zinc-400'>{option.desc}</span>
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className='absolute right-1.5 top-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-white'
                          >
                            <div className='h-1.5 w-1.5 rounded-full bg-zinc-900' />
                          </motion.div>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className='mb-3 flex items-center gap-2'>
                  <div className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-900'>
                    <span className='text-[9px] font-black text-white'>2</span>
                  </div>
                  <p className='text-xs font-black uppercase tracking-[0.24em] text-zinc-500'>Mobile number</p>
                </div>
                <div className={`flex items-center gap-3 rounded-2xl border bg-white px-4 py-3.5 transition-all ${mobile.length === 10 ? 'border-emerald-300' : 'border-zinc-200 focus-within:border-zinc-900 focus-within:shadow-[0_0_0_3px_rgba(9,9,11,0.06)]'}`}>
                  <Phone size={15} className='shrink-0 text-zinc-400' />
                  <span className='shrink-0 text-sm text-zinc-400'>+91</span>
                  <div className='h-4 w-px shrink-0 bg-zinc-200' />
                  <input
                    type='tel'
                    inputMode='numeric'
                    maxLength={10}
                    value={mobile}
                    placeholder='Enter mobile number'
                    className='min-w-0 flex-1 bg-transparent text-sm tracking-wider text-zinc-900 outline-none placeholder:text-zinc-300'
                    onChange={(event) => setMobile(event.target.value.replace(/\D/g, '').slice(0, 10))}
                  />
                  {mobile.length === 10 && (
                    <div className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500'>
                      <span className='text-[9px] text-white'>✓</span>
                    </div>
                  )}
                </div>
                {mobile.length > 0 && mobile.length < 10 && (
                  <p className='ml-1 mt-1.5 text-[10px] font-semibold text-amber-500'>{10 - mobile.length} more digits needed</p>
                )}
              </motion.div>
            </div>

            <div className='space-y-5'>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <div className='mb-3 flex items-center gap-2'>
                  <div className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-900'>
                    <span className='text-[9px] font-black text-white'>3</span>
                  </div>
                  <p className='text-xs font-black uppercase tracking-[0.24em] text-zinc-500'>Pickup location</p>
                </div>
                <AddressField
                  label=''
                  value={pickupText}
                  icon={<Navigation2 size={15} />}
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
                {locError && <p className='ml-1 mt-1.5 text-[10px] font-semibold text-red-500'>{locError}</p>}
                {pickupPlace && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className='mt-2 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2'>
                    <div className='h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500' />
                    <p className='truncate text-[10px] font-semibold text-emerald-700'>{pickupPlace.fullLabel}</p>
                  </motion.div>
                )}
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className='mb-3 flex items-center gap-2'>
                  <div className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-900'>
                    <span className='text-[9px] font-black text-white'>4</span>
                  </div>
                  <p className='text-xs font-black uppercase tracking-[0.24em] text-zinc-500'>Drop location</p>
                </div>
                <AddressField
                  label=''
                  value={dropText}
                  icon={<MapPin size={15} />}
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
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className='mt-2 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2'>
                    <div className='h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400' />
                    <p className='truncate text-[10px] font-semibold text-zinc-600'>{dropPlace.fullLabel}</p>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className='w-full rounded-[32px] border border-zinc-200 bg-zinc-900 p-4 text-white shadow-[0_24px_80px_rgba(0,0,0,0.14)] sm:p-6 lg:max-w-sm'
        >
          <div className='flex items-start justify-between gap-3'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400'>Trip summary</p>
              <h2 className='mt-2 text-xl font-black'>Ready to search?</h2>
            </div>
            <div className='rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-zinc-200'>
              {progress}/4 filled
            </div>
          </div>

          <div className='mt-6 space-y-3 rounded-3xl border border-white/10 bg-white/10 p-4'>
            <div className='flex items-center justify-between gap-3 rounded-2xl bg-black/20 px-3 py-3'>
              <span className='text-sm text-zinc-300'>Vehicle</span>
              <span className='text-sm font-semibold'>{VEHICLES.find((option) => option.id === vehicle)?.label ?? 'Select one'}</span>
            </div>
            <div className='flex items-center justify-between gap-3 rounded-2xl bg-black/20 px-3 py-3'>
              <span className='text-sm text-zinc-300'>Mobile</span>
              <span className='text-sm font-semibold'>{mobile || 'Add number'}</span>
            </div>
            <div className='rounded-2xl bg-black/20 px-3 py-3'>
              <p className='text-sm text-zinc-300'>Pickup</p>
              <p className='mt-1 text-sm font-semibold'>{pickupPlace?.fullLabel ?? 'Choose place'}</p>
            </div>
            <div className='rounded-2xl bg-black/20 px-3 py-3'>
              <p className='text-sm text-zinc-300'>Drop</p>
              <p className='mt-1 text-sm font-semibold'>{dropPlace?.fullLabel ?? 'Choose place'}</p>
            </div>
          </div>

          <motion.button
            whileHover={canBook ? { scale: 1.01 } : {}}
            whileTap={canBook ? { scale: 0.975 } : {}}
            disabled={!canBook}
            onClick={handleContinue}
            className='mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-4 text-sm font-black text-zinc-900 transition-all hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-30'
          >
            Find Available Riders
            <ChevronRight size={15} />
          </motion.button>

          {!canBook && (
            <p className='mt-3 text-center text-[10px] text-zinc-400'>
              {!vehicle ? 'Select a vehicle to continue' : mobile.length !== 10 ? 'Enter your 10-digit mobile number' : !pickupPlace ? 'Enter a pickup location' : 'Enter a drop location'}
            </p>
          )}
        </motion.aside>
      </div>
    </div>
  )
}

export default BookingPage