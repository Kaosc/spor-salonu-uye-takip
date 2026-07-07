import { createNativeStackNavigator } from "@react-navigation/native-stack"

import DashboardScreen from "../../screens/DashboardScreen"
import MemberListScreen from "../../screens/MemberListScreen"
import MemberFormScreen from "../../screens/MemberFormScreen"
import ProfileScreen from "../../screens/ProfileScreen"

const Stack = createNativeStackNavigator()

export default function MainStack() {
	return (
		<Stack.Navigator>
			<Stack.Screen
				name="Dashboard"
				component={DashboardScreen}
			/>
			<Stack.Screen
				name="MemberList"
				component={MemberListScreen}
			/>
			<Stack.Screen
				name="MemberForm"
				component={MemberFormScreen}
			/>
			<Stack.Screen
				name="Profile"
				component={ProfileScreen}
			/>
		</Stack.Navigator>
	)
}
