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

    // Fetch user data when authenticated
    useGetMe(status === "authenticated")

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