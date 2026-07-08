import React from "react"
import { View, StyleSheet } from "react-native"
import ThemedText from "../components/ui/ThemedText"

export default function MemberListScreen() {
	return (
		<View style={styles.container}>
			<ThemedText>MemberListScreen</ThemedText>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
})
