import { createNativeStackNavigator } from "@react-navigation/native-stack"

import CheckinsCalendarScreen from "../../screens/CheckinsCalendarScreen"
import DailyCheckinsScreen from "../../screens/DailyCheckinsScreen"

const Stack = createNativeStackNavigator()

export default function CheckinsStack() {
	return (
		<Stack.Navigator
			initialRouteName="CheckinsCalendarScreen"
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen
				name="CheckinsCalendarScreen"
				component={CheckinsCalendarScreen}
			/>
			<Stack.Screen
				name="DailyCheckinsScreen"
				component={DailyCheckinsScreen}
			/>
		</Stack.Navigator>
	)
}
