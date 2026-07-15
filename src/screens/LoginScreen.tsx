import { useEffect, useState } from "react"
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	ActivityIndicator,
	KeyboardAvoidingView,
	TouchableOpacity,
	ScrollView,
} from "react-native"
import { useDispatch, useSelector } from "react-redux"
import { useNavigation, NavigationProp, StackActions } from "@react-navigation/native"
import { useTranslation } from "react-i18next"
import { Image } from "expo-image"

import ThemedButton from "../components/ui/ThemedButton"
import ThemedText from "../components/ui/ThemedText"

import { resetPassword } from "../lib/firebase/auth"
import { staffLoginAction, memberLoginAction, toggleLoading } from "../store/features/authSlice"
import { moderateScale } from "../utils/responsive"
import { Theme } from "../utils/theme"

export default function LoginScreen() {
	const { darkMode } = useSelector((state: RootState) => state.settings)
	const { isLoading } = useSelector((state: RootState) => state.auth)
	const { t } = useTranslation()

	const dispatch = useDispatch<any>()
	const navigation = useNavigation() as NavigationProp<any>

	const styles = createStyles(darkMode)
	const [isStaffLogin, setIsStaffLogin] = useState(false)
	const [forgotPassword, setForgotPassword] = useState(false)

	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [error, setError] = useState("")

	useEffect(() => {
		if (__DEV__) {
			setTimeout(() => {
				if (isStaffLogin) {
					setEmail(process.env.EXPO_PUBLIC_ADMIN_EMAIL || "")
					setPassword(process.env.EXPO_PUBLIC_ADMIN_PASSWORD || "")
				} else {
					setEmail(process.env.EXPO_PUBLIC_MEMBER_EMAIL || "")
					setPassword(process.env.EXPO_PUBLIC_MEMBER_PASSWORD || "")
				}
			}, 100)
		}
	}, [isStaffLogin])

	const handleForgotPassword = async () => {
		if (!email.trim()) {
			setError(t("emailRequired"))
			return
		}

		dispatch(toggleLoading())
		const success = await resetPassword(email)

		if (success) {
			setForgotPassword(false)
		}

		dispatch(toggleLoading())
	}

	const handleLogin = async () => {
		if (forgotPassword) {
			handleForgotPassword()
			return
		}

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
			behavior={"padding"}
		>
			<ScrollView
				style={styles.form}
				contentContainerStyle={styles.contentContainer}
				showsVerticalScrollIndicator={false}
			>
				<Image
					source={darkMode ? require("../assets/logo-transparent-white.png") : require("../assets/logo-transparent-black.png")}
					style={styles.logo}
				/>

				<ThemedText style={styles.title}>
					{forgotPassword ? t("resetPasswordTitle") : isStaffLogin ? t("staffLogin") : t("memberLogin")}
				</ThemedText>

				{!forgotPassword && (
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
				)}
				<TextInput
					style={styles.input}
					placeholder={t("email")}
					placeholderTextColor="#888"
					value={email}
					onChangeText={setEmail}
					autoCapitalize="none"
					keyboardType="email-address"
				/>

				{!forgotPassword && (
					<TextInput
						style={styles.input}
						placeholder={t("password")}
						placeholderTextColor="#888"
						value={password}
						onChangeText={setPassword}
						secureTextEntry
					/>
				)}

				{error ? <Text style={styles.error}>{error}</Text> : null}

				<ThemedButton
					onPress={handleLogin}
					disabled={isLoading}
				>
					{isLoading ? (
						<ActivityIndicator color={darkMode ? "#000" : "#fff"} />
					) : (
						<ThemedText style={styles.buttonText}>{forgotPassword ? t("sendResetEmail") : t("login")}</ThemedText>
					)}
				</ThemedButton>

				<TouchableOpacity
					style={styles.registerLink}
					activeOpacity={0.7}
					onPress={() => setForgotPassword(!forgotPassword)}
				>
					<ThemedText style={styles.registerLinkText}>{forgotPassword ? t("backToLogin") : t("resetPassword")}</ThemedText>
				</TouchableOpacity>

				{!isStaffLogin && !forgotPassword && (
					<TouchableOpacity
						style={styles.registerLink}
						activeOpacity={0.7}
						onPress={() => navigation.navigate("RegisterScreen")}
					>
						<ThemedText style={styles.registerLinkText}>{t("register")}</ThemedText>
					</TouchableOpacity>
				)}
			</ScrollView>
		</KeyboardAvoidingView>
	)
}

const createStyles = (darkMode: boolean) => {
	const theme = Theme[darkMode ? "dark" : "light"]

	return StyleSheet.create({
		container: {
			flex: 1,
			justifyContent: "flex-start",
		},
		form: {
			flex: 1,
			gap: 3,
			paddingHorizontal: 40,
		},
		contentContainer: {
			flexGrow: 1,
			marginTop: 70,
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
			borderColor: theme.border,
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
			borderColor: theme.border,
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
			width: moderateScale(120),
			height: moderateScale(120),
			borderRadius: 20,
			marginBottom: 50,
			alignSelf: "center",
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
}
