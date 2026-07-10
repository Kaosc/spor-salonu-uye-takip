import { useForm, Controller } from "react-hook-form"
import { View, TextInput, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity } from "react-native"
import { StackActions, useNavigation, useRoute } from "@react-navigation/native"
import { useSelector } from "react-redux"
import { useEffect, useState, useRef } from "react"
import { useTranslation } from "react-i18next"

import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker"
import BottomSheet from "@gorhom/bottom-sheet"

import ThemedText from "../components/ui/ThemedText"
import ThemedIcon from "../components/ui/ThemedIcon"
import CustomHeader from "../components/CustomHeader"
import ThemedActivityIndicator from "../components/ui/ThemedActivityIndicator"
import ThemedButton from "../components/ui/ThemedButton"
import ThemedBottomSheet from "../components/ui/ThemedBottomSheet"

import { addMember, getMemberById, updateMember } from "../lib/firebase/firestore/member"
import { safeTimestampToDateString } from "../utils/date"
import { GestureHandlerRootView } from "react-native-gesture-handler"

export default function MemberFormScreen() {
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const staffID = useSelector((state: RootState) => state.auth.email)
	const navigation = useNavigation<any>()
	const { t } = useTranslation()

	const route = useRoute<any>()

	const styles = createStyles(darkMode)

	const [loading, setLoading] = useState(false)

	const memberId = route.params?.memberId
	const isEditing = !!memberId

	const genderSheetRef = useRef<BottomSheet>(null)
	const bloodTypeSheetRef = useRef<BottomSheet>(null)

	const [showDatePicker, setShowDatePicker] = useState(false)

	const { control, handleSubmit, reset, setValue } = useForm<FormValues>({
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

	// If there is a memberId, set loading state to true and fetch the member
	useEffect(() => {
		if (memberId) {
			setLoading(true)

			getMemberById(memberId)
				.then((member) => {
					if (member) {
						reset({
							firstName: member.firstName || "",
							lastName: member.lastName || "",
							phoneNumber: member.phoneNumber || "",
							email: member.email || "",
							lockerNumber: member.lockerNumber || "",
							gender: member.gender || "UNSPECIFIED",
							birthDate: safeTimestampToDateString(member.birthDate),
							bloodType: member.bloodType || "",
							emergencyName: member.emergencyContact?.name || "",
							emergencyPhone: member.emergencyContact?.phone || "",
						})
					}
				})
				.catch((e) => {
					console.error("[MemberFormScreen] Error fetching member:", e)
					toast.show(t("memberFetchError"), { duration: 6000, type: "danger" })
				})
				.finally(() => {
					setLoading(false)
				})
		}
	}, [memberId])

	const onSubmit = async (data: FormValues) => {
		setLoading(true)
		let success = false

		const memberData: Member = {
			uid: memberId || "",
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
			createdBy: staffID?.split("@")[0] || "unknown",
		}

		if (isEditing && memberId) {
			// Update existing member
			success = await updateMember(memberData)
			if (success) {
				toast.show(t("memberUpdateSuccess"), { duration: 4000, type: "success" })
			}
		} else {
			// Add new member
			success = await addMember(memberData)
			if (success) {
				toast.show(t("memberAddSuccess"), { duration: 4000, type: "success" })
			}
		}

		setLoading(false)
		if (success) {
			//reset state
			reset()
			navigation.dispatch(StackActions.popToTop())
			navigation.dispatch(StackActions.replace("MemberListScreen", { refresh: true }))
		}
	}

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<View style={styles.container}>
				<CustomHeader title={isEditing ? t("memberDetails") : t("newMember")} />

				{loading ? (
					<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
						<ThemedActivityIndicator size={70} />
					</View>
				) : (
					<>
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
										name="phoneNumber"
										rules={{ required: true }}
										render={({ field: { onChange, value } }) => (
											<View style={styles.field}>
												<View style={styles.labelRow}>
													<ThemedText style={styles.label}>{t("phone")}</ThemedText>
													<ThemedIcon
														name="phone"
														size={18}
													/>
												</View>
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
										name="gender"
										render={({ field: { onChange, value } }) => {
											const genderLabels: Record<string, string> = {
												MALE: t("male"),
												FEMALE: t("female"),
												UNSPECIFIED: t("unspecified"),
											}
											return (
												<View style={styles.field}>
													<View style={styles.labelRow}>
														<ThemedText style={styles.label}>{t("gender")}</ThemedText>
														<ThemedIcon
															name="gender-male-female"
															size={18}
														/>
													</View>
													<TouchableOpacity
														style={styles.selectButton}
														onPress={() => genderSheetRef.current?.snapToIndex(0)}
														activeOpacity={0.6}
													>
														<ThemedText
															style={[styles.selectButtonText, !value || value === "UNSPECIFIED" ? styles.placeholder : null]}
														>
															{genderLabels[value] || t("genderPlaceholder")}
														</ThemedText>
													</TouchableOpacity>
												</View>
											)
										}}
									/>

									<Controller
										control={control}
										name="birthDate"
										render={({ field: { onChange, value } }) => {
											const formattedDate = value ? new Date(value).toLocaleDateString() : t("datePlaceholder")

											return (
												<View style={styles.field}>
													<View style={styles.labelRow}>
														<ThemedText style={styles.label}>{t("birthDate")}</ThemedText>
														<ThemedIcon
															name="calendar"
															size={18}
														/>
													</View>
													<TouchableOpacity
														style={styles.selectButton}
														onPress={() => setShowDatePicker(true)}
														activeOpacity={0.6}
													>
														<ThemedText style={[styles.selectButtonText, !value ? styles.placeholder : null]}>
															{formattedDate}
														</ThemedText>
													</TouchableOpacity>
													{showDatePicker && (
														<DateTimePicker
															value={value ? new Date(value) : new Date()}
															mode="date"
															display="default"
															maximumDate={new Date()}
															onChange={(_event: DateTimePickerEvent, selectedDate?: Date) => {
																setShowDatePicker(Platform.OS === "ios")
																if (selectedDate) {
																	onChange(selectedDate.toISOString().split("T")[0])
																}
															}}
														/>
													)}
												</View>
											)
										}}
									/>

									<Controller
										control={control}
										name="bloodType"
										render={({ field: { onChange, value } }) => (
											<View style={styles.field}>
												<View style={styles.labelRow}>
													<ThemedText style={styles.label}>{t("bloodType")}</ThemedText>
													<ThemedIcon
														name="water"
														size={18}
													/>
												</View>
												<TouchableOpacity
													style={styles.selectButton}
													onPress={() => bloodTypeSheetRef.current?.snapToIndex(0)}
													activeOpacity={0.6}
												>
													<ThemedText style={[styles.selectButtonText, !value ? styles.placeholder : null]}>
														{value || t("bloodTypePlaceholder")}
													</ThemedText>
												</TouchableOpacity>
											</View>
										)}
									/>

									<Controller
										control={control}
										name="lockerNumber"
										render={({ field: { onChange, value } }) => (
											<View style={styles.field}>
												<View style={styles.labelRow}>
													<ThemedText style={styles.label}>{t("lockerNumber")}</ThemedText>
													<ThemedIcon
														name="lock"
														size={18}
													/>
												</View>
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
												<View style={styles.labelRow}>
													<ThemedText style={styles.label}>{t("emergencyName")}</ThemedText>
													<ThemedIcon
														name="account-star-outline"
														size={18}
													/>
												</View>
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
												<View style={styles.labelRow}>
													<ThemedText style={styles.label}>{t("emergencyPhone")}</ThemedText>
													<ThemedIcon
														name="phone-forward"
														size={18}
													/>
												</View>
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

									<ThemedButton
										style={styles.button}
										onPress={handleSubmit(onSubmit)}
									>
										<ThemedText style={styles.buttonText}>{isEditing ? t("updateMember") : t("saveMember")}</ThemedText>
									</ThemedButton>
								</View>
							</ScrollView>
						</KeyboardAvoidingView>

						<ThemedBottomSheet
							ref={genderSheetRef}
							snapPoints={["30%"]}
							items={[
								{
									text: t("male"),
									onPress: () => {
										setValue("gender", "MALE")
										genderSheetRef.current?.close()
									},
								},
								{
									text: t("female"),
									onPress: () => {
										setValue("gender", "FEMALE")
										genderSheetRef.current?.close()
									},
								},
								{
									text: t("unspecified"),
									onPress: () => {
										setValue("gender", "UNSPECIFIED")
										genderSheetRef.current?.close()
									},
								},
							]}
						/>

						<ThemedBottomSheet
							ref={bloodTypeSheetRef}
							snapPoints={["40%"]}
							items={[
								{
									text: "A Rh+",
									onPress: () => {
										setValue("bloodType", "A Rh+")
										bloodTypeSheetRef.current?.close()
									},
								},
								{
									text: "A Rh-",
									onPress: () => {
										setValue("bloodType", "A Rh-")
										bloodTypeSheetRef.current?.close()
									},
								},
								{
									text: "B Rh+",
									onPress: () => {
										setValue("bloodType", "B Rh+")
										bloodTypeSheetRef.current?.close()
									},
								},
								{
									text: "B Rh-",
									onPress: () => {
										setValue("bloodType", "B Rh-")
										bloodTypeSheetRef.current?.close()
									},
								},
								{
									text: "AB Rh+",
									onPress: () => {
										setValue("bloodType", "AB Rh+")
										bloodTypeSheetRef.current?.close()
									},
								},
								{
									text: "AB Rh-",
									onPress: () => {
										setValue("bloodType", "AB Rh-")
										bloodTypeSheetRef.current?.close()
									},
								},
								{
									text: "0 Rh+",
									onPress: () => {
										setValue("bloodType", "0 Rh+")
										bloodTypeSheetRef.current?.close()
									},
								},
								{
									text: "0 Rh-",
									onPress: () => {
										setValue("bloodType", "0 Rh-")
										bloodTypeSheetRef.current?.close()
									},
								},
							]}
						/>
					</>
				)}
			</View>
		</GestureHandlerRootView>
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
			borderColor: darkMode ? "#333" : "#ccc",
			borderRadius: 8,
			paddingHorizontal: 12,
			paddingVertical: 10,
			fontSize: 16,
			color: darkMode ? "#e9e9e9" : "#000",
			backgroundColor: darkMode ? "#1a1a1a" : "#fff",
		},
		selectButton: {
			borderWidth: 1,
			borderColor: darkMode ? "#333" : "#ccc",
			borderRadius: 8,
			paddingHorizontal: 12,
			paddingVertical: 10,
			backgroundColor: darkMode ? "#1a1a1a" : "#fff",
		},
		selectButtonText: {
			fontSize: 16,
			color: darkMode ? "#e9e9e9" : "#000",
		},
		placeholder: {
			color: darkMode ? "#666" : "#999",
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
