import { useState } from "react"
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
} from "react-native"
import { useDispatch, useSelector } from "react-redux"
import { useNavigation, NavigationProp } from "@react-navigation/native"

import { loginAction } from "../store/features/authSlice"

export default function LoginScreen() {
	const { darkMode } = useSelector((state: RootState) => state.settings)
	const { isLoading } = useSelector((state: RootState) => state.auth)

	const dispatch = useDispatch<any>()
	const navigation = useNavigation() as NavigationProp<any>

	const styles = createStyles(darkMode)

	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [error, setError] = useState("")

	const handleLogin = async () => {
		if (!email.trim() || !password.trim()) {
			setError("Email ve şifre gerekli")
			return
		}
		setError("")
		const result = await dispatch(loginAction({ email, password }))
		if (loginAction.fulfilled.match(result)) {
			navigation.navigate("Tabs")
		} else {
			setError("Giriş başarısız. Email veya şifre hatalı.")
		}
	}

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<View style={styles.form}>
				<Text style={styles.title}>Giriş Yap</Text>

				<TextInput
					style={styles.input}
					placeholder="Email"
					placeholderTextColor="#888"
					value={email}
					onChangeText={setEmail}
					autoCapitalize="none"
					keyboardType="email-address"
				/>

				<TextInput
					style={styles.input}
					placeholder="Şifre"
					placeholderTextColor="#888"
					value={password}
					onChangeText={setPassword}
					secureTextEntry
				/>

				{error ? <Text style={styles.error}>{error}</Text> : null}

				<TouchableOpacity
					style={styles.button}
					onPress={handleLogin}
					disabled={isLoading}
				>
					{isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Giriş Yap</Text>}
				</TouchableOpacity>
			</View>
		</KeyboardAvoidingView>
	)
}

const createStyles = (darkMode: boolean) =>
	StyleSheet.create({
		container: {
			flex: 1,
			justifyContent: "center",
			paddingHorizontal: 24,
		},
		form: {
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
		button: {
			backgroundColor: "#000",
			paddingVertical: 14,
			borderRadius: 8,
			alignItems: "center",
			marginTop: 8,
		},
		buttonText: {
			color: "#fff",
			fontSize: 16,
			fontWeight: "600",
		},
		error: {
			color: "red",
			marginBottom: 8,
			textAlign: "center",
		},
	})
