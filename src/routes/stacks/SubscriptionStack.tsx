import { createNativeStackNavigator } from "@react-navigation/native-stack"

import SubscriptionsScreen from "../../screens/SubscriptionsScreen"

const stack = createNativeStackNavigator()

export default function SubscriptionStack() {
	return (
		<stack.Navigator initialRouteName="SettingsScreen">
			<stack.Screen
				name="SettingsScreen"
				component={SubscriptionsScreen}
				options={{
					headerShown: false,
				}}
			/>
		</stack.Navigator>
	)
}
