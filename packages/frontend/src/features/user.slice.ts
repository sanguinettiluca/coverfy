import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type Role = "ADMIN" | "BROKER" | "SUB_BROKER";

type User = {
    id: string;
    email: string;
    nombre: string;
    role: Role;
    brokerId: string | null;
};

type UserState = {
    logged: boolean;
    user: User | null;
};


const initialState: UserState = {
    logged: false,
    user: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        loguear: (state, action: PayloadAction<User>) => {
            state.logged = true;
            state.user = action.payload;
        },
        desloguear: (state) => {
            state.logged = false;
            state.user = null;
        }
    }
});

export const { loguear, desloguear } = userSlice.actions;

export default userSlice.reducer;