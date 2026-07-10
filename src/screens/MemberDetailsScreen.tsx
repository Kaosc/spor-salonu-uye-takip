import { useEffect, useState } from "react"
import { ScrollView, View, TouchableOpacity, StyleSheet, BackHandler } from "react-native"
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
import { Theme } from "../utils/theme"
import { getSubscriptionsByMemberId } from "../lib/firebase/firestore/subscriptions"

const db = getFirestore()

export default function MemberDetailsScreen() {
	const navigation = useNavigation<any>()
	const route = useRoute<any>()
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const { t } = useTranslation()

	const styles = createStyles(darkMode)

	const [memberStatus, setMemberStatus] = useState<"idle" | "loading" | "error">("idle")
	const [subscriptionStatus, setSubscriptionStatus] = useState<"idle" | "loading" | "error">("idle")

	const [member, setMember] = useState<Member | null>(null)
	const [subscription, setsubscription] = useState<Subscription | null>(null)

	useEffect(() => {
		const backAction = () => {
			goBack()
			return true
		}
		const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction)
		return () => backHandler.remove()
	}, [])

	const goBack = () => {
		if (route.params?.prevScreen === "SearchScreen") {
			navigation.goBack()
			return
		}
		navigation.navigate("MemberStack", { screen: "MemberListScreen" })
	}

	const fetchMember = async () => {
		if (!route.params?.memberId) return
		const t = setTimeout(() => setMemberStatus("loading"), 1000)
		const member = await getMemberById(route.params?.memberId)

		clearTimeout(t)
		setMember(member)
		setMemberStatus(member ? "idle" : "error")
	}

	const fetchSubscription = async () => {
		if (!route.params?.memberId) return
		let t = setTimeout(() => setSubscriptionStatus("loading"), 1000)
		const subscription = await getSubscriptionsByMemberId(route.params?.memberId)

		if (subscription.length > 0) {
			setsubscription(subscription[0])
		}

		clearTimeout(t)
		setSubscriptionStatus(subscription.length > 0 ? "idle" : "error")
	}

	useEffect(() => {
		fetchMember()
		fetchSubscription()
	}, [route.params?.memberId])

	const formatEndDate = (date: unknown) => {
		const dateStr = safeTimestampToDateString(date)
		if (!dateStr) return "-"
		return new Date(dateStr).toLocaleDateString()
	}

	const SubscriptionDetails = () => {
		return (
			<View style={[styles.card, subscription ? styles.subscriptionCardActive : styles.subscriptionCardInactive]}>
				<ThemedText style={styles.sectionTitle}>{t("subscriptionStatus")}</ThemedText>
				{subscriptionStatus === "loading" ? (
					<View>
						<ThemedActivityIndicator size={50} />
					</View>
				) : (
					<>
						{subscription ? (
							<View>
								<ThemedText style={styles.subscriptionPackage}>{t(subscription.packageType)}</ThemedText>
								<ThemedText style={styles.subscriptionDate}>
									{t("endDate")}: {formatEndDate(subscription.endDate)}
								</ThemedText>
								<ThemedText style={styles.subscriptionDate}>
									{t("daysLeft")}: {calculateEndDateAsDays(subscription.startDate, subscription.packageType)}
								</ThemedText>
							</View>
						) : (
							<ThemedText style={styles.noSubscriptionText}>
								{t("subscription")}: {t("none")}
							</ThemedText>
						)}

						<ThemedButton
							style={styles.sellPackageButton}
							onPress={() =>
								navigation.navigate("SubscriptionFormScreen", {
									memberId: route.params?.memberId,
									subscriptionId: subscription?.id || false,
								})
							}
						>
							<ThemedText style={styles.sellPackageButtonText}>{t("sellPackage")}</ThemedText>
						</ThemedButton>
					</>
				)}
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
						/>
						<ThemedText style={styles.label}>{t("email")}</ThemedText>
					</View>
					<ThemedText style={styles.value}>{member.email || "-"}</ThemedText>
				</View>

				<View style={styles.row}>
					<View style={styles.rowLabel}>
						<ThemedIcon
							name="gender-male-female"
							size={18}
						/>
						<ThemedText style={styles.label}>{t("gender")}</ThemedText>
					</View>
					<ThemedText style={styles.value}>{member.gender || "-"}</ThemedText>
				</View>

				<View style={styles.row}>
					<View style={styles.rowLabel}>
						<ThemedIcon
							name="calendar"
							size={18}
						/>
						<ThemedText style={styles.label}>{t("birthDate")}</ThemedText>
					</View>
					<ThemedText style={styles.value}>
						{new Date(safeTimestampToDateString(member.birthDate)).toLocaleDateString()}
					</ThemedText>
				</View>

				<View style={styles.row}>
					<View style={styles.rowLabel}>
						<ThemedIcon
							name="water"
							size={18}
						/>
						<ThemedText style={styles.label}>{t("bloodType")}</ThemedText>
					</View>
					<ThemedText style={styles.value}>{member.bloodType || "-"}</ThemedText>
				</View>

				<View style={styles.row}>
					<View style={styles.rowLabel}>
						<ThemedIcon
							name="lock"
							size={18}
						/>
						<ThemedText style={styles.label}>{t("lockerNumber")}</ThemedText>
					</View>
					<ThemedText style={styles.value}>{member.lockerNumber || "-"}</ThemedText>
				</View>

				<View style={styles.row}>
					<View style={styles.rowLabel}>
						<ThemedIcon
							name="check-circle-outline"
							size={18}
						/>
						<ThemedText style={styles.label}>{t("isActive")}</ThemedText>
					</View>
					<ThemedText style={styles.value}>{member.isActive ? t("yes") : t("no")}</ThemedText>
				</View>

				<View style={styles.row}>
					<View style={styles.rowLabel}>
						<ThemedIcon
							name="clock-outline"
							size={18}
						/>
						<ThemedText style={styles.label}>{t("createdAt")}</ThemedText>
					</View>
					<ThemedText style={styles.value}>{safeTimestampToDateTimeString(member.createdAt)}</ThemedText>
				</View>

				<View style={styles.row}>
					<View style={styles.rowLabel}>
						<ThemedIcon
							name="calendar-sync"
							size={18}
						/>
						<ThemedText style={styles.label}>{t("updatedAt")}</ThemedText>
					</View>
					<ThemedText style={styles.value}>{safeTimestampToDateTimeString(member.updatedAt)}</ThemedText>
				</View>

				<View style={styles.row}>
					<View style={styles.rowLabel}>
						<ThemedIcon
							name="account-plus-outline"
							size={18}
						/>
						<ThemedText style={styles.label}>{t("createdBy")}</ThemedText>
					</View>
					<ThemedText style={styles.value}>{member.createdBy || "-"}</ThemedText>
				</View>

				<ThemedText style={styles.sectionTitle}>{t("emergencyContact")}</ThemedText>

				<View style={styles.row}>
					<View style={styles.rowLabel}>
						<ThemedIcon
							name="account-star-outline"
							size={18}
						/>
						<ThemedText style={styles.label}>{t("name")}</ThemedText>
					</View>
					<ThemedText style={styles.value}>{member.emergencyContact?.name || "-"}</ThemedText>
				</View>
				<View style={styles.row}>
					<View style={styles.rowLabel}>
						<ThemedIcon
							name="phone-forward"
							size={18}
						/>
						<ThemedText style={styles.label}>{t("phone")}</ThemedText>
					</View>
					<ThemedText style={styles.value}>{member.emergencyContact?.phone || "-"}</ThemedText>
				</View>
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<CustomHeader
				title={t("memberDetails")}
				onBackPress={goBack}
			/>
			<ScrollView
				style={{ flex: 1 }}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{!member ? (
					memberStatus === "loading" ? (
						<ThemedActivityIndicator size={70} />
					) : (
						memberStatus === "error" && (
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
					<View style={{ gap: 10 }}>
						<SubscriptionDetails />
						<MemberDetails member={member} />
					</View>
				)}
			</ScrollView>
		</View>
	)
}

const createStyles = (darkMode: boolean) => {
	const theme = Theme[darkMode ? "dark" : "light"]

	return StyleSheet.create({
		container: {
			flex: 1,
		},
		scrollContent: {
			padding: 10,
			flexGrow: 1,
			justifyContent: "center",
			paddingBottom: 10,
		},
		card: {
			backgroundColor: theme.cardBackground,
			borderWidth: StyleSheet.hairlineWidth,
			borderColor: theme.border,
			borderRadius: 12,
			padding: 20,
		},
		subscriptionCardActive: {
			backgroundColor: theme.green.background,
		},
		subscriptionCardInactive: {
			backgroundColor: theme.red.background,
		},
		title: {
			fontSize: 22,
			fontWeight: "700",
			marginBottom: 20,
			textAlign: "center",
		},
		sectionTitle: {
			fontSize: 17,
			fontWeight: "700",
			marginTop: 20,
			marginBottom: 8,
		},
		row: {
			flexDirection: "row",
			justifyContent: "space-between",
			paddingVertical: 12,
			borderBottomWidth: StyleSheet.hairlineWidth,
			borderBottomColor: theme.border,
		},
		rowLabel: {
			flexDirection: "row",
			alignItems: "center",
			gap: 8,
		},
		label: {
			fontSize: 14,
			opacity: 0.8,
			fontWeight: "bold",
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
			opacity: 0.8,
		},
		noSubscriptionText: {
			fontSize: 15,
			fontWeight: "600",
			color: theme.red.foreground,
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
}
