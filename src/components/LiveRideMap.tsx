import React, { useEffect } from "react";

function LiveRideMap({ driverPos, pickupPosition, dropPosition }: {
    driverPos: [number, number],
    pickupPosition: [number, number],
    dropPosition: [number, number]
}) {
    useEffect(() => {
        if (!driverPos) return;
        const [pLat, pLng] = pickupPosition as [number, number];
        const [dLat, dLng] = dropPosition as [number, number];
        const [driverLat, driverLng] = driverPos as [number, number];

        const getRoute = async () => {

        }
    }, [])
    return (
        <div>
            <h1>Live Ride Map</h1>
            <p>{pickupPosition}</p>
            <p>{dropPosition}</p>
        </div>
    );
}

export default LiveRideMap;