import { useForm, Controller } from "react-hook-form"
import { View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useSelector } from "react-redux"
import { useMMKVObject } from "react-native-mmkv"
import { nanoid } from "@reduxjs/toolkit"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"

import ThemedText from "../components/ui/ThemedText"
import CustomHeader from "../components/CustomHeader"
import { addMember } from "../lib/firebase/firestore/member"

export default function MemberFormScreen() {
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const staffID = useSelector((state: RootState) => state.auth.uid)
	const navigation = useNavigation<any>()
	const { t } = useTranslation()
	const route = useRoute<any>()

	const styles = createStyles(darkMode)

	const [members, setMembers] = useMMKVObject<Member[]>("members")

	const memberId = route.params?.memberId
	const isEditing = !!memberId

	const { control, handleSubmit, reset } = useForm<FormValues>({
		defaultValues: {
			firstName: "",
			lastName: "",
			phoneNumber: "",
			email: "",
			lockerNumber: "",
			gender: "UNSPECIFIED",
			birthDate: "",
			bloodType: "",
			emergencyName: "",
			emergencyPhone: "",
		},
	})

	useEffect(() => {
		if (memberId && members) {
			const member = members.find((m: any) => m.uid === memberId)
			if (member) {
				reset({
					firstName: member.firstName || "",
					lastName: member.lastName || "",
					phoneNumber: member.phoneNumber || "",
					email: member.email || "",
					lockerNumber: member.lockerNumber || "",
					gender: member.gender || "UNSPECIFIED",
					birthDate: member.birthDate ? new Date(member.birthDate).toISOString().split("T")[0] : "",
					bloodType: member.bloodType || "",
					emergencyName: member.emergencyContact?.name || "",
					emergencyPhone: member.emergencyContact?.phone || "",
				})
			}
		}
	}, [memberId, members, reset])

	const onSubmit = async (data: FormValues) => {
		let success = false

		// Update existing member
		if (isEditing && memberId) {
			const updatedMembers = members?.map((m: any) => {
				if (m.uid === memberId) {
					return {
						...m,
						firstName: data.firstName,
						lastName: data.lastName,
						phoneNumber: data.phoneNumber,
						email: data.email,
						lockerNumber: data.lockerNumber || "",
						gender: data.gender || "UNSPECIFIED",
						birthDate: data.birthDate ? new Date(data.birthDate) : m.birthDate,
						bloodType: data.bloodType || m.bloodType,
						emergencyContact: {
							name: data.emergencyName || "",
							phone: data.emergencyPhone || "",
						},
						updatedAt: new Date(),
					}
				}
				return m
			})
			setMembers(updatedMembers)
		} else {
			// Create a new member
			const newMember: Member = {
				uid: nanoid(),
				firstName: data.firstName,
				lastName: data.lastName,
				phoneNumber: data.phoneNumber,
				email: data.email,
				lockerNumber: data.lockerNumber || "",
				gender: data.gender || ("UNSPECIFIED" as Gender),
				birthDate: data.birthDate ? new Date(data.birthDate) : new Date(),
				bloodType: data.bloodType || "",
				emergencyContact: {
					name: data.emergencyName || "",
					phone: data.emergencyPhone || "",
				},
				role: "MEMBER",
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
				createdBy: staffID,
			}

			success = await addMember(newMember)
			// setMembers(updatedMembers)
		}

		if (success) navigation.goBack()
	}

	return (
		<View style={styles.container}>
			<CustomHeader title={isEditing ? t("memberDetails") : t("newMember")} />
			<KeyboardAvoidingView
				style={styles.flex}
				behavior={Platform.OS === "ios" ? "padding" : undefined}
			>
				<ScrollView
					contentContainerStyle={styles.scrollContent}
					keyboardShouldPersistTaps="handled"
				>
					<View style={styles.form}>
						<Controller
							control={control}
							name="firstName"
							rules={{ required: true }}
							render={({ field: { onChange, value } }) => (
								<View style={styles.field}>
									<ThemedText style={styles.label}>{t("firstName")}</ThemedText>
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
									<ThemedText style={styles.label}>{t("lastName")}</ThemedText>
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
							name="phoneNumber"
							rules={{ required: true }}
							render={({ field: { onChange, value } }) => (
								<View style={styles.field}>
									<ThemedText style={styles.label}>{t("phone")}</ThemedText>
									<TextInput
										style={styles.input}
										value={value}
										onChangeText={onChange}
										placeholder={t("phone")}
										keyboardType="phone-pad"
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
									<ThemedText style={styles.label}>{t("email")}</ThemedText>
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
							name="gender"
							render={({ field: { onChange, value } }) => (
								<View style={styles.field}>
									<ThemedText style={styles.label}>{t("gender")}</ThemedText>
									<TextInput
										style={styles.input}
										value={value}
										onChangeText={onChange}
										placeholder={t("genderPlaceholder")}
										placeholderTextColor={darkMode ? "#666" : "#999"}
										autoCapitalize="characters"
									/>
								</View>
							)}
						/>

						<Controller
							control={control}
							name="birthDate"
							render={({ field: { onChange, value } }) => (
								<View style={styles.field}>
									<ThemedText style={styles.label}>{t("birthDate")}</ThemedText>
									<TextInput
										style={styles.input}
										value={value}
										onChangeText={onChange}
										placeholder={t("datePlaceholder")}
										placeholderTextColor={darkMode ? "#666" : "#999"}
									/>
								</View>
							)}
						/>

						<Controller
							control={control}
							name="bloodType"
							render={({ field: { onChange, value } }) => (
								<View style={styles.field}>
									<ThemedText style={styles.label}>{t("bloodType")}</ThemedText>
									<TextInput
										style={styles.input}
										value={value}
										onChangeText={onChange}
										placeholder={t("bloodTypePlaceholder")}
										placeholderTextColor={darkMode ? "#666" : "#999"}
										autoCapitalize="characters"
									/>
								</View>
							)}
						/>

						<Controller
							control={control}
							name="lockerNumber"
							render={({ field: { onChange, value } }) => (
								<View style={styles.field}>
									<ThemedText style={styles.label}>{t("lockerNumber")}</ThemedText>
									<TextInput
										style={styles.input}
										value={value}
										onChangeText={onChange}
										placeholder={t("lockerNumberPlaceholder")}
										placeholderTextColor={darkMode ? "#666" : "#999"}
									/>
								</View>
							)}
						/>

						<ThemedText style={styles.sectionTitle}>{t("emergencyContact")}</ThemedText>

						<Controller
							control={control}
							name="emergencyName"
							render={({ field: { onChange, value } }) => (
								<View style={styles.field}>
									<ThemedText style={styles.label}>{t("emergencyName")}</ThemedText>
									<TextInput
										style={styles.input}
										value={value}
										onChangeText={onChange}
										placeholder={t("emergencyNamePlaceholder")}
										placeholderTextColor={darkMode ? "#666" : "#999"}
									/>
								</View>
							)}
						/>

						<Controller
							control={control}
							name="emergencyPhone"
							render={({ field: { onChange, value } }) => (
								<View style={styles.field}>
									<ThemedText style={styles.label}>{t("emergencyPhone")}</ThemedText>
									<TextInput
										style={styles.input}
										value={value}
										onChangeText={onChange}
										placeholder={t("emergencyPhonePlaceholder")}
										keyboardType="phone-pad"
										placeholderTextColor={darkMode ? "#666" : "#999"}
									/>
								</View>
							)}
						/>

						<TouchableOpacity
							style={styles.button}
							onPress={handleSubmit(onSubmit)}
						>
							<ThemedText style={styles.buttonText}>{isEditing ? t("updateMember") : t("saveMember")}</ThemedText>
						</TouchableOpacity>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</View>
	)
}

const createStyles = (darkMode: boolean) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: darkMode ? "#000" : "#fff",
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
		sectionTitle: {
			fontSize: 16,
			fontWeight: "700",
			marginTop: 8,
			marginBottom: 12,
		},
		field: {
			marginBottom: 16,
		},
		label: {
			fontSize: 14,
			fontWeight: "600",
			marginBottom: 6,
		},
		input: {
			borderWidth: 1,
			borderColor: darkMode ? "#333" : "#ccc",
			borderRadius: 8,
			paddingHorizontal: 12,
			paddingVertical: 10,
			fontSize: 16,
			color: darkMode ? "#e9e9e9" : "#000",
			backgroundColor: darkMode ? "#1a1a1a" : "#fff",
		},
		button: {
			backgroundColor: "#007AFF",
			borderRadius: 8,
			paddingVertical: 14,
			alignItems: "center",
			marginTop: 12,
		},
		buttonText: {
			color: "#fff",
			fontSize: 16,
			fontWeight: "600",
		},
	})
