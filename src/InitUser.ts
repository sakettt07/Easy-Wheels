'use client'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import useGetMe from './hooks/useGetMe';
import { useDispatch } from 'react-redux';
import { clearUserData } from './redux/userSlice';
import { clearPersistedState } from './redux/persistedSlice';

const InitUser = () => {
    const { status } = useSession();
    const dispatch = useDispatch();
    const { refresh } = useGetMe();

    // Fetch user data when authenticated
    useEffect(() => {
        if (status === "authenticated") {
            refresh()
        }
    }, [status, refresh])

    // Clear user data and persisted state when user logs out
    useEffect(() => {
        if (status === "unauthenticated") {
            dispatch(clearUserData())
            clearPersistedState()
        }
    }, [status, dispatch])

    return null
}

export default InitUser