import { createNativeStackNavigator } from "@react-navigation/native-stack"

import SubscriptionsScreen from "../../screens/SubscriptionsScreen"

const stack = createNativeStackNavigator()

export default function SubscriptionStack() {
	return (
		<stack.Navigator initialRouteName="SubscriptionScreen">
			<stack.Screen
				name="SubscriptionScreen"
				component={SubscriptionsScreen}
				options={{
					headerShown: false,
				}}
			/>
		</stack.Navigator>
	)
}
