import { useSelector } from "react-redux"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import StaffTabNavigator from "./StaffTabNavigator"
import MemberTabNavigator from "./MemberTabNavigator"

import AuthStack from "./stacks/AuthStack"
import SettingsStack from "./stacks/SettingsStack"

import SearchScreen from "../screens/SearchScreen"
import ConsentScreen from "../screens/ConsentScreen"
import MemberDetailsScreen from "../screens/member/MemberDetailsScreen"

import { getConsentAccepted } from "../utils/storage"
import MemberFormScreen from "../screens/member/MemberFormScreen"
import StaffFormScreen from "../screens/staff/StaffFormScreen"

const Stack = createNativeStackNavigator()

export default function RootNavigator() {
	const { isAuthenticated, role } = useSelector((state: RootState) => state.auth)

	return (
		<Stack.Navigator
			initialRouteName={
				getConsentAccepted() ? (isAuthenticated ? (role === "MEMBER" ? "MemberTabs" : "Tabs") : "AuthStack") : "Consent"
			}
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen
				name="MemberTabs"
				component={MemberTabNavigator}
			/>
			<Stack.Screen
				name="Tabs"
				component={StaffTabNavigator}
			/>
			<Stack.Screen
				name="MemberDetailsScreen"
				component={MemberDetailsScreen}
			/>
			<Stack.Screen
				name="MemberFormScreen"
				component={MemberFormScreen}
			/>
			<Stack.Screen
				name="StaffFormScreen"
				component={StaffFormScreen}
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
