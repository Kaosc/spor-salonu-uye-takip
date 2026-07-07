import RootProvider from "./src/providers/RootProvider"
import RootNavigator from "./src/routes/RootNavigator"

export default function App() {
	return (
		<RootProvider>
			<RootNavigator />
		</RootProvider>
	)
}
