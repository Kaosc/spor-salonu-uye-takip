import { useColorScheme } from "react-native"
import { NavigationContainer } from "@react-navigation/native"
import { useSelector } from "react-redux"

import AuthStack from "./stacks/AuthStack"
import MainStack from "./stacks/MainStack"

import { LightTheme, DarkTheme } from "../utils/theme"

export default function RootNavigator() {
	const colorScheme = useColorScheme()
	const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)

	return (
		<NavigationContainer theme={colorScheme === "dark" ? DarkTheme : LightTheme}>
			{isAuthenticated ? <MainStack /> : <AuthStack />}
		</NavigationContainer>
	)
}
