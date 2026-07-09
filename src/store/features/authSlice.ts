import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { loginWithEmail } from "../../lib/firebase/auth"

export const loginAction = createAsyncThunk(
	"auth/loginAction",
	async ({ email, password }: { email: string; password: string }) => {
		const result = await loginWithEmail(email, password)
		return { uid: result.uid, email: result.email, role: result.role }
	},
)

export const authSlice = createSlice({
	name: "auth",
	initialState: {
		isAuthenticated: false,
		uid: undefined,
		email: undefined,
		role: undefined,
		isLoading: false,
	} as Auth,
	reducers: {
		logout(state) {
			state.isAuthenticated = false
			state.uid = undefined
			state.email = undefined
			state.role = undefined
			state.isLoading = false
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(loginAction.pending, (state) => {
				state.isLoading = true
			})
			.addCase(loginAction.fulfilled, (state, action) => {
				state.isAuthenticated = true
				state.uid = action.payload.uid
				state.email = action.payload.email
				state.role = action.payload.role
				state.isLoading = false
			})
			.addCase(loginAction.rejected, (state) => {
				state.isLoading = false
			})
	},
})

export const { logout } = authSlice.actions
