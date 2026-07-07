import React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { useDispatch } from "react-redux"
import { login } from "../store/features/authSlice"

export default function LoginScreen() {
	const dispatch = useDispatch()

	const auth = () => {
		dispatch(login())
	}

	return (
		<View style={styles.container}>
			<Text>LoginScreen</Text>
			<TouchableOpacity
				style={styles.button}
				onPress={auth}
			>
				<Text style={styles.buttonText}>Login</Text>
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
