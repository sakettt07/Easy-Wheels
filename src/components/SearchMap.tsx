'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import {
    LayersControl, MapContainer, Marker, Popup,
    Polyline, TileLayer, useMap, ZoomControl
} from 'react-leaflet'
import { Crosshair } from 'lucide-react'

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
    onRouteLoaded?: (route: { distanceKm: number | null; durationMin: number | null }) => void
}

// ── Main component ────────────────────────────────────────────
const SearchMap = ({ locations, onRouteLoaded }: SearchMapProps) => {
    const [pickup, setPickup] = useState<MapLocation | null>(null)
    const [drop, setDrop] = useState<MapLocation | null>(null)
    const [routeLine, setRouteLine] = useState<[number, number][]>([])
    const [distanceKm, setDistanceKm] = useState<number | null>(null)
    const [durationMin, setDurationMin] = useState<number | null>(null)

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

    const handleDrag = (type: 'pickup' | 'drop', pos: [number, number]) => {
        if (type === 'pickup') setPickup(p => p ? { ...p, lat: pos[0], lng: pos[1] } : p)
        else setDrop(p => p ? { ...p, lat: pos[0], lng: pos[1] } : p)
    }

    // Mid-route distance badge icon
    const distIcon = useMemo(() => distanceKm !== null
        ? L.divIcon({
            html: `<div style="background:rgba(255,255,255,0.96);padding:5px 11px;border-radius:999px;box-shadow:0 4px 18px rgba(0,0,0,0.14);font-weight:800;font-size:13px;color:#09090b;letter-spacing:-0.01em;">${distanceKm} km</div>`,
            className: '', iconSize: [110, 32], iconAnchor: [55, 16],
        })
        : null, [distanceKm])

    return (
        <div className='relative h-full w-full'>
            <MapContainer center={mapCenter} zoom={13} style={{ width: '100%', height: '100%' }} zoomControl={false}>

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

                {/* Recenter button — bottom-left of map controls */}
                <RecenterControl positions={boundsPositions} />

                {boundsPositions.length > 0 && <FitBounds positions={boundsPositions} />}

                {/* Route polyline */}
                {pickup && drop && routeLine.length > 0 && (
                    <>
                        {/* Shadow line */}
                        <Polyline positions={routeLine} pathOptions={{ color: '#09090b', weight: 9, opacity: 0.08 }} />
                        {/* Main line */}
                        <Polyline positions={routeLine} pathOptions={{ color: '#09090b', weight: 5, opacity: 1 }} />
                        {/* Distance badge at midpoint */}
                        {distIcon && (() => {
                            const mid = routeLine[Math.floor(routeLine.length / 2)]
                            return <Marker position={mid} icon={distIcon} interactive={false} />
                        })()}
                    </>
                )}

                {/* Pickup marker */}
                {pickup && (
                    <Marker position={[pickup.lat, pickup.lng]} icon={PICKUP_ICON} draggable
                        eventHandlers={{ dragend: e => handleDrag('pickup', [e.target.getLatLng().lat, e.target.getLatLng().lng]) }}>
                        <Popup><p className='text-xs font-semibold'>Pickup</p><p className='text-xs text-zinc-500'>{pickup.label}</p></Popup>
                    </Marker>
                )}

                {/* Drop marker */}
                {drop && (
                    <Marker position={[drop.lat, drop.lng]} icon={DROP_ICON} draggable
                        eventHandlers={{ dragend: e => handleDrag('drop', [e.target.getLatLng().lat, e.target.getLatLng().lng]) }}>
                        <Popup><p className='text-xs font-semibold'>Drop</p><p className='text-xs text-zinc-500'>{drop.label}</p></Popup>
                    </Marker>
                )}
            </MapContainer>
        </div>
    )
}

export default SearchMap