import { configureStore } from "@reduxjs/toolkit"

import { authSlice } from "./features/authSlice"
import { configSlice } from "./features/configSlice"
import { settingsSlice } from "./features/settingsSlice"

export const store = configureStore({
	reducer: {
		settings: settingsSlice.reducer,
		config: configSlice.reducer,
		auth: authSlice.reducer,
	},
})