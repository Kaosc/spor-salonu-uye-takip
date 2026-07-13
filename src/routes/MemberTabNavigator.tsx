import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { useTranslation } from "react-i18next"
import { useSelector } from "react-redux"

import ThemedIcon from "../components/ui/ThemedIcon"
import MemberHomeScreen from "../screens/member/MemberHomeScreen"

import { BOTTOM_TAB_HEIGHT } from "../lib/constants"
import { moderateScale } from "../utils/responsive"

const Tabs = createBottomTabNavigator()

export default function MemberTabNavigator() {
	const { darkMode } = useSelector((state: RootState) => state.settings)
	const { t } = useTranslation()

	return (
		<Tabs.Navigator
			initialRouteName="MemberHomeScreen"
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
				name="MemberHomeScreen"
				component={MemberHomeScreen}
				options={{
					tabBarIcon: (v) => (
						<ThemedIcon
							name={v.focused ? "home" : "home-outline"}
							size={31}
							color={v.color}
						/>
					),
					tabBarLabel: t("memberList"),
				}}
			/>
		</Tabs.Navigator>
	)
}
