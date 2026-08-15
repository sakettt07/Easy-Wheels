'use client'
import React, { useState } from 'react'
import HeroSection from './HeroSection'
import VehicleSlider from './VehicleSlider'
import AuthModal from './AuthModal'
import Navbar from './Navbar'
import ServicesSection from './ServicesSection'
import WhyChooseUsSection from './WhyChooseUsSection'
import TestimonialsSection from './TestimonialsSection'
import FaqSection from './FaqSection'

const PublicHome = () => {
    const [authOpen, setAuthOpen] = useState(false);
    return (
        <>
            <HeroSection onAuthRequired={() => setAuthOpen(true)} />
            <ServicesSection />
            <WhyChooseUsSection />
            <VehicleSlider />
            <TestimonialsSection />
            <FaqSection />
            <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
        </>
    )
}

export default PublicHome