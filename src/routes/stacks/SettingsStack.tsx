import { createNativeStackNavigator } from "@react-navigation/native-stack"

import SettingsScreen from "../../screens/SettingsScreen"

const stack = createNativeStackNavigator()

export default function SettingsStack() {
	return (
		<stack.Navigator initialRouteName="SettingsScreen">
			<stack.Screen
				name="SettingsScreen"
				component={SettingsScreen}
				options={{
					headerShown: false,
				}}
			/>
		</stack.Navigator>
	)
}
