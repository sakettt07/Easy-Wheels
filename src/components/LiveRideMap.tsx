'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, Polyline, TileLayer, useMap, LayersControl, ZoomControl } from 'react-leaflet'
import { Compass, Crosshair } from 'lucide-react'

// Helper for pins
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

const VEHICLE_ICON = L.divIcon({
    html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
            <div class="absolute w-full h-full bg-black/30 rounded-full animate-ping" style="animation-duration: 2s;"></div>
            <div style="
                position: relative; width: 36px; height: 36px; background: white; border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2); border: 3px solid #09090b; z-index: 10;
            ">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#09090b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
            </div>
        </div>
    `,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18]
})

const PICKUP_ICON = makePin('#09090b', 'PICKUP')
const DROP_ICON = makePin('#dc2626', 'DROP')

const makeDistanceIcon = (km: number, label: string) =>
    L.divIcon({
        html: `<div style="background:rgba(255,255,255,0.96);padding:5px 12px;border-radius:999px;box-shadow:0 4px 18px rgba(0,0,0,0.14);font-weight:800;font-size:13px;color:#09090b;letter-spacing:-0.01em;white-space:nowrap;display:flex;align-items:center;gap:6px;">${km} km <span style="font-size:9px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;margin-top:1px;">${label}</span></div>`,
        className: '',
        iconSize: [140, 32],
        iconAnchor: [70, 16],
    })

// Haversine distance fallback
const haversineKm = (a: [number, number], b: [number, number]) => {
    const R = 6371, toR = (d: number) => (d * Math.PI) / 180
    const dLat = toR(b[0] - a[0]), dLng = toR(b[1] - a[1])
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a[0])) * Math.cos(toR(b[0])) * Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

const FitBounds = ({ positions }: { positions: [number, number][] }) => {
    const map = useMap()
    useEffect(() => {
        if (!positions.length) return
        map.fitBounds(L.latLngBounds(positions), { padding: [60, 60], animate: true })
    }, [map, positions])
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

const RecenterControl = ({ positions }: { positions: [number, number][] }) => {
    const map = useMap()
    const recenter = useCallback(() => {
        if (!positions.length) return
        map.fitBounds(L.latLngBounds(positions), { padding: [60, 60], animate: true })
    }, [map, positions])

    return (
        <div className='absolute bottom-6 left-1/2 -translate-x-1/2 z-[900]'>
            <button
                type='button'
                onClick={recenter}
                className='flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-xl transition hover:-translate-y-0.5 hover:bg-zinc-50 cursor-pointer'
                title='Recenter map'
            >
                <Crosshair size={18} className='text-zinc-900' />
            </button>
        </div>
    )
}

export default function LiveRideMap({ driverLocation, mapStatus, pickupPosition, dropPosition, onRouteUpdate }: {
    driverLocation?: [number, number] | null,
    mapStatus: "arriving" | "ongoing" | "completed",
    pickupPosition?: [number, number] | null,
    dropPosition?: [number, number] | null,
    onRouteUpdate?: (distance: number | null, duration: number | null) => void
}) {
    const [routeToPickup, setRouteToPickup] = useState<{ line: [number, number][], distanceKm: number | null, durationMin: number | null }>({ line: [], distanceKm: null, durationMin: null })
    const [routeToDrop, setRouteToDrop] = useState<{ line: [number, number][], distanceKm: number | null, durationMin: number | null }>({ line: [], distanceKm: null, durationMin: null })
    const [rotation, setRotation] = useState(0)

    useEffect(() => {
        const fetchRoute = async (start: [number, number], end: [number, number]) => {
            try {
                const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
                const res = await fetch(url)
                const data = await res.json()
                if (data?.routes?.[0]?.geometry?.coordinates?.length) {
                    const line = data.routes[0].geometry.coordinates.map(
                        ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
                    )
                    const distanceKm = Number((data.routes[0].distance / 1000).toFixed(1))
                    const durationMin = Number((data.routes[0].duration / 60).toFixed(0))
                    return { line, distanceKm, durationMin }
                }
            } catch { }
            // fallback
            return { line: [start, end], distanceKm: Number(haversineKm(start, end).toFixed(1)), durationMin: null }
        }

        const updateRoutes = async () => {
            let activeDistance = null;
            let activeDuration = null;

            if (mapStatus === 'arriving') {
                if (driverLocation && pickupPosition) {
                    const res = await fetchRoute(driverLocation, pickupPosition);
                    setRouteToPickup(res)
                    activeDistance = res.distanceKm;
                    activeDuration = res.durationMin;
                }
                if (pickupPosition && dropPosition) {
                    setRouteToDrop(await fetchRoute(pickupPosition, dropPosition))
                }
            } else if (mapStatus === 'ongoing') {
                setRouteToPickup({ line: [], distanceKm: null, durationMin: null })
                if (driverLocation && dropPosition) {
                    const res = await fetchRoute(driverLocation, dropPosition);
                    setRouteToDrop(res)
                    activeDistance = res.distanceKm;
                    activeDuration = res.durationMin;
                }
            } else {
                setRouteToPickup({ line: [], distanceKm: null, durationMin: null })
                setRouteToDrop({ line: [], distanceKm: null, durationMin: null })
            }

            if (onRouteUpdate) {
                onRouteUpdate(activeDistance, activeDuration);
            }
        }

        updateRoutes()
    }, [driverLocation, pickupPosition, dropPosition, mapStatus])

    const boundsPositions = useMemo(() => {
        const pts: [number, number][] = []
        pts.push(...routeToPickup.line)
        pts.push(...routeToDrop.line)
        if (driverLocation) pts.push(driverLocation)
        if (pickupPosition) pts.push(pickupPosition)
        if (dropPosition) pts.push(dropPosition)
        return pts
    }, [routeToPickup, routeToDrop, driverLocation, pickupPosition, dropPosition])

    const center = boundsPositions.length > 0 ? boundsPositions[0] : [20.5937, 78.9629] as [number, number]

    return (
        <div className='absolute inset-0 z-0 bg-zinc-100 overflow-hidden'>
            <MapContainer center={center} zoom={13} style={{ width: '100%', height: '100%' }} zoomControl={false}>
                <MapRotationController rotation={rotation} />
                <ZoomControl position='topright' />

                <LayersControl position='topright'>
                    <LayersControl.BaseLayer checked name='Streets'>
                        <TileLayer
                            url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
                            attribution='&copy; CARTO'
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

                {/* Drop Route (Solid) */}
                {routeToDrop.line.length > 0 && (
                    <>
                        <Polyline positions={routeToDrop.line} pathOptions={{ color: '#09090b', weight: 8, opacity: 0.15 }} />
                        <Polyline positions={routeToDrop.line} pathOptions={{ color: '#09090b', weight: 4, opacity: 1 }} />
                        {routeToDrop.distanceKm !== null && (() => {
                            const mid = routeToDrop.line[Math.floor(routeToDrop.line.length / 2)]
                            return <Marker position={mid} icon={makeDistanceIcon(routeToDrop.distanceKm, 'TO DROP')} interactive={false} />
                        })()}
                    </>
                )}

                {/* Pickup Route (Dashed) */}
                {routeToPickup.line.length > 0 && (
                    <>
                        <Polyline positions={routeToPickup.line} pathOptions={{ color: '#09090b', weight: 4, dashArray: '8, 8', opacity: 0.6 }} />
                        {routeToPickup.distanceKm !== null && (() => {
                            const mid = routeToPickup.line[Math.floor(routeToPickup.line.length / 2)]
                            return <Marker position={mid} icon={makeDistanceIcon(routeToPickup.distanceKm, 'TO PICKUP')} interactive={false} />
                        })()}
                    </>
                )}

                {/* Show all relevant markers */}
                {driverLocation && <Marker position={driverLocation} icon={VEHICLE_ICON} />}
                {pickupPosition && <Marker position={pickupPosition} icon={PICKUP_ICON} />}
                {dropPosition && <Marker position={dropPosition} icon={DROP_ICON} />}
            </MapContainer>

            {/* Rotation Controls (Bottom Right) */}
            <div className='absolute bottom-6 right-6 z-[900] flex flex-col gap-2'>
                <button
                    type='button'
                    onClick={() => setRotation(prev => (prev + 45) % 360)}
                    className='flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white shadow-lg transition hover:-translate-y-0.5 hover:bg-zinc-50 cursor-pointer'
                    title='Rotate map'
                >
                    <Compass size={18} className='text-zinc-900' />
                </button>
                {rotation !== 0 && (
                    <button
                        type='button'
                        onClick={() => setRotation(0)}
                        className='rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 shadow-lg transition hover:bg-zinc-50 cursor-pointer'
                    >
                        Reset
                    </button>
                )}
            </div>
        </div>
    )
}