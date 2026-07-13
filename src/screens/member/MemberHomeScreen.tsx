import { View, StyleSheet } from "react-native"
import React from "react"
import { useSelector } from "react-redux"

import ThemedText from "../../components/ui/ThemedText"

import { Theme } from "../../utils/theme"

export default function MemberHomeScreen() {
  const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const auth = useSelector((state: RootState) => state.auth)

  const styles = createStyles(darkMode)

	return (
		<View>
			<ThemedText>Welcome, {auth.email}!</ThemedText>
			<ThemedText>Welcome, {auth.role}!</ThemedText>
		</View>
	)
}

const createStyles = (darkMode: boolean) => {
	const theme = Theme[darkMode ? "dark" : "light"]
	return StyleSheet.create({})
}
