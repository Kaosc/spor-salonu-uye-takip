import React from "react"
import { View, Text, StyleSheet } from "react-native"

const AboutScreen = ({ navigation }: { navigation: any }) => {
	return (
		<View style={styles.container}>
			<Text>This is the About Screen</Text>
			<Button
				title="Go to Home"
				onPress={() => navigation.navigate("Home")}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
		alignItems: "center",
		justifyContent: "center",
	},
})

import { Button } from "react-native"

export default AboutScreen
