import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Calendar, Clock, User, Car, Phone, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

interface BookingCardProps {
    booking: any;
    viewRole: 'user' | 'rider';
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'requested': return 'bg-zinc-100 text-zinc-700 border-zinc-200';
        case 'awaiting_payment': return 'bg-amber-100 text-amber-700 border-amber-200';
        case 'confirmed': return 'bg-sky-100 text-sky-700 border-sky-200';
        case 'started': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'cancelled':
        case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
        default: return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
};

const getStatusLabel = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const BookingCard: React.FC<BookingCardProps> = ({ booking, viewRole }) => {
    const formattedDate = new Date(booking.createdAt).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
    
    const formattedTime = new Date(booking.createdAt).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit'
    });

    const displayAmount = viewRole === 'rider' ? (booking.riderAmount || booking.fare) : booking.fare;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden hover:shadow-md transition-shadow group"
        >
            {/* Header / Meta */}
            <div className="px-6 py-4 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-4 bg-zinc-50/50">
                <div className="flex items-center gap-3 text-sm text-zinc-500 font-medium">
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {formattedDate}</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-300"></span>
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {formattedTime}</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(booking.bookingStatus)}`}>
                    {getStatusLabel(booking.bookingStatus)}
                </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Locations */}
                    <div className="flex-1 relative">
                        <div className="absolute left-[11px] top-6 bottom-6 w-0.5 border-l-2 border-dashed border-neutral-200"></div>
                        
                        <div className="relative pl-8 mb-6">
                            <div className="absolute left-0 top-1 w-6 h-6 bg-zinc-100 rounded-full flex items-center justify-center">
                                <div className="w-2.5 h-2.5 bg-zinc-800 rounded-full"></div>
                            </div>
                            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Pickup</p>
                            <p className="text-sm font-semibold text-neutral-800 leading-snug line-clamp-2" title={booking.pickupAddress}>{booking.pickupAddress}</p>
                        </div>

                        <div className="relative pl-8">
                            <div className="absolute left-0 top-1 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                                <MapPin className="w-3.5 h-3.5 text-red-600" />
                            </div>
                            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Drop-off</p>
                            <p className="text-sm font-semibold text-neutral-800 leading-snug line-clamp-2" title={booking.dropAddress}>{booking.dropAddress}</p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="hidden lg:block w-px bg-neutral-100"></div>
                    <div className="block lg:hidden h-px w-full bg-neutral-100"></div>

                    {/* Details Right Side */}
                    <div className="flex-1 flex flex-col justify-between space-y-6">
                        
                        {/* Opposite Party Details */}
                        <div>
                            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
                                {viewRole === 'rider' ? 'Customer Details' : 'Rider Details'}
                            </p>
                            
                            {viewRole === 'rider' && booking.user ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                                        <User className="w-5 h-5 text-zinc-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-zinc-900 capitalize">{booking.user.name}</p>
                                        <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" /> {booking.userMobileNumber}</p>
                                    </div>
                                </div>
                            ) : null}

                            {viewRole === 'user' && booking.rider ? (
                                <div className="flex items-center gap-3">
                                    {booking.vehicle?.imageUrl ? (
                                        <div className="w-12 h-12 rounded-xl bg-zinc-100 relative overflow-hidden shrink-0">
                                            <Image src={booking.vehicle.imageUrl} alt="vehicle" fill className="object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                                            <Car className="w-6 h-6 text-zinc-600" />
                                        </div>
                                    )}
                                    
                                    <div>
                                        <p className="font-bold text-zinc-900 capitalize">{booking.rider.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-xs text-zinc-500">{booking.vehicle?.vehicleModel || 'Vehicle'}</p>
                                            <span className="w-1 h-1 rounded-full bg-zinc-300"></span>
                                            <p className="text-xs font-semibold text-zinc-700 bg-zinc-100 px-1.5 py-0.5 rounded shadow-sm">{booking.vehicle?.vehicleNumber || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            {(!booking.user && viewRole === 'rider') || (!booking.rider && viewRole === 'user') ? (
                                <p className="text-sm text-zinc-500 italic">Details pending...</p>
                            ) : null}
                        </div>

                        {/* Payment */}
                        <div className="flex items-center justify-between bg-zinc-50 rounded-xl p-4 border border-zinc-100 mt-auto">
                            <div>
                                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Total {viewRole === 'rider' ? 'Earnings' : 'Fare'}</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-black text-zinc-900">₹{displayAmount?.toFixed(2)}</span>
                                </div>
                            </div>
                            {booking.paymentStatus === 'paid' && (
                                <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-200">
                                    <CheckCircle2 className="w-4 h-4" /> Paid
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default BookingCard;
