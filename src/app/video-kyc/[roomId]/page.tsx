'use client'
import React, { useEffect, useRef, useState } from 'react'
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Image from 'next/image';
import { div, track } from 'motion/react-client';
import { VideoOff } from 'lucide-react';

const page = () => {
    const { userData } = useSelector((state: RootState) => state.user);
    const [joined, setJoined] = useState(false);
    const previewRef = useRef<HTMLVideoElement | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null)
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);
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

    useEffect(() => {
        if (joined) return;
        let localStream: MediaStream
        const init = async () => {
            try {
                localStream = await navigator.mediaDevices.getUserMedia({
                    video: true, audio: true
                })
                setStream(localStream);
                if (previewRef.current) {
                    previewRef.current.srcObject = localStream
                }
            } catch (error) {
                console.log(error);
            }
        }
        init()
    }, [])
    const toggleCamera = () => {
        if (!stream) return
        stream.getVideoTracks().forEach((track) => track.enabled != isCameraOn)
        setIsCameraOn(!isCameraOn)
    }
    const toggleMic = () => {
        if (!stream) return
        stream.getAudioTracks().forEach((track) => track.enabled != isMicOn)
        setIsMicOn(!isMicOn)
    }
    return (
        <div ref={containerRef} className='min-h-screen bg-black text-white flex flex-col'>
            <div className='px-6 py-4 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
                <div>
                    <Image src="/navLogos.png" alt="Easy Wheels" width={80} height={64} priority />
                    <p>{userData?.role === "admin" ? "Admin Verification" : "Partner Video KYC"}</p>
                </div>
            </div>
            <div className='flex-1 relative'>
                {!joined && (
                    <div className="h-full flex items-center justify-center px-4 py-10">
                        <div className='w-ful max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
                            <div className='relative rounded-2xl overflow-hidden border border-white/10 bg-white/5'>
                                <video ref={previewRef} autoPlay muted playsInline />
                                {!isCameraOn && (
                                    <div className='absolute inset-0 bg-black flex items-center justify-center'>
                                        <VideoOff size={40} />
                                    </div>
                                )}
                            </div>
                            <div className='space-y-8 text-center '>

                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default page