'use client'
import { logger } from "@/lib/logger";

import { setUserData } from '@/redux/userSlice'
import axios from 'axios'
import { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'

const useGetMe = () => {
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const refresh = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const { data } = await axios.get("/api/user/me")
            dispatch(setUserData(data.user))
            return data.user
        } catch (err: any) {
            const errorMsg = err?.response?.data?.message || 'Error fetching user data'
            setError(errorMsg)
            logger.error('Error fetching user data:', err)
            throw err
        } finally {
            setLoading(false)
        }
    }, [dispatch])

    return { refresh, loading, error }
}

export default useGetMe