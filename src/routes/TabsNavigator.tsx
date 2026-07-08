import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { useTranslation } from "react-i18next"
import { useSelector } from "react-redux"

import ThemedIcon from "../components/ui/ThemedIcon"

import MemberStack from "./stacks/MemberStack"
import DashboardScreen from "../screens/DashboardScreen"
import MemberFormScreen from "../screens/MemberFormScreen"
import ProfileScreen from "../screens/ProfileScreen"

import { BOTTOM_TAB_HEIGHT } from "../lib/constants"
import { moderateScale } from "../utils/responsive"

const Tabs = createBottomTabNavigator()

export default function TabsNavigator() {
	const { darkMode } = useSelector((state: RootState) => state.settings)
	const { t } = useTranslation()

	return (
		<Tabs.Navigator
			initialRouteName="DashboardScreen"
			backBehavior="initialRoute"
			screenOptions={{
				headerStyle: {
					elevation: 0,
				},
				tabBarStyle: {
					height: moderateScale(BOTTOM_TAB_HEIGHT),
					paddingBottom: 4,
					paddingTop: 2,
				},
				tabBarIconStyle: {
					width: moderateScale(29),
					height: moderateScale(29),
					marginBottom: 3,
				},
				tabBarActiveTintColor: darkMode ? "#ffffff" : "#000000",
				tabBarLabelStyle: {
					fontSize: moderateScale(11),
				},
				headerShown: false,
				freezeOnBlur: true,
				lazy: true,
			}}
		>
			<Tabs.Screen
				name="DashboardScreen"
				component={DashboardScreen}
				options={{
					tabBarIcon: (v) => (
						<ThemedIcon
							name={v.focused ? "home" : "home-outline"}
							size={31}
							color={v.color}
						/>
					),
					tabBarLabel: t("dashboard"),
				}}
			/>
			<Tabs.Screen
				name="MemberStack"
				component={MemberStack}
				options={{
					tabBarIcon: (v) => (
						<ThemedIcon
							name={v.focused ? "account-group" : "account-group-outline"}
							size={31}
							color={v.color}
						/>
					),
					tabBarLabel: t("memberList"),
				}}
			/>
			<Tabs.Screen
				name="MemberFormScreen"
				component={MemberFormScreen}
				options={{
					tabBarIcon: (v) => (
						<ThemedIcon
							name={v.focused ? "account-plus" : "account-plus-outline"}
							size={31}
							color={v.color}
						/>
					),
					tabBarLabel: t("memberForm"),
				}}
			/>
			<Tabs.Screen
				name="ProfileScreen"
				component={ProfileScreen}
				options={{
					tabBarIcon: (v) => (
						<ThemedIcon
							name={v.focused ? "account" : "account-outline"}
							size={31}
							color={v.color}
						/>
					),
					tabBarLabel: t("profile"),
				}}
			/>
		</Tabs.Navigator>
	)
}
