'use client'
import React, { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MapPin, Navigation, Calendar, ShieldCheck, ChevronRight, Car, Phone, ArrowLeft, Loader2 } from "lucide-react";
import Image from "next/image";
import axios from "axios";

const CheckoutContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isBooking, setIsBooking] = useState(false);
    const [error, setError] = useState("");

    // Extracting data passed from the search page
    const pickup = searchParams.get("pickup") || "Pickup location not specified";
    const drop = searchParams.get("drop") || "Drop-off location not specified";
    const vehicleType = searchParams.get("vehicleType") || "Standard";
    const vehicleModel = searchParams.get("vehicleModel") || "Vehicle";
    const vehicleImage = searchParams.get("vehicleImage") || "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=2071&auto=format&fit=crop";
    const mobile = searchParams.get("mobile") || "";
    const baseFare = Number(searchParams.get("fare")) || 0;
    
    // API specific parameters
    const riderId = searchParams.get("riderId");
    const vehicleId = searchParams.get("vehicleId");
    const pickupLat = Number(searchParams.get("pickupLat")) || 0;
    const pickupLng = Number(searchParams.get("pickupLng")) || 0;
    const dropLat = Number(searchParams.get("dropLat")) || 0;
    const dropLng = Number(searchParams.get("dropLng")) || 0;

    // Pricing calculation
    const tax = baseFare * 0.05; // 5% tax
    const platformFee = 5.00;
    const totalFare = baseFare + tax + platformFee;

    const handleConfirmBooking = async () => {
        try {
            setIsBooking(true);
            setError("");
            
            const payload = {
                riderId,
                vehicleId,
                pickupAddress: pickup,
                dropAddress: drop,
                pickUpLocation: {
                    type: "Point",
                    coordinates: [pickupLng, pickupLat]
                },
                dropLocation: {
                    type: "Point",
                    coordinates: [dropLng, dropLat]
                },
                fare: totalFare,
                mobileNumber: mobile
            };
            
            const response = await axios.post("/api/booking/create", payload);
            
            if (response.data.bookingId) {
                router.push("/bookings"); // Redirect to bookings page on success
            }
        } catch (err: any) {
            console.error("Booking error:", err);
            setError(err.response?.data?.message || "Failed to create booking. Please try again.");
        } finally {
            setIsBooking(false);
        }
    };

    return (
        <div 
            className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans relative bg-neutral-50"
            style={{
                backgroundImage: 'linear-gradient(to right, rgba(163, 163, 163, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(163, 163, 163, 0.15) 1px, transparent 1px)',
                backgroundSize: '32px 32px'
            }}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-neutral-50 pointer-events-none"></div>
            
            <div className="max-w-6xl mx-auto relative z-10">
                <div className="mb-8 flex items-center gap-4">
                    <button 
                        onClick={() => router.back()}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white shadow-sm transition-all hover:bg-neutral-100 active:scale-95 cursor-pointer"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-5 h-5 text-neutral-700" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Checkout</h1>
                        <p className="text-neutral-500 mt-1">Review your booking details and complete payment.</p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Left Column - Booking Details */}
                    <div className="w-full lg:w-2/3 space-y-6">
                        
                        {/* Vehicle Summary */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 transition-all hover:shadow-md">
                            <h2 className="text-xl font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                                <Car className="w-5 h-5 text-zinc-800" />
                                Selected Vehicle
                            </h2>
                            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                                <div className="w-full sm:w-48 h-32 relative rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                                    <Image 
                                        src={vehicleImage} 
                                        alt={vehicleModel}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1 space-y-2 text-center sm:text-left">
                                    <h3 className="text-2xl font-bold text-neutral-900 capitalize">{vehicleModel}</h3>
                                    <p className="text-neutral-500 font-medium capitalize">{vehicleType}</p>
                                    <div className="inline-flex items-center gap-2 bg-zinc-50 text-zinc-700 px-3 py-1.5 rounded-full text-sm font-semibold mt-2 border border-zinc-200">
                                        <Phone className="w-4 h-4" />
                                        Contact: {mobile ? `+91 ${mobile}` : 'Not provided'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Route Details */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 transition-all hover:shadow-md">
                            <h2 className="text-xl font-semibold text-neutral-800 mb-6 flex items-center gap-2">
                                <Navigation className="w-5 h-5 text-zinc-800" />
                                Route Information
                            </h2>
                            <div className="relative pl-6 space-y-8">
                                {/* Vertical dotted line for route */}
                                <div className="absolute left-[11px] top-6 bottom-6 w-0.5 border-l-2 border-dashed border-neutral-300"></div>
                                
                                <div className="relative">
                                    <div className="absolute -left-9 top-1 w-6 h-6 bg-zinc-100 rounded-full flex items-center justify-center">
                                        <div className="w-2.5 h-2.5 bg-zinc-800 rounded-full"></div>
                                    </div>
                                    <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-1">Pickup Location</h4>
                                    <p className="text-neutral-800 font-medium leading-relaxed">{pickup}</p>
                                </div>

                                <div className="relative">
                                    <div className="absolute -left-9 top-1 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                                        <MapPin className="w-3.5 h-3.5 text-red-600" />
                                    </div>
                                    <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-1">Drop-off Location</h4>
                                    <p className="text-neutral-800 font-medium leading-relaxed">{drop}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Payment & Summary */}
                    <div className="w-full lg:w-1/3 space-y-6">
                        
                        {/* Fare Breakdown */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 transition-all hover:shadow-md">
                            <h2 className="text-xl font-semibold text-neutral-800 mb-6">Payment Summary</h2>
                            
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center text-neutral-600">
                                    <span>Base Fare</span>
                                    <span className="font-medium">₹{baseFare.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-neutral-600">
                                    <span>Platform Fee</span>
                                    <span className="font-medium">₹{platformFee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-neutral-600">
                                    <span>Taxes (5%)</span>
                                    <span className="font-medium">₹{tax.toFixed(2)}</span>
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-neutral-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-neutral-800">Total Amount</span>
                                    <span className="text-2xl font-black text-zinc-900">₹{totalFare.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* CTA Button */}
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm font-semibold p-3 rounded-xl border border-red-100 text-center">
                                {error}
                            </div>
                        )}
                        <button 
                            onClick={handleConfirmBooking}
                            disabled={isBooking}
                            className="w-full bg-zinc-900 hover:bg-black disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-bold text-lg py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                        >
                            {isBooking ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Confirm Booking
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                        
                        <p className="text-xs text-center text-neutral-400 flex items-center justify-center gap-1 mt-4">
                            <ShieldCheck className="w-4 h-4" />
                            Payments are secure and encrypted
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CheckoutPage = () => {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
                    <p className="text-zinc-500 font-medium">Loading checkout details...</p>
                </div>
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
};

export default CheckoutPage;