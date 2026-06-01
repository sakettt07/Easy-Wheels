'use client'
import React, { useRef } from 'react'
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Image from 'next/image';

const page = () => {
    const { userData } = useSelector((state: RootState) => state.user)

    const containerRef = useRef<HTMLDivElement>(null);
    const startCall = async () => {
        if (!containerRef) {
            return null;
        }
        try {
            const appId = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID)
            const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET
            const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
                appId, serverSecret!, "edfiujni", userData?._id.toString()!, "saket"
            )
            const zp = ZegoUIKitPrebuilt.create(kitToken)
            zp.joinRoom({
                container: containerRef.current,
                scenario: {
                    mode: ZegoUIKitPrebuilt.OneONoneCall,
                },
                showPreJoinView: false
            });
        } catch (error) {
            console.log(error)
        }
    }
    return (
        <div ref={containerRef} className='min-h-screen bg-black text-white flex flex-col'>
            <div className='px-6 py-4 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
                <div>
                    <Image src="/navLogos.png" alt="Easy Wheels" width={80} height={64} priority />
                    <p>{userData?.role === "admin" ? "Admin Verification" : "Partner Video KYC"}</p>
                </div>
            </div>
        </div>
    )
}

export default page