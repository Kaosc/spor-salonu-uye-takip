import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { staffLogin, memberLogin } from "../../lib/firebase/auth"

export const staffLoginAction = createAsyncThunk(
	"auth/staffLoginAction",
	async ({ email, password }: { email: string; password: string }) => {
		const result = await staffLogin(email, password)
		return { uid: result.uid, email: result.email, role: result.role }
	},
)

export const memberLoginAction = createAsyncThunk(
	"auth/memberLoginAction",
	async ({ email, password }: { email: string; password: string }) => {
		const result = await memberLogin(email, password)
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
			// Staff login actions
			.addCase(staffLoginAction.pending, (state) => {
				state.isLoading = true
			})
			.addCase(staffLoginAction.fulfilled, (state, action) => {
				state.isAuthenticated = true
				state.uid = action.payload.uid
				state.email = action.payload.email
				state.role = action.payload.role
				state.isLoading = false
			})
			.addCase(staffLoginAction.rejected, (state) => {
				state.isLoading = false
			})
			// Member login actions
			.addCase(memberLoginAction.pending, (state) => {
				state.isLoading = true
			})
			.addCase(memberLoginAction.fulfilled, (state, action) => {
				state.isAuthenticated = true
				state.uid = action.payload.uid
				state.email = action.payload.email
				state.role = action.payload.role
				state.isLoading = false
			})
			.addCase(memberLoginAction.rejected, (state) => {
				state.isLoading = false
			})
	},
})

export const { logout } = authSlice.actions
