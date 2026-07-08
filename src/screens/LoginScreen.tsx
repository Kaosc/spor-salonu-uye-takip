import React from "react"
import { View, TouchableOpacity, StyleSheet } from "react-native"
import { useDispatch } from "react-redux"
import { useNavigation, NavigationProp } from "@react-navigation/native"

import ThemedText from "../components/ui/ThemedText"

import { login } from "../store/features/authSlice"

export default function LoginScreen() {
	const dispatch = useDispatch()
	const navigation = useNavigation() as NavigationProp<any>

	const auth = () => {
		dispatch(login())
		navigation.navigate("Tabs")
	}

	return (
		<View style={styles.container}>
			<TouchableOpacity
				style={styles.button}
				onPress={auth}
			>
				<ThemedText style={styles.buttonText}>Login</ThemedText>
			</TouchableOpacity>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	button: {
		backgroundColor: "#835db3",
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 4,
		marginTop: 16,
	},
	buttonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "600",
	},
})
