import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { BookOpen } from 'lucide-react'

export default function BookingsPage() {
    return (
        <div className='min-h-screen bg-[#f5f5f3]'>
            <Navbar />
            <main className='max-w-4xl mx-auto px-4 py-24'>
                <div className='rounded-[28px] border border-zinc-200 bg-white p-10 shadow-[0_20px_80px_rgba(0,0,0,0.08)]'>
                    <div className='flex items-center gap-4'>
                        <div className='w-14 h-14 rounded-3xl bg-zinc-900 text-white flex items-center justify-center'>
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <p className='text-sm font-black uppercase tracking-[0.23em] text-zinc-400'>Live Bookings</p>
                            <h1 className='text-4xl font-black text-zinc-900 mt-2'>Your ride is ready</h1>
                        </div>
                    </div>
                    <p className='text-zinc-500 mt-6 text-sm leading-relaxed'>This is where your active bookings will appear when customers request rides. Your vehicle is live and accepting bookings once the onboarding is complete.</p>

                    <div className='mt-10 rounded-3xl border border-dashed border-zinc-200 bg-zinc-50 p-8 text-center'>
                        <p className='text-xl font-black text-zinc-900'>No bookings yet</p>
                        <p className='mt-3 text-sm text-zinc-500'>When a customer books your vehicle, the booking details will show up here instantly.</p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
