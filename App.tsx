import "react-native-gesture-handler"
import "react-native-reanimated"

import { Fontisto, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons"
import { useEffect } from "react"
import { useSelector } from "react-redux"
import { NavigationContainer } from "@react-navigation/native"
import BootSplash from "react-native-bootsplash"
import { useMMKVBoolean } from "react-native-mmkv"

import RootProvider from "./src/providers/RootProvider"
import RootNavigator from "./src/routes/RootNavigator"

import { NavigatorDark, NavigatorLight } from "./src/utils/theme"

export default function App() {
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const [_, setColdStart] = useMMKVBoolean("coldStart")

	const onReady = () => {
		setTimeout(() => {
			BootSplash.hide().catch(() => {})
		}, 1000)
	}

	useEffect(() => {
		prepare()
	}, [])

	async function prepare() {
		try {
			setColdStart(true)
			await MaterialIcons.loadFont()
			await MaterialCommunityIcons.loadFont()
			await Fontisto.loadFont()
		} catch (e) {
			console.warn("App.tsx:52", e)
		}
	}

	return (
		<RootProvider>
			<NavigationContainer
				onReady={onReady}
				theme={darkMode ? NavigatorDark : NavigatorLight}
			>
				<RootNavigator />
			</NavigationContainer>
		</RootProvider>
	)
}
