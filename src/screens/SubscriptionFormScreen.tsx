import { useEffect, useState } from "react"
import { View, TextInput, TouchableOpacity, StyleSheet, Platform, BackHandler, ScrollView } from "react-native"
import { StackActions, useNavigation, useRoute } from "@react-navigation/native"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker"
import { serverTimestamp, Timestamp } from "@react-native-firebase/firestore"

import ThemedText from "../components/ui/ThemedText"
import CustomHeader from "../components/CustomHeader"
import ThemedIcon from "../components/ui/ThemedIcon"
import ThemedButton from "../components/ui/ThemedButton"

import { addSubscription, cancelSubscription } from "../lib/firebase/firestore/subscriptions"
import { Theme } from "../utils/theme"

const PACKAGE_TYPES: PackageType[] = ["MONTHLY", "QUARTERLY", "YEARLY"]
const PAYMENT_METHODS: PaymentMethod[] = ["CASH", "CREDIT_CARD", "TRANSFER"]

export default function SubscriptionFormScreen() {
	const navigation = useNavigation<any>()
	const route = useRoute<any>()
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const staff = useSelector((state: RootState) => state.auth)
	const { t } = useTranslation()

	const styles = createStyles(darkMode)

	const member: Member = route.params?.member
	const activeSubscriptionId = route.params?.activeSubscriptionId || false

	const [packageType, setPackageType] = useState<PackageType>("MONTHLY")
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH")
	const [startDate, setStartDate] = useState(new Date())
	const [price, setPrice] = useState("")
	const [notes, setNotes] = useState("")

	const [showDatePicker, setShowDatePicker] = useState(false)
	const [submitting, setSubmitting] = useState(false)

	const handleDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
		if (Platform.OS === "android") {
			setShowDatePicker(false)
		}
		if (selectedDate) {
			setStartDate(selectedDate)
		}
	}

	useEffect(() => {
		const backAction = () => {
			goBack()
			return true
		}
		const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction)
		return () => backHandler.remove()
	}, [])

	const goBack = () => {
		navigation.dispatch(StackActions.popToTop())
		navigation.dispatch(
			StackActions.replace("MemberDetailsScreen", {
				memberId: member?.uid,
				refresh: true,
				initialPage: 1,
			}),
		)
	}

	const calculateEndDate = (start: Date, pkg: PackageType): Date => {
		const end = new Date(start)
		switch (pkg) {
			case "MONTHLY":
				end.setMonth(end.getMonth() + 1)
				break
			case "QUARTERLY":
				end.setMonth(end.getMonth() + 3)
				break
			case "YEARLY":
				end.setMonth(end.getMonth() + 12)
				break
		}
		return end
	}

	const handleSubmit = async () => {
		let success = false

		if (!price || isNaN(Number(price)) || Number(price) <= 0) {
			toast.show(t("invalidPrice"), { type: "danger" })
			return
		}

		setSubmitting(true)

		try {
			// Before adding a new subscription, we need to cancel the existing active subscription for this member
			if (activeSubscriptionId) {
				const canceled = await cancelSubscription(activeSubscriptionId)
				if (!canceled) {
					toast.show(t("subscriptionCancelError"), { type: "danger" })
					return
				}
			}

			const endDate = calculateEndDate(startDate, packageType)

			const sub: Subscription = {
				memberUid: member?.uid,
				packageType,
				startDate: Timestamp.fromDate(startDate),
				endDate: Timestamp.fromDate(endDate),
				price: Number(price),
				paymentMethod,
				status: "ACTIVE",
				notes: notes || "",
				createdBy: staff.email?.split("@")[0] || "unknown",
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
			}

			success = await addSubscription(sub)
		} catch (e) {
			console.error("[SubscriptionForm] submit error:", e)
			toast.show(t("subscriptionAddError"), { type: "danger" })
		} finally {
			setSubmitting(false)
			if (success) {
				toast.show(t("subscriptionAdded"), { type: "success" })
				goBack()
			}
		}
	}

	const UserInfoView = () => {
		return (
			<View style={styles.userInfoContainer}>
				<View style={styles.row}>
					<ThemedIcon
						name="account"
						size={20}
						color={darkMode ? "#fff" : "#000"}
					/>
					<ThemedText style={styles.userInfoText}>
						{member.firstName} {member.lastName}
					</ThemedText>
				</View>
				<View style={styles.row}>
					<ThemedIcon
						name="email-outline"
						size={19}
						color={darkMode ? "#fff" : "#000"}
					/>
					<ThemedText style={styles.userInfoText}>{member.email}</ThemedText>
				</View>
				<View style={styles.row}>
					<ThemedIcon
						name="phone"
						size={20}
						color={darkMode ? "#fff" : "#000"}
					/>
					<ThemedText style={styles.userInfoText}>{member.phoneNumber}</ThemedText>
				</View>
			</View>
		)
	}

	return (
		<>
			<CustomHeader
				title={t("sellPackage")}
				onBackPress={goBack}
			/>
			<ScrollView style={styles.content}>
				{/* Basic User Info */}
				<UserInfoView />

				{/* Package Type */}
				<ThemedText style={styles.label}>{t("packageType")}</ThemedText>
				<View style={styles.selectionRow}>
					{PACKAGE_TYPES.map((pkg) => (
						<TouchableOpacity
							key={pkg}
							style={[styles.selectionButton, packageType === pkg && styles.selectionButtonActive]}
							onPress={() => setPackageType(pkg)}
						>
							<ThemedText style={[styles.selectionButtonText, packageType === pkg && styles.selectionButtonTextActive]}>
								{t(pkg)}
							</ThemedText>
						</TouchableOpacity>
					))}
				</View>

				{/* Price */}
				<ThemedText style={styles.label}>{t("price")}</ThemedText>
				<TextInput
					style={styles.input}
					value={price}
					onChangeText={setPrice}
					keyboardType="numeric"
					placeholder="0"
					placeholderTextColor={darkMode ? "#666" : "#999"}
				/>

				{/* Payment Method */}
				<ThemedText style={styles.label}>{t("paymentMethod")}</ThemedText>
				<View style={styles.selectionRow}>
					{PAYMENT_METHODS.map((method) => (
						<TouchableOpacity
							key={method}
							style={[styles.selectionButton, paymentMethod === method && styles.selectionButtonActive]}
							onPress={() => setPaymentMethod(method)}
						>
							<ThemedText style={[styles.selectionButtonText, paymentMethod === method && styles.selectionButtonTextActive]}>
								{t(method)}
							</ThemedText>
						</TouchableOpacity>
					))}
				</View>

				{/* Start Date */}
				<ThemedText style={styles.label}>{t("startDate")}</ThemedText>
				<TouchableOpacity
					style={styles.dateButton}
					onPress={() => setShowDatePicker(true)}
				>
					<ThemedText style={styles.dateButtonText}>{startDate.toLocaleDateString()}</ThemedText>
				</TouchableOpacity>
				{showDatePicker && (
					<DateTimePicker
						value={startDate}
						mode="date"
						display={Platform.OS === "ios" ? "spinner" : "default"}
						onChange={handleDateChange}
					/>
				)}

				{/* Notes */}
				<ThemedText style={styles.label}>{t("notes")}</ThemedText>
				<TextInput
					style={[styles.input, styles.notesInput]}
					value={notes}
					onChangeText={setNotes}
					placeholder={t("notesPlaceholder")}
					placeholderTextColor={darkMode ? "#666" : "#999"}
					multiline
					numberOfLines={3}
				/>

				{/* Submit */}
				<ThemedButton
					style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
					onPress={handleSubmit}
					disabled={submitting}
				>
					<ThemedIcon
						name={submitting ? "loading" : "content-save"}
						size={20}
						color={darkMode ? "#000" : "#fff"}
						style={{ marginRight: 8 }}
					/>
					<ThemedText style={styles.submitButtonText}>{submitting ? t("saving") : t("save")}</ThemedText>
				</ThemedButton>
			</ScrollView>
		</>
	)
}

const createStyles = (darkMode: boolean) => {
	const theme = Theme[darkMode ? "dark" : "light"]

	return StyleSheet.create({
		container: {
			flex: 1,
		},
		content: {
			flex: 1,
			paddingHorizontal: 15,
		},
		label: {
			fontSize: 15,
			fontWeight: "bold",
			marginBottom: 8,
			marginTop: 16,
		},
		input: {
			backgroundColor: theme.cardBackground,
			borderRadius: 8,
			padding: 12,
			fontSize: 16,
			color: darkMode ? "#fff" : "#000",
			borderWidth: 1,
			borderColor: theme.border,
		},
		notesInput: {
			minHeight: 80,
			textAlignVertical: "top",
		},
		selectionRow: {
			flexDirection: "row",
			gap: 8,
		},
		selectionButton: {
			flex: 1,
			paddingVertical: 10,
			paddingHorizontal: 8,
			borderRadius: 8,
			borderWidth: 1,
			borderColor: theme.border,
			alignItems: "center",
			backgroundColor: theme.cardBackground,
		},
		selectionButtonActive: {
			backgroundColor: darkMode ? "#fff" : "#000",
			borderColor: darkMode ? "#fff" : "#000",
		},
		selectionButtonText: {
			fontSize: 12,
			fontWeight: "bold",
			color: darkMode ? "#fff" : "#000",
		},
		selectionButtonTextActive: {
			color: darkMode ? "#000" : "#fff",
		},
		dateButton: {
			backgroundColor: theme.cardBackground,
			borderRadius: 8,
			padding: 12,
			borderWidth: 1,
			borderColor: theme.border,
		},
		dateButtonText: {
			fontSize: 16,
		},
		submitButton: {
			borderRadius: 8,
			paddingVertical: 14,
			alignItems: "center",
			marginTop: 24,
			flexDirection: "row",
			justifyContent: "center",
		},
		submitButtonDisabled: {
			opacity: 0.5,
		},
		submitButtonText: {
			color: darkMode ? "#000" : "#fff",
			fontSize: 18,
			fontWeight: "bold",
		},
		userInfoContainer: {
			marginTop: 16,
			backgroundColor: theme.cardBackground,
			padding: 12,
			borderRadius: 8,
			gap: 4,
		},
		userInfoText: {
			fontSize: 16,
		},
		row: {
			flexDirection: "row",
			alignItems: "center",
			gap: 8,
		},
	})
}
