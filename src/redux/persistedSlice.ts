import { logger } from "@/lib/logger";
// Redux persistence middleware for client-side state persistence
import { Middleware } from '@reduxjs/toolkit'

const STORAGE_KEY = 'redux_state'

/**
 * Load persisted state from localStorage
 */
export const loadPersistedState: any = (): any => {
    try {
        if (typeof window === 'undefined') return undefined
        const serialized = localStorage.getItem(STORAGE_KEY)
        if (serialized === null) return undefined
        return JSON.parse(serialized)
    } catch (error: any) {
        logger.error('Failed to load persisted state:', error)
        return undefined
    }
}

/**
 * Persistence middleware that saves state to localStorage on every action
 */
export const persistenceMiddleware: Middleware =
    (store) => (next) => (action) => {
        const result = next(action)

        // Save state to localStorage after every action
        try {
            const state = store.getState()
            const serialized = JSON.stringify({
                user: state.user,
            })
            localStorage.setItem(STORAGE_KEY, serialized)
        } catch (error: any) {
            logger.error('Failed to persist state:', error)
        }

        return result
    }

/**
 * Clear persisted state (useful on logout)
 */
export const clearPersistedState = () => {
    try {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY)
        }
    } catch (error: any) {
        logger.error('Failed to clear persisted state:', error)
    }
}
