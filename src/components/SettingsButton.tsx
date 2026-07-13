import { TouchableOpacity } from "react-native"
import { useNavigation, NavigationProp } from "@react-navigation/native"

import ThemedIcon from "./ui/ThemedIcon"

export default function SettingsButton() {
	const navigation = useNavigation() as NavigationProp<any>

	return (
		<TouchableOpacity
			style={{ marginRight: 15 }}
			onPress={() => navigation.navigate("SettingsStack", { screen: "SettingsScreen" })}
		>
			<ThemedIcon
				name="cog-outline"
				size={28}
			/>
		</TouchableOpacity>
	)
}
