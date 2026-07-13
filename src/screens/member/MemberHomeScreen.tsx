import { View, StyleSheet } from "react-native"
import React from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigation, NavigationProp, StackActions } from "@react-navigation/native"
import ThemedText from "../../components/ui/ThemedText"

import { Theme } from "../../utils/theme"
import ThemedButton from "../../components/ui/ThemedButton"
import { logoutUser } from "../../lib/firebase/auth"
import { logout } from "../../store/features/authSlice"

export default function MemberHomeScreen() {
	const navigation = useNavigation() as NavigationProp<any>
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const auth = useSelector((state: RootState) => state.auth)
	const dispatch = useDispatch<any>()
	const styles = createStyles(darkMode)

	const handleLogout = async () => {
		await logoutUser()
		dispatch(logout())
		navigation.dispatch(StackActions.replace("AuthStack"))
	}

	return (
		<View>
			<ThemedText>Welcome, {auth.email}!</ThemedText>
			<ThemedText>Welcome, {auth.role}!</ThemedText>
			<ThemedButton
				onPress={handleLogout}
				text="Logout"
			></ThemedButton>
		</View>
	)
}

const createStyles = (darkMode: boolean) => {
	const theme = Theme[darkMode ? "dark" : "light"]
	return StyleSheet.create({})
}
