'use client'
import React, { useState } from 'react'
import HeroSection from './HeroSection'
import VehicleSlider from './VehicleSlider'
import AuthModal from './AuthModal'
import Navbar from './Navbar'
import ServicesSection from './ServicesSection'

const PublicHome = () => {
    const [authOpen, setAuthOpen] = useState(false);
    return (
        <>
            <HeroSection onAuthRequired={() => setAuthOpen(true)} />
            <ServicesSection />
            <VehicleSlider />
            <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
        </>
    )
}

export default PublicHome