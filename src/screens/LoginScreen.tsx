import { useMemo, useState } from "react"
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	TouchableOpacity,
} from "react-native"
import { useDispatch, useSelector } from "react-redux"
import { useNavigation, NavigationProp, StackActions } from "@react-navigation/native"
import { useTranslation } from "react-i18next"
import { Image } from "expo-image"

import ThemedButton from "../components/ui/ThemedButton"
import ThemedText from "../components/ui/ThemedText"

import { staffLoginAction, memberLoginAction } from "../store/features/authSlice"
export default function LoginScreen() {
	const { darkMode } = useSelector((state: RootState) => state.settings)
	const { isLoading } = useSelector((state: RootState) => state.auth)
	const { t } = useTranslation()

	const dispatch = useDispatch<any>()
	const navigation = useNavigation() as NavigationProp<any>

	const styles = createStyles(darkMode)
	const [isStaffLogin, setIsStaffLogin] = useState(false)

	const EMAIL = useMemo(() => {
		return __DEV__ ? (isStaffLogin ? process.env.EXPO_PUBLIC_ADMIN_EMAIL || "" : process.env.EXPO_PUBLIC_MEMBER_EMAIL || "") : ""
	}, [isStaffLogin])

	const PASSWORD = useMemo(() => {
		return __DEV__
			? isStaffLogin
				? process.env.EXPO_PUBLIC_ADMIN_PASSWORD || ""
				: process.env.EXPO_PUBLIC_MEMBER_PASSWORD || ""
			: ""
	}, [isStaffLogin])

	const [email, setEmail] = useState(EMAIL)
	const [password, setPassword] = useState(PASSWORD)
	const [error, setError] = useState("")

	const handleLogin = async () => {
		if (!email.trim() || !password.trim()) {
			setError(t("emailAndPasswordRequired"))
			return
		}

		setError("")

		const action = isStaffLogin ? staffLoginAction : memberLoginAction
		const result = await dispatch(action({ email, password }))

		if (action.fulfilled.match(result)) {
			const role = result.payload?.role
			const isNewMember = "isNewMember" in result.payload ? result.payload.isNewMember : false

			if (isNewMember && role === "MEMBER") {
				navigation.navigate("MemberFormScreen", { isNewMember: true })
			} else {
				navigation.dispatch(StackActions.replace(role === "MEMBER" ? "MemberTabs" : "Tabs"))
			}
		} else {
			// Catch redux state error here
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

				<ThemedText style={styles.title}>{isStaffLogin ? t("staffLogin") : t("memberLogin")}</ThemedText>

				<View style={styles.segmentedControl}>
					<TouchableOpacity
						style={[styles.segment, isStaffLogin && styles.segmentActive]}
						activeOpacity={0.7}
						onPress={() => setIsStaffLogin(true)}
					>
						<Text style={[styles.segmentText, isStaffLogin && styles.segmentTextActive]}>{t("staffLogin")}</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.segment, !isStaffLogin && styles.segmentActive]}
						activeOpacity={0.7}
						onPress={() => setIsStaffLogin(false)}
					>
						<Text style={[styles.segmentText, !isStaffLogin && styles.segmentTextActive]}>{t("memberLogin")}</Text>
					</TouchableOpacity>
				</View>

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

				{!isStaffLogin && (
					<TouchableOpacity
						style={styles.registerLink}
						activeOpacity={0.7}
						onPress={() => navigation.navigate("RegisterScreen")}
					>
						<ThemedText style={styles.registerLinkText}>{t("register")}</ThemedText>
					</TouchableOpacity>
				)}
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
			marginBottom: 16,
			textAlign: "center",
		},
		segmentedControl: {
			flexDirection: "row",
			borderWidth: 1,
			borderColor: "#ccc",
			borderRadius: 8,
			overflow: "hidden",
			marginBottom: 24,
		},
		segment: {
			flex: 1,
			paddingVertical: 12,
			alignItems: "center",
			backgroundColor: "transparent",
		},
		segmentActive: {
			backgroundColor: darkMode ? "#fff" : "#000",
		},
		segmentText: {
			fontSize: 15,
			fontWeight: "600",
			color: darkMode ? "#fff" : "#000",
		},
		segmentTextActive: {
			color: darkMode ? "#000" : "#fff",
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
			marginBottom: 60,
			borderWidth: darkMode ? 0 : 1,
			alignSelf: "center",
			borderColor: "#ccc",
			borderBottomWidth: darkMode ? 0 : 2,
		},
		registerLink: {
			marginTop: 16,
			alignItems: "center",
		},
		registerLinkText: {
			fontSize: 14,
			textDecorationLine: "underline",
		},
	})
