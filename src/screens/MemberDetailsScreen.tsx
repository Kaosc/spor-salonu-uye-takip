import { useEffect, useState } from "react"
import { ScrollView, View, TouchableOpacity, StyleSheet } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import { getFirestore, collection, query, where, onSnapshot } from "@react-native-firebase/firestore"

import ThemedText from "../components/ui/ThemedText"
import CustomHeader from "../components/CustomHeader"
import ThemedIcon from "../components/ui/ThemedIcon"
import ThemedActivityIndicator from "../components/ui/ThemedActivityIndicator"
import ThemedButton from "../components/ui/ThemedButton"

import { getMemberById } from "../lib/firebase/firestore/member"
import { calculateEndDateAsDays, safeTimestampToDateString, safeTimestampToDateTimeString } from "../utils/date"

const db = getFirestore()

export default function MemberDetailsScreen() {
	const navigation = useNavigation<any>()
	const route = useRoute<any>()
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const { t } = useTranslation()

	const styles = createStyles(darkMode)

	const [status, setStatus] = useState<"idle" | "loading" | "error">("idle")
	const [member, setMember] = useState<Member | null>(null)
	const [activeSubscription, setActiveSubscription] = useState<Subscription | null>(null)

	const fetchMember = async () => {
		setTimeout(() => setStatus("loading"), 1000)
		const member = await getMemberById(route.params?.memberId)
		setMember(member)
		setStatus(member ? "idle" : "error")
	}

	useEffect(() => {
		fetchMember()
	}, [route.params?.memberId])

	useEffect(() => {
		const memberId = route.params?.memberId
		if (!memberId) return

		const subRef = collection(db, "subscriptions")
		const q = query(subRef, where("memberUid", "==", memberId), where("status", "==", "ACTIVE"))

		const unsubscribe = onSnapshot(q, (snapshot) => {
			if (snapshot.empty) {
				setActiveSubscription(null)
			} else {
				const doc = snapshot.docs[0]
				const data = doc.data() as Subscription
				setActiveSubscription({ ...data, id: doc.id })
			}
		})

		return unsubscribe
	}, [route.params?.memberId])

	const formatEndDate = (date: unknown) => {
		const dateStr = safeTimestampToDateString(date)
		if (!dateStr) return "-"
		return new Date(dateStr).toLocaleDateString()
	}

	const SubscriptionDetails = () => {
		return (
			<View style={[styles.card, activeSubscription ? styles.subscriptionCardActive : styles.subscriptionCardInactive]}>
				<ThemedText style={styles.sectionTitle}>{t("subscriptionStatus")}</ThemedText>
				{activeSubscription ? (
					<View>
						<ThemedText style={styles.subscriptionPackage}>{t(activeSubscription.packageType)}</ThemedText>
						<ThemedText style={styles.subscriptionDate}>
							{t("endDate")}: {formatEndDate(activeSubscription.endDate)}
						</ThemedText>
						<ThemedText style={styles.subscriptionDate}>
							{t("daysLeft")}: {calculateEndDateAsDays(activeSubscription.startDate, activeSubscription.packageType)}
						</ThemedText>
					</View>
				) : (
					<ThemedText style={styles.noSubscriptionText}>
						{t("activeSubscription")}: {t("none")}
					</ThemedText>
				)}

				<ThemedButton
					style={styles.sellPackageButton}
					onPress={() =>
						navigation.navigate("SubscriptionFormScreen", {
							memberId: route.params?.memberId,
							activeSubscriptionId: activeSubscription?.id || false,
						})
					}
				>
					<ThemedText style={styles.sellPackageButtonText}>{t("sellPackage")}</ThemedText>
				</ThemedButton>
			</View>
		)
	}

	const MemberDetails = ({ member }: { member: Member }) => {
		return (
			<View style={styles.card}>
				<View style={styles.actionRow}>
					<TouchableOpacity onPress={() => navigation.navigate("MemberFormScreen", { memberId: member?.uid })}>
						<ThemedIcon
							name="pen"
							size={24}
							color={darkMode ? "#fff" : "#000"}
						/>
					</TouchableOpacity>
				</View>
				<ThemedIcon
					name={member?.gender === "FEMALE" ? "female" : "male"}
					size={80}
					color={darkMode ? "#fff" : "#000"}
					style={{ alignSelf: "center", marginBottom: 20 }}
				/>

				<ThemedText style={styles.title}>
					{member.firstName} {member.lastName}
				</ThemedText>

				<View style={styles.row}>
					<View style={styles.rowLabel}>
						<ThemedIcon
							name="phone"
							size={18}
							color={darkMode ? "#aaa" : "#666"}
						/>
						<ThemedText style={styles.label}>{t("phone")}</ThemedText>
					</View>
					<ThemedText style={styles.value}>{member.phoneNumber || "-"}</ThemedText>
				</View>

				<View style={styles.row}>
					<View style={styles.rowLabel}>
						<ThemedIcon
							name="mail"
							size={18}
							color={darkMode ? "#aaa" : "#666"}
						/>
						<ThemedText style={styles.label}>{t("email")}</ThemedText>
					</View>
					<ThemedText style={styles.value}>{member.email || "-"}</ThemedText>
				</View>

				<View style={styles.row}>
					<ThemedText style={styles.label}>{t("gender")}</ThemedText>
					<ThemedText style={styles.value}>{member.gender || "-"}</ThemedText>
				</View>

				<View style={styles.row}>
					<ThemedText style={styles.label}>{t("birthDate")}</ThemedText>
					<ThemedText style={styles.value}>
						{new Date(safeTimestampToDateString(member.birthDate)).toLocaleDateString()}
					</ThemedText>
				</View>

				<View style={styles.row}>
					<ThemedText style={styles.label}>{t("bloodType")}</ThemedText>
					<ThemedText style={styles.value}>{member.bloodType || "-"}</ThemedText>
				</View>

				<View style={styles.row}>
					<View style={styles.rowLabel}>
						<ThemedIcon
							name="lock"
							size={18}
							color={darkMode ? "#aaa" : "#666"}
						/>
						<ThemedText style={styles.label}>{t("lockerNumber")}</ThemedText>
					</View>
					<ThemedText style={styles.value}>{member.lockerNumber || "-"}</ThemedText>
				</View>

				<View style={styles.row}>
					<ThemedText style={styles.label}>{t("isActive")}</ThemedText>
					<ThemedText style={styles.value}>{member.isActive ? t("yes") : t("no")}</ThemedText>
				</View>

				<View style={styles.row}>
					<ThemedText style={styles.label}>{t("createdAt")}</ThemedText>
					<ThemedText style={styles.value}>{safeTimestampToDateTimeString(member.createdAt)}</ThemedText>
				</View>

				<View style={styles.row}>
					<ThemedText style={styles.label}>{t("updatedAt")}</ThemedText>
					<ThemedText style={styles.value}>{safeTimestampToDateTimeString(member.updatedAt)}</ThemedText>
				</View>

				<View style={styles.row}>
					<ThemedText style={styles.label}>{t("createdBy")}</ThemedText>
					<ThemedText style={styles.value}>{member.createdBy || "-"}</ThemedText>
				</View>

				<ThemedText style={styles.sectionTitle}>{t("emergencyContact")}</ThemedText>
				<View style={styles.row}>
					<ThemedText style={styles.label}>{t("name")}</ThemedText>
					<ThemedText style={styles.value}>{member.emergencyContact?.name || "-"}</ThemedText>
				</View>
				<View style={styles.row}>
					<ThemedText style={styles.label}>{t("phone")}</ThemedText>
					<ThemedText style={styles.value}>{member.emergencyContact?.phone || "-"}</ThemedText>
				</View>
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<CustomHeader title={t("memberDetails")} />
			<ScrollView
				style={{ flex: 1 }}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{!member ? (
					status === "loading" ? (
						<ThemedActivityIndicator size={70} />
					) : (
						status === "error" && (
							<View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 5 }}>
								<ThemedIcon
									name="account-alert-outline"
									size={90}
									style={{ alignSelf: "center", marginLeft: 10, opacity: 0.7 }}
								/>
								<ThemedText style={{ textAlign: "center" }}>{t("memberNotFound")}</ThemedText>
							</View>
						)
					)
				) : (
					<View style={{ gap: 30 }}>
						<SubscriptionDetails />
						<MemberDetails member={member} />
					</View>
				)}
			</ScrollView>
		</View>
	)
}

const createStyles = (darkMode: boolean) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: darkMode ? "#000" : "#f5f5f5",
		},
		scrollContent: {
			padding: 20,
			flexGrow: 1,
			justifyContent: "center",
			paddingBottom: 40,
		},
		card: {
			backgroundColor: darkMode ? "#1a1a1a" : "#fff",
			borderRadius: 12,
			padding: 20,
			shadowColor: "#000",
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.1,
			shadowRadius: 4,
			elevation: 3,
		},
		subscriptionCardActive: {
			backgroundColor: darkMode ? "#1a3a1a" : "#e8f5e9",
		},
		subscriptionCardInactive: {
			backgroundColor: darkMode ? "#3a1a1a" : "#ffebee",
		},
		title: {
			fontSize: 22,
			fontWeight: "700",
			marginBottom: 20,
			textAlign: "center",
		},
		sectionTitle: {
			fontSize: 16,
			fontWeight: "700",
			marginTop: 16,
			marginBottom: 8,
		},
		row: {
			flexDirection: "row",
			justifyContent: "space-between",
			paddingVertical: 12,
			borderBottomWidth: 1,
			borderBottomColor: darkMode ? "#333" : "#eee",
		},
		rowLabel: {
			flexDirection: "row",
			alignItems: "center",
			gap: 8,
		},
		label: {
			fontSize: 15,
			color: darkMode ? "#aaa" : "#666",
			fontWeight: "500",
		},
		value: {
			fontSize: 15,
			fontWeight: "600",
		},
		actionRow: {
			flexDirection: "row",
			justifyContent: "flex-end",
			gap: 20,
			marginBottom: 30,
		},
		subscriptionPackage: {
			fontSize: 16,
			fontWeight: "700",
			marginBottom: 4,
		},
		subscriptionDate: {
			fontSize: 14,
			color: darkMode ? "#aaa" : "#666",
		},
		noSubscriptionText: {
			fontSize: 15,
			fontWeight: "600",
			color: darkMode ? "#ff6b6b" : "#c62828",
		},
		sellPackageButton: {
			paddingVertical: 14,
			alignItems: "center",
			marginTop: 24,
		},
		sellPackageButtonText: {
			color: darkMode ? "#000" : "#fff",
			fontSize: 16,
			fontWeight: "bold",
		},
	})
