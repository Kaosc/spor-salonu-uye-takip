import { useSelector } from "react-redux"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import TabsNavigator from "./TabsNavigator"

import AuthStack from "./stacks/AuthStack"
import SettingsStack from "./stacks/SettingsStack"

import SearchScreen from "../screens/SearchScreen"
import ConsentScreen from "../screens/ConsentScreen"
import MemberDetailsScreen from "../screens/MemberDetailsScreen"

import { getConsentAccepted } from "../utils/storage"

const Stack = createNativeStackNavigator()

export default function RootNavigator() {
	const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)

	return (
		<Stack.Navigator
			initialRouteName={getConsentAccepted() ? (isAuthenticated ? "Tabs" : "AuthStack") : "Consent"}
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen
				name="Tabs"
				component={TabsNavigator}
			/>
			<Stack.Screen
				name="MemberDetailsScreen"
				component={MemberDetailsScreen}
			/>
			<Stack.Screen
				name="SearchScreen"
				component={SearchScreen}
			/>
			<Stack.Screen
				name="SettingsStack"
				component={SettingsStack}
			/>
			<Stack.Screen
				name="AuthStack"
				component={AuthStack}
			/>
			<Stack.Screen
				name="Consent"
				component={ConsentScreen}
			/>
		</Stack.Navigator>
	)
}
