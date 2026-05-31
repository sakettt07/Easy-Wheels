import { IUser } from '@/models/user.model'
import { createSlice } from '@reduxjs/toolkit'

// Define a type for the slice state
interface IuserState {
    userData: IUser | null
}

// Define the initial state using that type
const initialState: IuserState = {
    userData: null,
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload
        },
        clearUserData: (state) => {
            state.userData = null
        }
    },
})

export const { setUserData, clearUserData } = userSlice.actions

export default userSlice.reducer