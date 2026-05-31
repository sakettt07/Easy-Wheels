import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice"
import { persistenceMiddleware, loadPersistedState } from "./persistedSlice"

// Load initial state from localStorage if available
const preloadedState = loadPersistedState()

export const store = configureStore({
    reducer: {
        user: userReducer
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['user/setUserData'],
                ignoredPaths: ['user.userData'],
            },
        }).concat(persistenceMiddleware),
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch