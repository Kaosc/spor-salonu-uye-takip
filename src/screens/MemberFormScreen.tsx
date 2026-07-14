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
import { StackActions, useNavigation, useRoute } from "@react-navigation/native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { useSelector } from "react-redux"
import { useEffect, useState, useRef, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { nanoid } from "@reduxjs/toolkit"

import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker"
import BottomSheet from "@gorhom/bottom-sheet"

import ThemedText from "../components/ui/ThemedText"
import ThemedIcon from "../components/ui/ThemedIcon"
import CustomHeader from "../components/CustomHeader"
import ThemedActivityIndicator from "../components/ui/ThemedActivityIndicator"
import ThemedButton from "../components/ui/ThemedButton"
import ThemedBottomSheet from "../components/ui/ThemedBottomSheet"

import { addMember, getAllMembers, getMemberById, updateMember } from "../lib/firebase/firestore/member"
import { safeTimestampToDateString } from "../utils/date"
import { Theme } from "../utils/theme"

export default function MemberFormScreen() {
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const authEmail = useSelector((state: RootState) => state.auth.email)
	const newMemberUid = useSelector((state: RootState) => state.auth.uid)
	const navigation = useNavigation<any>()
	const { t } = useTranslation()

	const route = useRoute<any>()

	const styles = createStyles(darkMode)

	const [loading, setLoading] = useState(false)

	const isNewMember = route.params?.isNewMember || false
	const memberId = route.params?.memberId
	const isEditing = !!memberId

	const genderSheetRef = useRef<BottomSheet>(null)
	const bloodTypeSheetRef = useRef<BottomSheet>(null)
	const lockerSheetRef = useRef<BottomSheet>(null)

	const [showDatePicker, setShowDatePicker] = useState(false)
	const [members, setMembers] = useState<Member[]>([])

	useEffect(() => {
		getAllMembers()
			.then(setMembers)
			.catch((e) => console.error("[MemberFormScreen] fetch members:", e))
	}, [])

	useEffect(() => {
		const backAction = () => {
			goBackNoForce()
			return true
		}
		const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction)
		return () => backHandler.remove()
	}, [])

	const goBackNoForce = () => {
		if (route?.params?.prevScreen === "LockerScreen") {
			reset()
			navigation.dispatch(StackActions.replace("Tabs", { screen: "LockerScreen" }))
			return
		}

		navigation.goBack()
	}

	const { control, handleSubmit, reset, setValue, watch } = useForm<FormValues>(
		isNewMember
			? {
					defaultValues: {
						firstName: "",
						lastName: "",
						phoneNumber: "",
						email: authEmail,
						address: "",
						gender: "UNSPECIFIED",
						birthDate: "",
						bloodType: "",
						weight: 0,
						height: 0,
						emergencyName: "",
						emergencyPhone: "",
					},
				}
			: {
					defaultValues: {
						firstName: "",
						lastName: "",
						phoneNumber: "",
						email: "",
						address: "",
						lockerNumber: route.params?.prefilledLockerNumber || 0,
						gender: "UNSPECIFIED",
						birthDate: "",
						bloodType: "",
						weight: 0,
						height: 0,
						emergencyName: "",
						emergencyPhone: "",
					},
				},
	)

	const currentLockerNumber = watch("lockerNumber")

	const lockerSheetItems = useMemo(() => {
		const occupiedNumbers: number[] = []
		members.forEach((m) => {
			if (m.lockerNumber && m.lockerNumber !== currentLockerNumber) {
				const n = m.lockerNumber
				if (!isNaN(n)) occupiedNumbers.push(n)
			}
		})

		const items: { text: string; onPress: () => void }[] = [
			{
				text: t("cancel"),
				onPress: () => {
					setValue("lockerNumber", 0)
					lockerSheetRef.current?.close()
				},
			},
		]

		for (let i = 1; i <= 100; i++) {
			if (!occupiedNumbers.includes(i)) {
				const num = i
				items.push({
					text: `Locker ${num}`,
					onPress: () => {
						setValue("lockerNumber", num)
						lockerSheetRef.current?.close()
					},
				})
			}
		}
		return items
	}, [members, currentLockerNumber, t, setValue])

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
							address: member.address || "",
							lockerNumber: member.lockerNumber || 0,
							gender: member.gender || "UNSPECIFIED",
							birthDate: safeTimestampToDateString(member.birthDate),
							bloodType: member.bloodType || "",
							weight: member.weight || 0,
							height: member.height || 0,
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
			uid: memberId || newMemberUid || nanoid(),
			firstName: data.firstName,
			lastName: data.lastName,
			phoneNumber: data.phoneNumber,
			email: data.email,
			address: data.address || "",
			lockerNumber: data.lockerNumber || 0,
			gender: data.gender || ("UNSPECIFIED" as Gender),
			birthDate: data.birthDate ? new Date(data.birthDate) : new Date(),
			bloodType: data.bloodType || "",
			weight: data.weight ? data.weight : 0,
			height: data.height ? data.height : 0,
			emergencyContact: {
				name: data.emergencyName || "",
				phone: data.emergencyPhone || "",
			},
			role: "MEMBER",
			isActive: true,
			createdAt: new Date(),
			updatedAt: new Date(),
			createdBy: isNewMember ? t("userItSelf") : authEmail || "unknown",
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

			if (isNewMember) {
				navigation.dispatch(StackActions.popToTop())
				navigation.dispatch(StackActions.replace("MemberTabs", { screen: "MemberHomeScreen" }))
				return
			}

			navigation.dispatch(StackActions.popToTop())
			navigation.dispatch(
				StackActions.replace("Tabs", {
					screen: "MemberStack",
					params: { screen: "MemberListScreen", params: { refresh: true } },
				}),
			)
		}
	}

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<View style={styles.container}>
				<CustomHeader
					title={isEditing ? t("memberDetails") : t("newMember")}
					onBackPress={goBackNoForce}
				/>

				{loading ? (
					<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
						<ThemedActivityIndicator size={70} />
					</View>
				) : (
					<>
						<KeyboardAvoidingView
							style={styles.flex}
							behavior={"padding"}
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
													editable={!isNewMember}
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
										name="address"
										render={({ field: { onChange, value } }) => (
											<View style={styles.field}>
												<View style={styles.labelRow}>
													<ThemedText style={styles.label}>{t("address")}</ThemedText>
													<ThemedIcon
														name="home"
														size={18}
													/>
												</View>
												<TextInput
													style={[
														styles.input,
														{
															minHeight: 90,
															textAlignVertical: "top",
														},
													]}
													value={value}
													multiline
													numberOfLines={4}
													onChangeText={onChange}
													placeholder={t("address")}
													placeholderTextColor={darkMode ? "#666" : "#999"}
												/>
											</View>
										)}
									/>

									<Controller
										control={control}
										name="gender"
										render={({ field: { value } }) => {
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
										name="weight"
										render={({ field: { onChange, value } }) => (
											<View style={styles.field}>
												<View style={styles.labelRow}>
													<ThemedText style={styles.label}>{t("weight")}</ThemedText>
													<ThemedIcon
														name="scale-bathroom"
														size={18}
													/>
												</View>
												<TextInput
													style={styles.input}
													value={value.toString()}
													onChangeText={(text) => onChange(text.replace(/[^0-9.]/g, ""))}
													placeholder={t("weightPlaceholder")}
													keyboardType="decimal-pad"
													placeholderTextColor={darkMode ? "#666" : "#999"}
												/>
											</View>
										)}
									/>

									<Controller
										control={control}
										name="height"
										render={({ field: { onChange, value } }) => (
											<View style={styles.field}>
												<View style={styles.labelRow}>
													<ThemedText style={styles.label}>{t("height")}</ThemedText>
													<ThemedIcon
														name="human-male-height"
														size={18}
													/>
												</View>
												<TextInput
													style={styles.input}
													value={value.toString()}
													onChangeText={(text) => onChange(text.replace(/[^0-9.]/g, ""))}
													placeholder={t("heightPlaceholder")}
													keyboardType="decimal-pad"
													placeholderTextColor={darkMode ? "#666" : "#999"}
												/>
											</View>
										)}
									/>

									{!isNewMember && (
										<Controller
											control={control}
											name="lockerNumber"
											render={({ field: { value } }) => (
												<View style={styles.field}>
													<View style={styles.labelRow}>
														<ThemedText style={styles.label}>{t("lockerNumber")}</ThemedText>
														<ThemedIcon
															name="lock"
															size={18}
														/>
													</View>
													<TouchableOpacity
														style={[styles.selectButton, route.params?.prefilledLockerNumber && styles.inputDisabled]}
														onPress={() => lockerSheetRef.current?.snapToIndex(0)}
														activeOpacity={0.6}
													>
														<ThemedText style={[styles.selectButtonText, !value ? styles.placeholder : null]}>
															{value || t("selectLocker")}
														</ThemedText>
													</TouchableOpacity>
												</View>
											)}
										/>
									)}

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
										<ThemedText style={styles.buttonText}>
											{isEditing ? (isNewMember ? t("update") : t("updateMember")) : isNewMember ? t("save") : t("saveMember")}
										</ThemedText>
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
									icon: "gender-male",
									onPress: () => {
										setValue("gender", "MALE")
										genderSheetRef.current?.close()
									},
								},
								{
									text: t("female"),
									icon: "gender-female",
									onPress: () => {
										setValue("gender", "FEMALE")
										genderSheetRef.current?.close()
									},
								},
								{
									text: t("unspecified"),
									icon: "gender-male-female-variant",
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
							icon="water"
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

						<ThemedBottomSheet
							ref={lockerSheetRef}
							snapPoints={["50%"]}
							items={lockerSheetItems}
							icon="locker"
						/>
					</>
				)}
			</View>
		</GestureHandlerRootView>
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
		sectionTitle: {
			fontSize: 21,
			fontWeight: "bold",
			marginTop: 10,
			marginBottom: 12,
			paddingVertical: 5,
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
		inputDisabled: {
			backgroundColor: theme.green.background,
			color: theme.green.foreground,
			borderColor: theme.green.foreground,
		},
		selectButton: {
			borderWidth: 1,
			borderColor: theme.border,
			borderRadius: 8,
			paddingHorizontal: 12,
			paddingVertical: 10,
			backgroundColor: theme.cardBackground,
		},
		selectButtonText: {
			fontSize: 16,
		},
		placeholder: {
			opacity: 0.5,
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
