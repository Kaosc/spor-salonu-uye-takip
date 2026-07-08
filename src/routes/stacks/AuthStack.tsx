import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import LoginScreen from "../../screens/LoginScreen"
import RegisterScreen from "../../screens/RegisterScreen"

const Stack = createNativeStackNavigator()

export default function AuthStack() {
	return (
		<Stack.Navigator>
			<Stack.Screen
				name="LoginScreen"
				component={LoginScreen}
			/>
			<Stack.Screen
				name="RegisterScreen"
				component={RegisterScreen}
			/>
		</Stack.Navigator>
	)
}
