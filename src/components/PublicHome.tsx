'use client'
import React, { useState } from 'react'
import HeroSection from './HeroSection'
import VehicleSlider from './VehicleSlider'
import AuthModal from './AuthModal'
import Navbar from './Navbar'

const PublicHome = () => {
    const [authOpen, setAuthOpen] = useState(true);
    return (
        <>
            <HeroSection />
            <VehicleSlider />
            <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
        </>
    )
}

export default PublicHome