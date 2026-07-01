'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from "motion/react"
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Bike, Car, Package, Truck, Zap,
  MapPin, Navigation2, Phone, ChevronRight,
  Loader2, X, Search, LocateFixed
} from 'lucide-react'
import axios from 'axios'

// ── Types ────────────────────────────────────────────────────
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

const VEHICLES = [
  { id: "bike", label: "Bike", icon: Bike, desc: "2W" },
  { id: "auto", label: "Auto", icon: Car, desc: "3W" },
  { id: "car", label: "Car", icon: Car, desc: "4W" },
  { id: "loader", label: "Loader", icon: Package, desc: "Goods" },
  { id: "traveller", label: "Traveller", icon: Truck, desc: "Family" },
  { id: "ev", label: "EV", icon: Zap, desc: "Eco" },
]

// ── Photon (OSM) helpers ─────────────────────────────────────
const featureToPlace = (f: any): Place => {
  const p = f.properties
  const parts = [p.name, p.street, p.city ?? p.county, p.state, p.country].filter(Boolean)
  return {
    id: f.id ?? Math.random().toString(),
    name: p.name ?? p.street ?? 'Unknown',
    city: p.city ?? p.county ?? '',
    state: p.state ?? '',
    country: p.country ?? '',
    lat: f.geometry.coordinates[1],
    lng: f.geometry.coordinates[0],
    fullLabel: parts.join(', '),
  }
}

const searchPhoton = async (q: string, restrict?: string): Promise<Place[]> => {
  if (!q || q.trim().length < 3) return []
  const { data } = await axios.get(
    `https://photon.komoot.io/api/?q=${encodeURIComponent(q.trim())}&limit=7&lang=en`
  )
  return (data.features ?? []).map(featureToPlace)
}

const reverseGeocode = async (lat: number, lon: number): Promise<Place | null> => {
  const { data } = await axios.get(
    `https://photon.komoot.io/reverse?lon=${lon}&lat=${lat}`
  )
  if (!data.features?.length) return null
  return featureToPlace(data.features[0])
}

// ── Debounce hook ─────────────────────────────────────────────
function useDebounce<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debouncedValue
}

// ── Address field component ───────────────────────────────────
interface AddressFieldProps {
  label: string
  value: string
  icon: React.ReactNode
  placeholder: string
  onChange: (v: string) => void
  onSelect: (p: Place) => void
  onClear: () => void
  showLocationButton?: boolean
  onUseLocation?: () => void
  locationLoading?: boolean
}

const AddressField = ({
  label, value, icon, placeholder, onChange, onSelect, onClear,
  showLocationButton, onUseLocation, locationLoading,
}: AddressFieldProps) => {
  const [results, setResults] = useState<Place[]>([])
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const [selected, setSelected] = useState(false)   // track if a place was chosen
  const inputRef = useRef<HTMLInputElement>(null)
  const debounced = useDebounce(value, 380)

  // Search when debounced value changes (but not when a place was just selected)
  useEffect(() => {
    if (selected) { setSelected(false); return }
    if (!focused) return
    setLoading(true)
    searchPhoton(debounced)
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [debounced])

  const handleSelect = (p: Place) => {
    setSelected(true)
    setResults([])
    setFocused(false)
    inputRef.current?.blur()
    onSelect(p)
  }

  const showDropdown = focused && (loading || results.length > 0 || value.length >= 3)

  return (
    <div className='relative'>
      <p className='text-[9px] font-black uppercase tracking-[0.18em] text-zinc-400 mb-1.5'>{label}</p>
      <div className={`flex items-center gap-3 border rounded-2xl px-4 py-3.5 transition-all bg-white
                ${focused ? 'border-zinc-900 shadow-[0_0_0_3px_rgba(9,9,11,0.06)]' : 'border-zinc-200'}`}>
        <span className='shrink-0 text-zinc-400'>{icon}</span>
        <input
          ref={inputRef}
          type='text'
          value={value}
          placeholder={placeholder}
          className='flex-1 min-w-0 text-sm text-zinc-900 placeholder:text-zinc-300 outline-none bg-transparent'
          onChange={e => { onChange(e.target.value); setSelected(false) }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
        />
        {/* Clear / location buttons */}
        <div className='flex items-center gap-1.5 shrink-0'>
          {value && (
            <button onClick={onClear} className='w-5 h-5 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-all'>
              <X size={10} className='text-zinc-500' />
            </button>
          )}
          {showLocationButton && (
            <button
              onClick={onUseLocation}
              disabled={locationLoading}
              className='w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-500 flex items-center justify-center transition-all disabled:opacity-50'
              title='Use my location'
            >
              {locationLoading
                ? <Loader2 size={13} className='animate-spin' />
                : <LocateFixed size={13} />
              }
            </button>
          )}
        </div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className='absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-zinc-100 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden'
          >
            {loading ? (
              <div className='flex items-center gap-2.5 px-4 py-3.5 text-zinc-400 text-xs'>
                <Loader2 size={13} className='animate-spin shrink-0' />
                Searching…
              </div>
            ) : results.length > 0 ? (
              <ul className='max-h-56 overflow-y-auto divide-y divide-zinc-50'>
                {results.map(p => (
                  <li key={p.id}>
                    <button
                      onMouseDown={e => { e.preventDefault(); handleSelect(p) }}
                      className='w-full flex items-start gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors text-left'
                    >
                      <MapPin size={13} className='text-zinc-300 mt-0.5 shrink-0' />
                      <div className='min-w-0'>
                        <p className='text-xs font-bold text-zinc-800 truncate'>{p.name}</p>
                        <p className='text-[10px] text-zinc-400 truncate mt-0.5'>
                          {[p.city, p.state, p.country].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : value.length >= 3 && !loading ? (
              <div className='px-4 py-3.5 text-xs text-zinc-400 flex items-center gap-2'>
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

// ── Page ─────────────────────────────────────────────────────
const BookingPage = () => {
  const router = useRouter()

  const [vehicle, setVehicle] = useState("")
  const [mobile, setMobile] = useState("")
  const [pickupText, setPickupText] = useState("")
  const [dropText, setDropText] = useState("")
  const [pickupPlace, setPickupPlace] = useState<Place | null>(null)
  const [dropPlace, setDropPlace] = useState<Place | null>(null)
  const [locLoading, setLocLoading] = useState(false)
  const [locError, setLocError] = useState("")

  // Progress: each of 4 steps filled
  const progress = [!!vehicle, mobile.length === 10, !!pickupPlace, !!dropPlace].filter(Boolean).length

  // Current location → fill pickup
  const useCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) { setLocError("Geolocation not supported"); return }
    setLocLoading(true)
    setLocError("")
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
          setLocError("Location lookup failed")
        } finally {
          setLocLoading(false)
        }
      },
      () => { setLocError("Location access denied"); setLocLoading(false) },
      { timeout: 8000 }
    )
  }, [])

  const canBook = vehicle && mobile.length === 10 && pickupPlace && dropPlace

  return (
    <div className='min-h-screen bg-zinc-100 flex items-center justify-center px-4 py-10'>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className='w-full max-w-md'
      >

        {/* Header */}
        <div className='flex items-center gap-4 mb-5 px-1'>
          <motion.button whileTap={{ scale: 0.88 }} onClick={() => router.push("/")}
            className='w-11 h-11 rounded-2xl bg-white border border-zinc-200 shadow-sm flex items-center justify-center hover:bg-zinc-50 transition-colors shrink-0'>
            <ArrowLeft size={14} className='text-zinc-900' />
          </motion.button>
          <div className='flex-1 min-w-0'>
            <h1 className='text-zinc-900 text-xl font-black tracking-tight'>Book a Ride</h1>
            <p className='text-zinc-400 text-xs mt-0.5'>Fill in the details below</p>
          </div>
          {/* Progress dots */}
          <div className='flex items-center gap-1.5 shrink-0'>
            {[0, 1, 2, 3].map((_, i) => (
              <motion.div
                key={i}
                animate={{ width: i < progress ? 20 : 8, background: i < progress ? '#09090b' : '#d4d4d8' }}
                transition={{ duration: 0.3 }}
                className='h-2 rounded-full'
              />
            ))}
          </div>
        </div>

        {/* Card */}
        <div className='bg-white rounded-3xl border border-zinc-200 shadow-[0_4px_30px_rgba(0,0,0,0.07)] overflow-hidden'>
          {/* Top accent */}
          <motion.div
            className='h-1 bg-zinc-900 origin-left'
            animate={{ scaleX: progress / 4 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />

          <div className='p-6 space-y-7'>

            {/* Step 1 — Vehicle */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <div className='flex items-center gap-2 mb-3'>
                <div className='w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center shrink-0'>
                  <span className='text-white text-[9px] font-black'>1</span>
                </div>
                <p className='text-xs font-black text-zinc-500 uppercase tracking-widest'>Choose Vehicle</p>
              </div>
              <div className='grid grid-cols-3 gap-2'>
                {VEHICLES.map(v => {
                  const Icon = v.icon
                  const active = vehicle === v.id
                  return (
                    <motion.button
                      key={v.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setVehicle(v.id)}
                      className={`relative flex flex-col items-center gap-1.5 py-3.5 px-2 rounded-2xl border transition-all duration-200
                                                ${active ? 'bg-zinc-900 border-zinc-900 text-white shadow-[0_4px_16px_rgba(0,0,0,0.2)]' : 'border-zinc-100 hover:border-zinc-300 text-zinc-600'}`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${active ? 'bg-white text-zinc-900' : 'bg-zinc-50 text-zinc-600'}`}>
                        <Icon size={16} strokeWidth={1.8} />
                      </div>
                      <span className='text-[11px] font-black leading-none'>{v.label}</span>
                      <span className={`text-[9px] leading-none ${active ? 'text-zinc-400' : 'text-zinc-400'}`}>{v.desc}</span>
                      {active && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                          className='absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-white flex items-center justify-center'>
                          <div className='w-1.5 h-1.5 rounded-full bg-zinc-900' />
                        </motion.div>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>

            {/* Divider */}
            <div className='h-px bg-zinc-100' />

            {/* Step 2 — Mobile */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className='flex items-center gap-2 mb-3'>
                <div className='w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center shrink-0'>
                  <span className='text-white text-[9px] font-black'>2</span>
                </div>
                <p className='text-xs font-black text-zinc-500 uppercase tracking-widest'>Mobile Number</p>
              </div>
              <div className={`flex items-center gap-3 border rounded-2xl px-4 py-3.5 transition-all bg-white
                                ${mobile.length === 10 ? 'border-emerald-300' : 'border-zinc-200 focus-within:border-zinc-900 focus-within:shadow-[0_0_0_3px_rgba(9,9,11,0.06)]'}`}>
                <Phone size={15} className='text-zinc-400 shrink-0' />
                <span className='text-sm text-zinc-400 shrink-0'>+91</span>
                <div className='w-px h-4 bg-zinc-200 shrink-0' />
                <input
                  type='tel'
                  inputMode='numeric'
                  maxLength={10}
                  value={mobile}
                  placeholder='Enter mobile number'
                  className='flex-1 min-w-0 text-sm text-zinc-900 placeholder:text-zinc-300 outline-none bg-transparent tracking-wider'
                  onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                />
                {mobile.length === 10 && (
                  <div className='w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0'>
                    <span className='text-white text-[9px]'>✓</span>
                  </div>
                )}
              </div>
              {mobile.length > 0 && mobile.length < 10 && (
                <p className='text-[10px] text-amber-500 font-semibold mt-1.5 ml-1'>{10 - mobile.length} more digits needed</p>
              )}
            </motion.div>

            {/* Divider */}
            <div className='h-px bg-zinc-100' />

            {/* Step 3 — Pickup */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <div className='flex items-center gap-2 mb-3'>
                <div className='w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center shrink-0'>
                  <span className='text-white text-[9px] font-black'>3</span>
                </div>
                <p className='text-xs font-black text-zinc-500 uppercase tracking-widest'>Pickup Location</p>
              </div>
              <AddressField
                label=''
                value={pickupText}
                icon={<Navigation2 size={15} />}
                placeholder='Where should we pick you up?'
                onChange={v => { setPickupText(v); if (!v) setPickupPlace(null) }}
                onSelect={p => { setPickupPlace(p); setPickupText(p.fullLabel) }}
                onClear={() => { setPickupText(''); setPickupPlace(null) }}
                showLocationButton
                onUseLocation={useCurrentLocation}
                locationLoading={locLoading}
              />
              {locError && (
                <p className='text-[10px] text-red-500 font-semibold mt-1.5 ml-1'>{locError}</p>
              )}
              {pickupPlace && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className='mt-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200'>
                  <div className='w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0' />
                  <p className='text-[10px] text-emerald-700 font-semibold truncate'>{pickupPlace.fullLabel}</p>
                </motion.div>
              )}
            </motion.div>

            {/* Step 4 — Drop */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className='flex items-center gap-2 mb-3'>
                <div className='w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center shrink-0'>
                  <span className='text-white text-[9px] font-black'>4</span>
                </div>
                <p className='text-xs font-black text-zinc-500 uppercase tracking-widest'>Drop Location</p>
              </div>
              <AddressField
                label=''
                value={dropText}
                icon={<MapPin size={15} />}
                placeholder='Where are you heading?'
                onChange={v => { setDropText(v); if (!v) setDropPlace(null) }}
                onSelect={p => { setDropPlace(p); setDropText(p.fullLabel) }}
                onClear={() => { setDropText(''); setDropPlace(null) }}
              />
              {dropPlace && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className='mt-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200'>
                  <div className='w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0' />
                  <p className='text-[10px] text-zinc-600 font-semibold truncate'>{dropPlace.fullLabel}</p>
                </motion.div>
              )}
            </motion.div>

          </div>

          {/* CTA footer */}
          <div className='px-6 pb-6'>
            <motion.button
              whileHover={canBook ? { scale: 1.01 } : {}}
              whileTap={canBook ? { scale: 0.975 } : {}}
              disabled={!canBook}
              className='w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-zinc-900 hover:bg-black text-white text-sm font-black transition-all disabled:opacity-30 disabled:cursor-not-allowed'
              onClick={() => {
                // Navigate to ride confirmation or call booking API
                router.push(`/search?pickup=${encodeURIComponent(pickupPlace)}&drop=${dropPlace}&vehicle=${vehicle}`)
              }}
            >
              Find Available Riders
              <ChevronRight size={15} />
            </motion.button>

            {!canBook && (
              <p className='text-center text-[10px] text-zinc-300 mt-2.5'>
                {!vehicle ? 'Select a vehicle to continue' :
                  mobile.length !== 10 ? 'Enter your 10-digit mobile number' :
                    !pickupPlace ? 'Enter a pickup location' :
                      'Enter a drop location'}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default BookingPage