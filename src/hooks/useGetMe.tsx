'use client'

import { setUserData } from '@/redux/userSlice'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

const useGetMe = (enabled: Boolean) => {
    const dispatch = useDispatch()

    useEffect(() => {
        if (!enabled) {
            return
        }
        const getMe = async () => {
            try {
                const { data } = await axios.get("/api/user/me")
                dispatch(setUserData(data.user))
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        }
        getMe();
    }, [enabled, dispatch])
}

export default useGetMe