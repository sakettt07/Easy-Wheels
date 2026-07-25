'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import {
    LayersControl, MapContainer, Marker, Popup,
    Polyline, TileLayer, useMap, ZoomControl
} from 'react-leaflet'
import { Compass, Crosshair, LoaderCircle } from 'lucide-react'

// ── Custom icons ──────────────────────────────────────────────
const makePin = (color: string, label: string) =>
    L.divIcon({
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
            <div style="
              padding:5px 10px;border-radius:999px;background:${color};
              color:white;font-size:11px;font-weight:800;letter-spacing:0.06em;
              box-shadow:0 4px 14px rgba(0,0,0,0.25);white-space:nowrap;
            ">${label}</div>
            <div style="
              width:14px;height:14px;border-radius:9999px;border:2.5px solid white;
              background:${color};box-shadow:0 0 0 3px rgba(0,0,0,0.1);
            "></div>
          </div>
        `,
        className: '',
        iconSize: [90, 40],
        iconAnchor: [45, 40],
    })

const PICKUP_ICON = makePin('#09090b', 'PICKUP')
const DROP_ICON = makePin('#dc2626', 'DROP')

// ── Distance calc (fallback) ──────────────────────────────────
const haversineKm = (a: [number, number], b: [number, number]) => {
    const R = 6371, toR = (d: number) => (d * Math.PI) / 180
    const dLat = toR(b[0] - a[0]), dLng = toR(b[1] - a[1])
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a[0])) * Math.cos(toR(b[0])) * Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

// ── FitBounds ─────────────────────────────────────────────────
const FitBounds = ({ positions }: { positions: [number, number][] }) => {
    const map = useMap()
    useEffect(() => {
        if (!positions.length) return
        map.fitBounds(L.latLngBounds(positions), { padding: [60, 60], animate: true })
    }, [map, positions])
    return null
}

const MapReadyHandler = ({ onReady }: { onReady: () => void }) => {
    const map = useMap()

    useEffect(() => {
        map.whenReady(() => onReady())
    }, [map, onReady])

    return null
}

const MapRotationController = ({ rotation }: { rotation: number }) => {
    const map = useMap()

    useEffect(() => {
        const container = map.getContainer()
        container.style.transition = 'transform 0.25s ease'
        container.style.transform = `rotate(${rotation}deg)`
        container.style.transformOrigin = 'center center'

        return () => {
            container.style.transition = ''
            container.style.transform = ''
            container.style.transformOrigin = ''
        }
    }, [map, rotation])

    return null
}

// ── Recenter controller ───────────────────────────────────────
const RecenterControl = ({ positions }: { positions: [number, number][] }) => {
    const map = useMap()
    const recenter = useCallback(() => {
        if (!positions.length) return
        map.fitBounds(L.latLngBounds(positions), { padding: [60, 60], animate: true })
    }, [map, positions])

    return (
        <div className='leaflet-top leaflet-left' style={{ marginTop: 56, marginLeft: 10 }}>
            <div className='leaflet-control'>
                <button
                    onClick={recenter}
                    title='Recenter map'
                    style={{
                        width: 38, height: 38, borderRadius: 10,
                        background: 'white', border: '1px solid #e4e4e7',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f4f4f5')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                >
                    <Crosshair size={16} color='#09090b' />
                </button>
            </div>
        </div>
    )
}

// ── Types ─────────────────────────────────────────────────────
type MapLocation = { label: string; lat: number; lng: number }

type SearchMapProps = {
    locations: MapLocation[]
    onLocationChanged?: (type: 'pickup' | 'drop', location: MapLocation) => void
    onRouteLoaded?: (route: { distanceKm: number | null; durationMin: number | null }) => void
}

// ── Main component ────────────────────────────────────────────
const SearchMap = ({ locations, onLocationChanged, onRouteLoaded }: SearchMapProps) => {
    const [pickup, setPickup] = useState<MapLocation | null>(null)
    const [drop, setDrop] = useState<MapLocation | null>(null)
    const [routeLine, setRouteLine] = useState<[number, number][]>([])
    const [distanceKm, setDistanceKm] = useState<number | null>(null)
    const [durationMin, setDurationMin] = useState<number | null>(null)
    const [isMapLoading, setIsMapLoading] = useState(true)
    const [isUpdatingLocation, setIsUpdatingLocation] = useState(false)
    const [rotation, setRotation] = useState(0)

    useEffect(() => {
        setPickup(locations[0] ?? null)
        setDrop(locations[1] ?? null)
    }, [locations])

    useEffect(() => {
        if (!pickup || !drop) {
            setRouteLine([]); setDistanceKm(null); setDurationMin(null)
            onRouteLoaded?.({ distanceKm: null, durationMin: null })
            return
        }

        const fetchRoute = async () => {
            try {
                const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${drop.lng},${drop.lat}?overview=full&geometries=geojson`
                const res = await fetch(url)
                const data = await res.json()
                if (data?.routes?.[0]?.geometry?.coordinates?.length) {
                    const line = data.routes[0].geometry.coordinates.map(
                        ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
                    )
                    const km = Number((data.routes[0].distance / 1000).toFixed(1))
                    const min = Number((data.routes[0].duration / 60).toFixed(0))
                    setRouteLine(line); setDistanceKm(km); setDurationMin(min)
                    onRouteLoaded?.({ distanceKm: km, durationMin: min })
                    return
                }
            } catch { /* fall through */ }

            // Fallback: straight line
            const a: [number, number] = [pickup.lat, pickup.lng]
            const b: [number, number] = [drop.lat, drop.lng]
            const km = Number(haversineKm(a, b).toFixed(1))
            setRouteLine([a, b]); setDistanceKm(km); setDurationMin(null)
            onRouteLoaded?.({ distanceKm: km, durationMin: null })
        }

        fetchRoute()
    }, [pickup, drop, onRouteLoaded])

    const boundsPositions = useMemo<[number, number][]>(() => {
        if (routeLine.length) return routeLine
        const pts: [number, number][] = []
        if (pickup) pts.push([pickup.lat, pickup.lng])
        if (drop) pts.push([drop.lat, drop.lng])
        return pts
    }, [routeLine, pickup, drop])

    const mapCenter = useMemo<[number, number]>(() => {
        if (routeLine.length) return routeLine[Math.floor(routeLine.length / 2)]
        if (pickup && drop) return [(pickup.lat + drop.lat) / 2, (pickup.lng + drop.lng) / 2]
        if (pickup) return [pickup.lat, pickup.lng]
        if (drop) return [drop.lat, drop.lng]
        return [20.5937, 78.9629]
    }, [routeLine, pickup, drop])

    const reverseGeocode = useCallback(async (lat: number, lng: number) => {
        try {
            const res = await fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`)
            const data = await res.json()
            if (data?.features?.[0]?.properties?.formatted) return data.features[0].properties.formatted as string
        } catch {
            // fall through
        }
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    }, [])

    const handleDrag = async (type: 'pickup' | 'drop', pos: [number, number]) => {
        const nextLocation = { label: `${type === 'pickup' ? 'Pickup' : 'Drop'} location`, lat: pos[0], lng: pos[1] }
        if (type === 'pickup') {
            setPickup(nextLocation)
        } else {
            setDrop(nextLocation)
        }

        setIsUpdatingLocation(true)
        const resolvedLabel = await reverseGeocode(pos[0], pos[1])
        const updatedLocation = { ...nextLocation, label: resolvedLabel }
        if (type === 'pickup') {
            setPickup(updatedLocation)
        } else {
            setDrop(updatedLocation)
        }
        onLocationChanged?.(type, updatedLocation)
        setIsUpdatingLocation(false)
    }

    // Mid-route distance badge icon
    const distIcon = useMemo(() => distanceKm !== null
        ? L.divIcon({
            html: `<div style="background:rgba(255,255,255,0.96);padding:5px 11px;border-radius:999px;box-shadow:0 4px 18px rgba(0,0,0,0.14);font-weight:800;font-size:13px;color:#09090b;letter-spacing:-0.01em;">${distanceKm} km</div>`,
            className: '', iconSize: [110, 32], iconAnchor: [55, 16],
        })
        : null, [distanceKm])

    const isBusy = isMapLoading || isUpdatingLocation

    return (
        <div className='relative h-full w-full overflow-hidden rounded-[28px]'>
            <MapContainer center={mapCenter} zoom={13} style={{ width: '100%', height: '100%' }} zoomControl={false}>
                <MapReadyHandler onReady={() => setIsMapLoading(false)} />
                <MapRotationController rotation={rotation} />

                <ZoomControl position='topright' />

                <LayersControl position='topright'>
                    <LayersControl.BaseLayer checked name='Streets'>
                        <TileLayer
                            attribution='&copy; CARTO'
                            url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
                        />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name='Satellite'>
                        <TileLayer
                            attribution='&copy; Esri'
                            url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                        />
                    </LayersControl.BaseLayer>
                </LayersControl>

                <RecenterControl positions={boundsPositions} />

                {boundsPositions.length > 0 && <FitBounds positions={boundsPositions} />}

                {pickup && drop && routeLine.length > 0 && (
                    <>
                        <Polyline positions={routeLine} pathOptions={{ color: '#09090b', weight: 9, opacity: 0.08 }} />
                        <Polyline positions={routeLine} pathOptions={{ color: '#09090b', weight: 5, opacity: 1 }} />
                        {distIcon && (() => {
                            const mid = routeLine[Math.floor(routeLine.length / 2)]
                            return <Marker position={mid} icon={distIcon} interactive={false} />
                        })()}
                    </>
                )}

                {pickup && (
                    <Marker position={[pickup.lat, pickup.lng]} icon={PICKUP_ICON} draggable
                        eventHandlers={{ dragend: e => handleDrag('pickup', [e.target.getLatLng().lat, e.target.getLatLng().lng]) }}>
                        <Popup><p className='text-xs font-semibold'>Pickup</p><p className='text-xs text-zinc-500'>{pickup.label}</p></Popup>
                    </Marker>
                )}

                {drop && (
                    <Marker position={[drop.lat, drop.lng]} icon={DROP_ICON} draggable
                        eventHandlers={{ dragend: e => handleDrag('drop', [e.target.getLatLng().lat, e.target.getLatLng().lng]) }}>
                        <Popup><p className='text-xs font-semibold'>Drop</p><p className='text-xs text-zinc-500'>{drop.label}</p></Popup>
                    </Marker>
                )}
            </MapContainer>

            {isBusy && (
                <div className='absolute inset-0 z-[1000] flex items-center justify-center bg-white/70 backdrop-blur-sm'>
                    <div className='flex flex-col items-center gap-3 rounded-2xl border border-zinc-200 bg-white/95 px-5 py-4 shadow-xl'>
                        <LoaderCircle size={24} className='animate-spin text-zinc-900' />
                        <div className='text-center'>
                            <p className='text-sm font-semibold text-zinc-900'>{isUpdatingLocation ? 'Updating location…' : 'Loading map…'}</p>
                            <p className='text-xs text-zinc-500'>Preparing route and address details</p>
                        </div>
                    </div>
                </div>
            )}

            <div className='absolute bottom-4 right-4 z-[900] flex flex-col gap-2'>
                <button
                    type='button'
                    onClick={() => setRotation(prev => (prev + 45) % 360)}
                    className='flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white shadow-lg transition hover:-translate-y-0.5 hover:bg-zinc-50'
                    title='Rotate map'
                >
                    <Compass size={18} className='text-zinc-900' />
                </button>
                <button
                    type='button'
                    onClick={() => setRotation(0)}
                    className='rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 shadow-lg transition hover:bg-zinc-50'
                >
                    Reset
                </button>
            </div>
        </div>
    )
}

export default SearchMap