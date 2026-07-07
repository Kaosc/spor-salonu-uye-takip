import React from "react"
import { createStackNavigator } from "@react-navigation/stack"
import HomeScreen from "../screens/HomeScreen"
import AboutScreen from "../screens/AboutScreen"

export type RootStackParamList = {
	Home: undefined
	About: undefined
}

const Stack = createStackNavigator<RootStackParamList>()

export default function RootNavigator() {
	return (
		<Stack.Navigator initialRouteName="Home">
			<Stack.Screen
				name="Home"
				component={HomeScreen}
				options={{ title: "Home" }}
			/>
			<Stack.Screen
				name="About"
				component={AboutScreen}
				options={{ title: "About Us" }}
			/>
		</Stack.Navigator>
	)
}
