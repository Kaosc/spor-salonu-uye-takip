import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"

import HomeScreen from "./src/screens/HomeScreen"
import AboutScreen from "./src/screens/AboutScreen"

type RootStackParamList = {
	Home: undefined
	About: undefined
}

const Stack = createStackNavigator<RootStackParamList>()
export default function App() {
	return (
		<NavigationContainer>
			<Stack.Navigator initialRouteName="Home">
				<Stack.Screen
					name="Home"
					component={HomeScreen}
					options={{ title: "Home" }}
				/>
				<Stack.Screen
					name="About"
					component={AboutScreen}
					options={{ title: "About Us" }}
				/>
			</Stack.Navigator>
		</NavigationContainer>
	)
}