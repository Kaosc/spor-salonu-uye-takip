import React from "react"
import { View, Text, StyleSheet } from "react-native"

const HomeScreen = ({ navigation } : { navigation: any }) => {
	return (
		<View style={styles.container}>
			<Text>Welcome Home!</Text>
			<Button
				title="Go to About"
				onPress={() => navigation.navigate("About")}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
})

import { Button } from "react-native"

export default HomeScreen
