'use client'
import React, { useEffect, useRef, useState } from 'react'
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Image from 'next/image';
import { div, track } from 'motion/react-client';
import { CheckCircle, Mic, MicOff, PhoneOff, Video, VideoOff, XCircle } from 'lucide-react';
import { useParams } from 'next/navigation';

const page = () => {
    const { userData } = useSelector((state: RootState) => state.user);
    const [joined, setJoined] = useState(false);
    const previewRef = useRef<HTMLVideoElement | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null)
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);
    const { roomId } = useParams()
    const [loading, setloading] = useState(false);
    const startCall = async () => {
        if (!containerRef) {
            return null;
        }
        setloading(true);
        try {
            const displayName = userData?.role == "admin" ? "Admin" : `${userData?.name} (${userData?.email})`
            const appId = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID)
            const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET
            const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
                appId, serverSecret!, roomId?.toString()!, userData?._id.toString()!, displayName
            )
            const zp = ZegoUIKitPrebuilt.create(kitToken)
            zp.joinRoom({
                container: containerRef.current,
                scenario: {
                    mode: ZegoUIKitPrebuilt.OneONoneCall,
                },
                showPreJoinView: false
            });
            setJoined(true);
            setloading(false);
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
                {joined && (
                    <div className='flex flex-wrap gap-3'>
                        {userData?.role === "admin" && (
                            <>
                                <button className='bg-green-600 hover:bg-green-700 px-4 py-2 rounded-full text-sm flex items-center gap-2'>
                                    <CheckCircle size={16} /> Approve
                                </button>
                                <button className='bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full text-sm flex items-center gap-2'> <XCircle size={16} /> Reject</button>
                            </>
                        )}
                        <button className='bg-red-700 hover:bg-red-800 px-4 py-2 rounded-full text-sm flex items-center gap-2'><PhoneOff /> End Call</button>
                    </div>
                )}
            </div>
            <div className='flex-1 relative'>
                <div ref={containerRef} className={`absolute inset-0 ${joined ? "block" : "hidden"}`} />
                {!joined && (
                    <div className="h-full flex items-center justify-center px-4 py-10">
                        <div className='w-ful max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
                            <div className='relative rounded-2xl overflow-hidden border border-white/10 bg-white/5'>
                                <video ref={previewRef} autoPlay playsInline />
                                {!isCameraOn && (
                                    <div className='absolute inset-0 bg-black flex items-center justify-center'>
                                        <VideoOff size={40} />
                                    </div>
                                )}
                            </div>
                            <div className='space-y-8 text-center lg:text-left '>
                                <h1 className='text-3xl sm:text-4xl font-bold'>Secure Video KYC</h1>
                            </div>
                            <div className='flex justify-center lg:justify-start gap-6'>
                                <button onClick={toggleCamera} className={`w-14 h-14 rounded-full flex items-center justify-center transition ${isCameraOn ? "bg-white text-black" : "bg-white/10 border border-white/20"}`}>{isCameraOn}?<Video />:<VideoOff /></button>
                                <button onClick={toggleMic} className={`w-14 h-14 rounded-full flex items-center justify-center transition ${isMicOn ? "bg-white text-black" : "bg-white/10 border border-white/20"}`}>{isMicOn}?<Mic />:<MicOff /></button>
                            </div>
                            <button onClick={startCall} className='w-full bg-white text-black py-4 rounded-xl font-semibold' disabled={loading}>
                                {loading ? "Connecting...." : "Join Secure Call"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default page