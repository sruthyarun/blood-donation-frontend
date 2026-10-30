import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentUser: JSON.parse(localStorage.getItem("loggedInUser")) || null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        loginUser: (state, action) => {
            state.currentUser = action.payload;
        },

        logoutUser: (state) => {
            state.currentUser = null;
            localStorage.removeItem("loggedInUser");
        },

        setUser: (state, action) => {
            state.currentUser = action.payload;
        },
    },
});

export const {
    loginUser,
    logoutUser,
    setUser,
} = userSlice.actions;

export default userSlice.reducer;