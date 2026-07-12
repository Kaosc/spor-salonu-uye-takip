import { useEffect, useState } from "react"
import { View, TextInput, TouchableOpacity, StyleSheet, Platform, BackHandler } from "react-native"
import { StackActions, useNavigation, useRoute } from "@react-navigation/native"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker"
import { serverTimestamp, Timestamp } from "@react-native-firebase/firestore"

import ThemedText from "../components/ui/ThemedText"
import CustomHeader from "../components/CustomHeader"
import { addSubscription, cancelSubscription } from "../lib/firebase/firestore/subscriptions"

const PACKAGE_TYPES: PackageType[] = ["MONTHLY", "QUARTERLY", "YEARLY"]
const PAYMENT_METHODS: PaymentMethod[] = ["CASH", "CREDIT_CARD", "TRANSFER"]

export default function SubscriptionFormScreen() {
	const navigation = useNavigation<any>()
	const route = useRoute<any>()
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const staff = useSelector((state: RootState) => state.auth)
	const { t } = useTranslation()

	const styles = createStyles(darkMode)

	const memberId = route.params?.memberId
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
				memberId: memberId,
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
				memberUid: memberId,
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

	return (
		<View style={styles.container}>
			<CustomHeader
				title={t("sellPackage")}
				onBackPress={goBack}
			/>
			<View style={styles.content}>
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
				<TouchableOpacity
					style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
					onPress={handleSubmit}
					disabled={submitting}
				>
					<ThemedText style={styles.submitButtonText}>{submitting ? t("saving") : t("save")}</ThemedText>
				</TouchableOpacity>
			</View>
		</View>
	)
}

const createStyles = (darkMode: boolean) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: darkMode ? "#000" : "#f5f5f5",
		},
		content: {
			flex: 1,
			padding: 20,
		},
		label: {
			fontSize: 15,
			fontWeight: "bold",
			marginBottom: 8,
			marginTop: 16,
		},
		input: {
			backgroundColor: darkMode ? "#1a1a1a" : "#fff",
			borderRadius: 8,
			padding: 12,
			fontSize: 16,
			color: darkMode ? "#fff" : "#000",
			borderWidth: 1,
			borderColor: darkMode ? "#333" : "#ddd",
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
			borderColor: darkMode ? "#333" : "#ddd",
			alignItems: "center",
			backgroundColor: darkMode ? "#1a1a1a" : "#fff",
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
			backgroundColor: darkMode ? "#1a1a1a" : "#fff",
			borderRadius: 8,
			padding: 12,
			borderWidth: 1,
			borderColor: darkMode ? "#333" : "#ddd",
		},
		dateButtonText: {
			fontSize: 16,
			color: darkMode ? "#fff" : "#000",
		},
		submitButton: {
			backgroundColor: darkMode ? "#fff" : "#000",
			borderRadius: 8,
			paddingVertical: 14,
			alignItems: "center",
			marginTop: 24,
		},
		submitButtonDisabled: {
			opacity: 0.5,
		},
		submitButtonText: {
			color: darkMode ? "#000" : "#fff",
			fontSize: 16,
			fontWeight: "bold",
		},
	})
