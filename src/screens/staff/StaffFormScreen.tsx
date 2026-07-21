import { useForm, Controller } from "react-hook-form"
import {
	View,
	TextInput,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	TouchableOpacity,
	BackHandler,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { useSelector, useDispatch } from "react-redux"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import ThemedText from "../../components/ui/ThemedText"
import ThemedIcon from "../../components/ui/ThemedIcon"
import CustomHeader from "../../components/CustomHeader"
import ThemedActivityIndicator from "../../components/ui/ThemedActivityIndicator"
import ThemedButton from "../../components/ui/ThemedButton"

import { createStaffUser } from "../../lib/firebase/auth"
import { addStaff } from "../../lib/firebase/firestore/staff"
import { reAuthStaffAction } from "../../store/features/authSlice"
import { getStaffCredentials } from "../../utils/storage"
import { Theme } from "../../utils/theme"

type StaffFormValues = {
	email: string
	password: string
	firstName: string
	lastName: string
}

export default function StaffFormScreen() {
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const { isLoading } = useSelector((state: RootState) => state.auth)
	const dispatch = useDispatch<any>()
	const navigation = useNavigation<any>()
	const { t } = useTranslation()

	const styles = createStyles(darkMode)

	const [loading, setLoading] = useState(false)
	const [role, setRole] = useState<"ADMIN" | "STAFF">("STAFF")

	useEffect(() => {
		const backAction = () => {
			navigation.goBack()
			return true
		}
		const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction)
		return () => backHandler.remove()
	}, [])

	const generatePassword = () => {
		const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
		let password = ""
		for (let i = 0; i < 8; i++) {
			password += chars.charAt(Math.floor(Math.random() * chars.length))
		}
		setValue("password", password)
	}

	const { control, handleSubmit, reset, setValue } = useForm<StaffFormValues>({
		defaultValues: {
			email: "",
			password: "",
			firstName: "",
			lastName: "",
		},
	})

	const onSubmit = async (data: StaffFormValues) => {
		setLoading(true)

		try {
			// Create Firebase Auth user
			const uid = await createStaffUser(data.email, data.password)
			if (!uid) {
				toast.show(t("staffCreateError"), { duration: 6000, type: "danger" })
				setLoading(false)
				return
			}

			// Add staff document to Firestore
			const staffData: StaffUser = {
				uid,
				email: data.email,
				firstName: data.firstName,
				lastName: data.lastName,
				role: role,
				isActive: true,
				createdAt: new Date(),
			}

			const success = await addStaff(staffData)
			if (!success) {
				toast.show(t("staffCreateError"), { duration: 6000, type: "danger" })
				setLoading(false)
				return
			}

			toast.show(t("staffCreateSuccess"), { duration: 4000, type: "success" })

			// Sign out and re-auth with current staff user credentials
			const credentials = getStaffCredentials()
			if (credentials) {
				await dispatch(reAuthStaffAction({ email: credentials.email, password: credentials.password }))
			}

			// Reset form and navigate back
			reset()
			setRole("STAFF")
			navigation.goBack()
		} catch (error: any) {
			console.error("[StaffFormScreen] Error creating staff:", error?.message || error)
			toast.show(t("staffCreateError"), { duration: 6000, type: "danger" })
		}

		setLoading(false)
	}

	const toggleRole = () => {
		setRole((prev) => (prev === "ADMIN" ? "STAFF" : "ADMIN"))
	}

	return (
		<KeyboardAvoidingView
			style={styles.flex}
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<View style={styles.container}>
					<CustomHeader
						title={t("newStaff")}
						onBackPress={() => navigation.goBack()}
					/>

					{loading ? (
						<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
							<ThemedActivityIndicator size={70} />
						</View>
					) : (
						<ScrollView contentContainerStyle={styles.scrollContent}>
							<View style={styles.form}>
								<Controller
									control={control}
									name="firstName"
									rules={{ required: true }}
									render={({ field: { onChange, value } }) => (
										<View style={styles.field}>
											<View style={styles.labelRow}>
												<ThemedText style={styles.label}>{t("firstName")}</ThemedText>
												<ThemedIcon
													name="account-outline"
													size={18}
												/>
											</View>
											<TextInput
												style={styles.input}
												value={value}
												onChangeText={onChange}
												placeholder={t("firstName")}
												placeholderTextColor={darkMode ? "#666" : "#999"}
											/>
										</View>
									)}
								/>

								<Controller
									control={control}
									name="lastName"
									rules={{ required: true }}
									render={({ field: { onChange, value } }) => (
										<View style={styles.field}>
											<View style={styles.labelRow}>
												<ThemedText style={styles.label}>{t("lastName")}</ThemedText>
												<ThemedIcon
													name="account-outline"
													size={18}
												/>
											</View>
											<TextInput
												style={styles.input}
												value={value}
												onChangeText={onChange}
												placeholder={t("lastName")}
												placeholderTextColor={darkMode ? "#666" : "#999"}
											/>
										</View>
									)}
								/>

								<Controller
									control={control}
									name="email"
									rules={{ required: true }}
									render={({ field: { onChange, value } }) => (
										<View style={styles.field}>
											<View style={styles.labelRow}>
												<ThemedText style={styles.label}>{t("email")}</ThemedText>
												<ThemedIcon
													name="mail"
													size={18}
												/>
											</View>
											<TextInput
												style={styles.input}
												value={value}
												onChangeText={onChange}
												placeholder={t("email")}
												keyboardType="email-address"
												autoCapitalize="none"
												placeholderTextColor={darkMode ? "#666" : "#999"}
											/>
										</View>
									)}
								/>

								<Controller
									control={control}
									name="password"
									rules={{ required: true }}
									render={({ field: { onChange, value } }) => (
										<View style={styles.field}>
											<View style={styles.labelRow}>
												<ThemedText style={styles.label}>{t("password")}</ThemedText>
												<ThemedIcon
													name="lock"
													size={18}
												/>
											</View>
											<View style={styles.passwordRow}>
												<TextInput
													style={[styles.input, styles.passwordInput]}
													value={value}
													onChangeText={onChange}
													placeholder={t("password")}
													autoCapitalize="none"
													placeholderTextColor={darkMode ? "#666" : "#999"}
												/>
												<TouchableOpacity
													style={styles.passwordButton}
													onPress={generatePassword}
													activeOpacity={0.6}
												>
													<ThemedIcon
														name="auto-fix"
														size={20}
													/>
												</TouchableOpacity>
											</View>
										</View>
									)}
								/>

								<View style={styles.field}>
									<View style={styles.labelRow}>
										<ThemedText style={styles.label}>{t("role")}</ThemedText>
										<ThemedIcon
											name="shield-account"
											size={18}
										/>
									</View>
									<TouchableOpacity
										style={styles.roleToggle}
										onPress={toggleRole}
										activeOpacity={0.7}
									>
										<ThemedText style={[styles.roleOption, role === "ADMIN" && styles.roleActive]}>{t("admin")}</ThemedText>
										<ThemedText style={[styles.roleOption, role === "STAFF" && styles.roleActive]}>{t("staff")}</ThemedText>
									</TouchableOpacity>
								</View>

								<ThemedButton
									style={styles.button}
									onPress={handleSubmit(onSubmit)}
									disabled={isLoading}
								>
									<ThemedText style={styles.buttonText}>{t("saveStaff")}</ThemedText>
								</ThemedButton>
							</View>
						</ScrollView>
					)}
				</View>
			</GestureHandlerRootView>
		</KeyboardAvoidingView>
	)
}

const createStyles = (darkMode: boolean) => {
	const theme = Theme[darkMode ? "dark" : "light"]

	return StyleSheet.create({
		container: {
			flex: 1,
		},
		flex: {
			flex: 1,
		},
		scrollContent: {
			flexGrow: 1,
			padding: 20,
		},
		form: {
			flex: 1,
		},
		field: {
			marginBottom: 16,
		},
		labelRow: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			marginBottom: 6,
			paddingHorizontal: 5,
		},
		label: {
			fontSize: 14,
			fontWeight: "600",
		},
		input: {
			borderWidth: 1,
			borderColor: theme.border,
			borderRadius: 8,
			paddingHorizontal: 12,
			paddingVertical: 10,
			fontSize: 16,
			color: darkMode ? "#fff" : "#000",
			backgroundColor: theme.cardBackground,
		},
		passwordRow: {
			flexDirection: "row",
			alignItems: "center",
			gap: 8,
		},
		passwordInput: {
			flex: 1,
		},
		passwordButton: {
			borderWidth: 1,
			borderColor: theme.border,
			borderRadius: 8,
			paddingHorizontal: 12,
			paddingVertical: 10,
			backgroundColor: theme.cardBackground,
		},
		roleToggle: {
			flexDirection: "row",
			borderWidth: 1,
			borderColor: theme.border,
			borderRadius: 8,
			overflow: "hidden",
		},
		roleOption: {
			flex: 1,
			textAlign: "center",
			paddingVertical: 12,
			fontSize: 15,
			fontWeight: "600",
			color: darkMode ? "#fff" : "#000",
		},
		roleActive: {
			backgroundColor: darkMode ? "#fff" : "#000",
			color: darkMode ? "#000" : "#fff",
		},
		button: {
			borderRadius: 8,
			paddingVertical: 14,
			alignItems: "center",
			marginTop: 12,
		},
		buttonText: {
			color: darkMode ? "#000" : "#fff",
			fontSize: 16,
			fontWeight: "bold",
		},
	})
}
