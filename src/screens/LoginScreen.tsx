import { useState } from "react"
import { View, Text, TextInput, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native"
import { useDispatch, useSelector } from "react-redux"
import { useNavigation, NavigationProp, StackActions } from "@react-navigation/native"
import { useTranslation } from "react-i18next"
import { Image } from "expo-image"

import { loginAction } from "../store/features/authSlice"
import ThemedButton from "../components/ui/ThemedButton"
import ThemedText from "../components/ui/ThemedText"

export default function LoginScreen() {
	const { darkMode } = useSelector((state: RootState) => state.settings)
	const { isLoading } = useSelector((state: RootState) => state.auth)
	const { t } = useTranslation()

	const dispatch = useDispatch<any>()
	const navigation = useNavigation() as NavigationProp<any>

	const styles = createStyles(darkMode)

	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [error, setError] = useState("")
	const [loginType, setLoginType] = useState<"STAFF" | "MEMBER">("STAFF")

	const handleLogin = async () => {
		if (!email.trim() || !password.trim()) {
			setError(t("emailAndPasswordRequired"))
			return
		}
		setError("")
		const result = await dispatch(loginAction({ email, password }))
		if (loginAction.fulfilled.match(result)) {
			navigation.dispatch(StackActions.replace("Tabs"))
		} else {
			setError(t("loginFailed"))
		}
	}

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<View style={styles.form}>
				<Image
					source={darkMode ? require("../assets/logow.png") : require("../assets/logob.png")}
					style={styles.logo}
				/>

				<ThemedText style={styles.title}>{loginType === "STAFF" ? t("staffLogin") : t("memberLogin")}</ThemedText>

				<TextInput
					style={styles.input}
					placeholder={t("email")}
					placeholderTextColor="#888"
					value={email}
					onChangeText={setEmail}
					autoCapitalize="none"
					keyboardType="email-address"
				/>

				<TextInput
					style={styles.input}
					placeholder={t("password")}
					placeholderTextColor="#888"
					value={password}
					onChangeText={setPassword}
					secureTextEntry
				/>

				{error ? <Text style={styles.error}>{error}</Text> : null}

				<ThemedButton
					onPress={handleLogin}
					disabled={isLoading}
				>
					{isLoading ? <ActivityIndicator color="#000" /> : <ThemedText style={styles.buttonText}>{t("login")}</ThemedText>}
				</ThemedButton>
			</View>
		</KeyboardAvoidingView>
	)
}

const createStyles = (darkMode: boolean) =>
	StyleSheet.create({
		container: {
			flex: 1,
			justifyContent: "flex-start",
			marginTop: 70,
			paddingHorizontal: 40,
		},
		form: {
			gap: 3,
			width: "100%",
		},
		title: {
			fontSize: 28,
			fontWeight: "700",
			marginBottom: 32,
			textAlign: "center",
		},
		input: {
			borderWidth: 1,
			borderColor: "#ccc",
			borderRadius: 8,
			paddingVertical: 12,
			paddingHorizontal: 16,
			fontSize: 16,
			color: darkMode ? "#fff" : "#000",
			marginBottom: 16,
		},
		buttonText: {
			color: darkMode ? "#000" : "#fff",
			fontSize: 16,
			fontWeight: "bold",
		},
		error: {
			color: "red",
			marginBottom: 8,
			textAlign: "center",
		},
		logo: {
			width: 140,
			height: 140,
			borderRadius: 20,
			marginBottom: 100,
			borderWidth: darkMode ? 0 : 1,
			alignSelf: "center",
			borderColor: "#ccc",
			borderBottomWidth: darkMode ? 0 : 2,
		},
	})
