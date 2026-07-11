import { createNativeStackNavigator } from "@react-navigation/native-stack"

import MemberListScreen from "../../screens/MemberListScreen"
import MemberFormScreen from "../../screens/MemberFormScreen"
import SubscriptionFormScreen from "../../screens/SubscriptionFormScreen"

const Stack = createNativeStackNavigator()

export default function MemberStack() {
	return (
		<Stack.Navigator
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen
				name="MemberListScreen"
				component={MemberListScreen}
			/>
			<Stack.Screen
				name="MemberFormScreen"
				component={MemberFormScreen}
			/>
			<Stack.Screen
				name="SubscriptionFormScreen"
				component={SubscriptionFormScreen}
			/>
		</Stack.Navigator>
	)
}
