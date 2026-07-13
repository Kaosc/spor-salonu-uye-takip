import { useSelector } from "react-redux"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import StaffTabNavigator from "./StaffTabNavigator"
import MemberTabNavigator from "./MemberTabNavigator"

import AuthStack from "./stacks/AuthStack"
import SettingsStack from "./stacks/SettingsStack"

import SearchScreen from "../screens/SearchScreen"
import ConsentScreen from "../screens/ConsentScreen"
import MemberDetailsScreen from "../screens/MemberDetailsScreen"

import { getConsentAccepted } from "../utils/storage"

const Stack = createNativeStackNavigator()

export default function RootNavigator() {
	const { isAuthenticated, role } = useSelector((state: RootState) => state.auth)
	console.log(role)
	return (
		<Stack.Navigator
			initialRouteName={
				getConsentAccepted() ? (isAuthenticated ? (role === "MEMBER" ? "MemberTabs" : "Tabs") : "AuthStack") : "Consent"
			}
			screenOptions={{
				headerShown: false,
			}}
		>
			{role !== "MEMBER" && (
				<Stack.Screen
					name="Tabs"
					component={StaffTabNavigator}
				/>
			)}
			<Stack.Screen
				name="MemberTabs"
				component={MemberTabNavigator}
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
