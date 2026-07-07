import { ReactNode } from "react"
import { Provider as ReduxProvider } from "react-redux"
import { SafeAreaProvider } from "react-native-safe-area-context"

import { store } from "../store/store"

export default function RootProvider({ children }: { children: ReactNode }) {
	return (
		<ReduxProvider store={store}>
			<SafeAreaProvider>
				{children}
			</SafeAreaProvider>
		</ReduxProvider>
	)
}
