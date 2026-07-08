import { createNativeStackNavigator } from "@react-navigation/native-stack"

import MemberDetailsScreen from "../../screens/MemberDetailsScreen"
import MemberListScreen from "../../screens/MemberListScreen"
import MemberFormScreen from "../../screens/MemberFormScreen"
import SearchScreen from "../../screens/SearchScreen"

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
				name="SearchScreen"
				component={SearchScreen}
			/>
			<Stack.Screen
				name="MemberDetailsScreen"
				component={MemberDetailsScreen}
			/>
		</Stack.Navigator>
	)
}
