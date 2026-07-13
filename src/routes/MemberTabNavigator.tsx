import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { useTranslation } from "react-i18next"
import { useSelector } from "react-redux"

import ThemedIcon from "../components/ui/ThemedIcon"

import MemberStack from "./stacks/MemberStack"
import DashboardScreen from "../screens/DashboardScreen"
import SubscriptionStack from "./stacks/SubscriptionStack"

import { BOTTOM_TAB_HEIGHT } from "../lib/constants"
import { moderateScale } from "../utils/responsive"
import LockerScreen from "../screens/LockerScreen"

const Tabs = createBottomTabNavigator()

export default function StaffTabNavigator() {
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
				name="LockerScreen"
				component={LockerScreen}
				options={{
					tabBarIcon: (v) => (
						<ThemedIcon
							name={"locker"}
							size={31}
							color={v.color}
						/>
					),
					tabBarLabel: t("lockers"),
				}}
			/>
			<Tabs.Screen
				name="SubscriptionStack"
				component={SubscriptionStack}
				options={{
					tabBarIcon: (v) => (
						<ThemedIcon
							name={v.focused ? "card-account-details" : "card-account-details-outline"}
							size={31}
							color={v.color}
						/>
					),
					tabBarLabel: t("subscriptions"),
				}}
			/>
		</Tabs.Navigator>
	)
}
