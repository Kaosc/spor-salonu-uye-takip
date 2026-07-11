import { useEffect, useRef, useState } from "react"
import { ScrollView, View, TouchableOpacity, StyleSheet, BackHandler, Alert } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import PagerView from "react-native-pager-view"

import ThemedText from "../components/ui/ThemedText"
import CustomHeader from "../components/CustomHeader"
import ThemedIcon from "../components/ui/ThemedIcon"
import ThemedActivityIndicator from "../components/ui/ThemedActivityIndicator"
import ThemedButton from "../components/ui/ThemedButton"

import { activateMember, getMemberById, inactivateMember } from "../lib/firebase/firestore/member"
import { getSubscriptionsByMemberId } from "../lib/firebase/firestore/subscriptions"
import { calculateEndDateAsDays, safeTimestampToDateString, safeTimestampToDateTimeString } from "../utils/date"
import { Theme } from "../utils/theme"

import { AllIconNames } from "../types/icon"

export default function MemberDetailsScreen() {
	const navigation = useNavigation<any>()
	const route = useRoute<any>()
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const { t } = useTranslation()

	const styles = createStyles(darkMode)
	const theme = Theme[darkMode ? "dark" : "light"]

	const [activePage, setActivePage] = useState(0)
	const pagerRef = useRef<PagerView>(null)

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
		const prevScreen = route.params?.prevScreen
		if (prevScreen === "SearchScreen") {
			navigation.navigate("SearchScreen")
			return
		}

		if (prevScreen === "SubscriptionsScreen") {
			navigation.navigate("Tabs", { screen: "SubscriptionStack" })
			return
		}

		navigation.navigate("Tabs", { screen: "MemberStack" })
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

	const getStatusColor = (status?: string) => {
		switch (status) {
			case "ACTIVE":
				return darkMode ? Theme.dark.green.foreground : Theme.light.green.foreground
			case "EXPIRED":
				return darkMode ? Theme.dark.red.foreground : Theme.light.red.foreground
			case "CANCELLED":
				return darkMode ? Theme.dark.red.foreground : Theme.light.red.foreground
			case "PAUSED":
				return "#f0ad4e"
			default:
				return theme.text
		}
	}

	const formatPrice = (price: number) => {
		return `${price.toFixed(2)} ₺`
	}

	const SubscriptionDetails = () => {
		const statusColor = subscription ? getStatusColor(subscription.status) : getStatusColor(undefined)
		const daysLeft = subscription ? calculateEndDateAsDays(subscription.startDate, subscription.packageType) : null

		return (
			<View style={styles.card}>
				{subscriptionStatus === "loading" ? (
					<View style={{ padding: 40, alignItems: "center" }}>
						<ThemedActivityIndicator size={50} />
					</View>
				) : subscription ? (
					<>
						{/* Status Badge */}
						<View style={[styles.statusBadge, { borderColor: statusColor }]}>
							<View style={[styles.statusDot, { backgroundColor: statusColor }]} />
							<ThemedText style={[styles.statusBadgeText, { color: statusColor }]}>
								{t(subscription.status?.toLowerCase() || "")}
							</ThemedText>
						</View>

						{/* Package Header */}
						<View style={styles.subHeader}>
							<ThemedText style={styles.packageName}>{t(subscription.packageType)}</ThemedText>
							<ThemedText style={styles.packagePrice}>{formatPrice(subscription.price)}</ThemedText>
						</View>

						{/* Days Left */}
						{daysLeft !== null && (
							<View style={styles.daysLeftRow}>
								<ThemedText style={styles.daysLeftNumber}>{daysLeft}</ThemedText>
								<ThemedText style={styles.daysLeftLabel}>{t("daysLeft")}</ThemedText>
							</View>
						)}

						{/* Divider */}
						<View style={styles.divider} />

						{/* Info Rows */}
						<View style={styles.infoRow}>
							<View style={styles.infoRowLabel}>
								<ThemedIcon
									name="calendar-start"
									size={16}
								/>
								<ThemedText style={styles.infoLabel}>{t("startDate")}</ThemedText>
							</View>
							<ThemedText style={styles.infoValue}>{formatEndDate(subscription.startDate)}</ThemedText>
						</View>

						<View style={styles.infoRow}>
							<View style={styles.infoRowLabel}>
								<ThemedIcon
									name="calendar-end"
									size={16}
								/>
								<ThemedText style={styles.infoLabel}>{t("endDate")}</ThemedText>
							</View>
							<ThemedText style={styles.infoValue}>{formatEndDate(subscription.endDate)}</ThemedText>
						</View>

						<View style={styles.infoRow}>
							<View style={styles.infoRowLabel}>
								<ThemedIcon
									name="credit-card-outline"
									size={16}
								/>
								<ThemedText style={styles.infoLabel}>{t("paymentMethod")}</ThemedText>
							</View>
							<ThemedText style={styles.infoValue}>{t(subscription.paymentMethod)}</ThemedText>
						</View>

						{subscription.notes ? (
							<View style={styles.notesSection}>
								<View style={styles.infoRowLabel}>
									<ThemedIcon
										name="note-text-outline"
										size={16}
									/>
									<ThemedText style={styles.infoLabel}>{t("notes")}</ThemedText>
								</View>
								<ThemedText style={styles.notesText}>{subscription.notes}</ThemedText>
							</View>
						) : null}

						<View style={styles.divider} />

						<View style={styles.infoRow}>
							<View style={styles.infoRowLabel}>
								<ThemedIcon
									name="account-plus-outline"
									size={16}
								/>
								<ThemedText style={styles.infoLabel}>{t("createdBy")}</ThemedText>
							</View>
							<ThemedText style={styles.infoValue}>{subscription.createdBy || "-"}</ThemedText>
						</View>

						{subscription.createdAt && (
							<View style={styles.infoRow}>
								<View style={styles.infoRowLabel}>
									<ThemedIcon
										name="clock-outline"
										size={16}
									/>
									<ThemedText style={styles.infoLabel}>{t("createdAt")}</ThemedText>
								</View>
								<ThemedText style={styles.infoValue}>{safeTimestampToDateTimeString(subscription.createdAt)}</ThemedText>
							</View>
						)}

						{/* Sell Package Button */}
						{member?.isActive ? (
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
						) : (
							<View style={styles.noSubContainer}>
								<ThemedIcon
									name="alert"
									size={23}
									color={darkMode ? Theme.dark.red.foreground : Theme.light.red.foreground}
								/>
								<ThemedText style={styles.noSubscriptionText}>{t("memberIsInactive")}</ThemedText>
							</View>
						)}
					</>
				) : (
					<>
						<View style={styles.noSubscriptionCard}>
							<ThemedIcon
								name="card-bulleted-off-outline"
								size={60}
								color={theme.text}
								style={{ opacity: 0.3, alignSelf: "center", marginBottom: 12 }}
							/>
							<ThemedText style={styles.noSubscriptionTitle}>{t("noActiveSubscription")}</ThemedText>
							<ThemedText style={styles.noSubscriptionSubtitle}>{t("sellPackagePrompt")}</ThemedText>
						</View>

						{member?.isActive ? (
							<ThemedButton
								style={styles.sellPackageButton}
								onPress={() =>
									navigation.navigate("SubscriptionFormScreen", {
										memberId: route.params?.memberId,
										subscriptionId: false,
									})
								}
							>
								<ThemedText style={styles.sellPackageButtonText}>{t("sellPackage")}</ThemedText>
							</ThemedButton>
						) : (
							<View style={styles.noSubContainer}>
								<ThemedIcon
									name="alert"
									size={23}
									color={darkMode ? Theme.dark.red.foreground : Theme.light.red.foreground}
								/>
								<ThemedText style={styles.noSubscriptionText}>{t("memberIsInactive")}</ThemedText>
							</View>
						)}
					</>
				)}
			</View>
		)
	}

	const handleInactivateMember = async () => {
		const inactivate = async () => {
			const succes = await inactivateMember(route.params?.memberId)
			if (succes) {
				toast.show(t("memberInactivated"), { type: "success" })
				setMember((prev) => (prev ? { ...prev, isActive: false } : prev))
			}
		}

		Alert.alert(t("inactivateMember"), t("inactivateMemberConfirmation"), [
			{
				text: t("cancel"),
				style: "cancel",
			},
			{
				text: t("inactivate"),
				style: "destructive",
				onPress: async () => await inactivate(),
			},
		])
	}

	const handleActivateMember = async () => {
		const activate = async () => {
			const succes = await activateMember(route.params?.memberId)
			if (succes) {
				toast.show(t("memberActivated"), { type: "success" })
				setMember((prev) => (prev ? { ...prev, isActive: true } : prev))
			}
		}

		Alert.alert(t("activateMember"), t("activateMemberConfirmation"), [
			{
				text: t("cancel"),
				style: "cancel",
			},
			{
				text: t("activate"),
				style: "default",
				onPress: async () => await activate(),
			},
		])
	}

	const DetailsRow = ({ label, value, iconName }: { label: string; value: string; iconName: AllIconNames }) => {
		return (
			<View style={styles.row}>
				<View style={styles.rowLabel}>
					<ThemedIcon
						name={iconName}
						size={18}
					/>
					<ThemedText style={styles.label}>{label}</ThemedText>
				</View>
				<ThemedText style={styles.value}>{value || "-"}</ThemedText>
			</View>
		)
	}

	const MemberDetails = ({ member }: { member: Member }) => {
		return (
			<View style={styles.card}>
				<View style={styles.actionRow}>
					<View style={{ flexDirection: "row", gap: 20 }}>
						{member.isActive ? (
							<TouchableOpacity onPress={handleInactivateMember}>
								<ThemedIcon
									name="account-cancel"
									size={26}
									color={darkMode ? Theme.dark.red.foreground : Theme.light.red.foreground}
								/>
							</TouchableOpacity>
						) : (
							<TouchableOpacity onPress={handleActivateMember}>
								<ThemedIcon
									name="account-check"
									size={26}
									color={darkMode ? Theme.dark.green.foreground : Theme.light.green.foreground}
								/>
							</TouchableOpacity>
						)}
					</View>
					<TouchableOpacity onPress={() => navigation.navigate("MemberFormScreen", { memberId: member?.uid })}>
						<ThemedIcon
							name="pen"
							size={26}
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

				<DetailsRow
					label={t("phone")}
					value={member.phoneNumber || "-"}
					iconName="phone"
				/>
				<DetailsRow
					label={t("email")}
					value={member.email || "-"}
					iconName="mail"
				/>
				<DetailsRow
					label={t("gender")}
					value={member.gender || "-"}
					iconName="gender-male-female"
				/>
				<DetailsRow
					label={t("birthDate")}
					value={new Date(safeTimestampToDateString(member.birthDate)).toLocaleDateString()}
					iconName="calendar"
				/>
				<DetailsRow
					label={t("bloodType")}
					value={member.bloodType || "-"}
					iconName="water"
				/>
				<DetailsRow
					label={t("lockerNumber")}
					value={member.lockerNumber || "-"}
					iconName="lock"
				/>
				<DetailsRow
					label={t("address")}
					value={member.address || "-"}
					iconName="home"
				/>
				<DetailsRow
					label={t("isActive")}
					value={member.isActive ? t("yes") : t("no")}
					iconName="check-circle-outline"
				/>
				<DetailsRow
					label={t("createdAt")}
					value={safeTimestampToDateTimeString(member.createdAt)}
					iconName="clock-outline"
				/>
				<DetailsRow
					label={t("updatedAt")}
					value={safeTimestampToDateTimeString(member.updatedAt)}
					iconName="clock-outline"
				/>
				<DetailsRow
					label={t("createdBy")}
					value={member.createdBy || "-"}
					iconName="account-plus-outline"
				/>

				<ThemedText style={styles.sectionTitle}>{t("emergencyContact")}</ThemedText>

				<DetailsRow
					label={t("name")}
					value={member.emergencyContact?.name || "-"}
					iconName="account-star-outline"
				/>
				<DetailsRow
					label={t("phone")}
					value={member.emergencyContact?.phone || "-"}
					iconName="phone-forward"
				/>
			</View>
		)
	}

	const TabBar = () => {
		return (
			<View style={styles.tabBar}>
				<TouchableOpacity
					style={[styles.tab, activePage === 0 && styles.tabActive]}
					onPress={() => {
						setActivePage(0)
						pagerRef.current?.setPage(0)
					}}
				>
					<ThemedIcon
						name="account"
						size={16}
						color={activePage === 0 ? (darkMode ? "#000" : "#fff") : undefined}
					/>
					<ThemedText style={[styles.tabText, activePage === 0 && styles.tabTextActive]}>{t("memberDetails")}</ThemedText>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.tab, activePage === 1 && styles.tabActive]}
					onPress={() => {
						setActivePage(1)
						pagerRef.current?.setPage(1)
					}}
				>
					<ThemedIcon
						name="card-text"
						size={16}
						color={activePage === 1 ? (darkMode ? "#000" : "#fff") : undefined}
					/>
					<ThemedText style={[styles.tabText, activePage === 1 && styles.tabTextActive]}>{t("subscriptionInfo")}</ThemedText>
				</TouchableOpacity>
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<CustomHeader
				title={t("memberDetails")}
				onBackPress={goBack}
			/>
			{!member ? (
				<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
					{memberStatus === "loading" ? (
						<ThemedActivityIndicator size={70} />
					) : (
						memberStatus === "error" && (
							<View style={{ justifyContent: "center", alignItems: "center", gap: 5 }}>
								<ThemedIcon
									name="account-alert-outline"
									size={90}
									style={{ alignSelf: "center", marginLeft: 10, opacity: 0.7 }}
								/>
								<ThemedText style={{ textAlign: "center" }}>{t("memberNotFound")}</ThemedText>
							</View>
						)
					)}
				</View>
			) : (
				<>
					{/* Tab Bar */}
					<TabBar />
					<PagerView
						ref={pagerRef}
						style={{ flex: 1 }}
						initialPage={0}
						onPageSelected={(e) => setActivePage(e.nativeEvent.position)}
					>
						<ScrollView
							key="1"
							style={{ flex: 1 }}
							contentContainerStyle={styles.pageContent}
							showsVerticalScrollIndicator={false}
						>
							<MemberDetails member={member} />
						</ScrollView>
						<ScrollView
							key="2"
							style={{ flex: 1 }}
							contentContainerStyle={styles.pageContent}
							showsVerticalScrollIndicator={false}
						>
							<SubscriptionDetails />
						</ScrollView>
					</PagerView>
				</>
			)}
		</View>
	)
}

const createStyles = (darkMode: boolean) => {
	const theme = Theme[darkMode ? "dark" : "light"]

	return StyleSheet.create({
		container: {
			flex: 1,
		},
		tabBar: {
			flexDirection: "row",
			marginHorizontal: 10,
			paddingBottom: 10,
			gap: 8,
		},
		tab: {
			flex: 1,
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			gap: 6,
			paddingVertical: 9,
			opacity: 0.6,
			marginTop: 10,
			borderRadius: 40,
			borderWidth: 1,
			borderColor: theme.border,
		},
		tabActive: {
			backgroundColor: darkMode ? "#fff" : "#000",
			opacity: 1,
		},
		tabText: {
			fontSize: 14,
			fontWeight: "bold",
		},
		tabTextActive: {
			fontWeight: "bold",
			color: darkMode ? "#000" : "#fff",
		},
		pageContent: {
			flexGrow: 1,
			paddingBottom: 20,
			paddingHorizontal: 5,
		},
		card: {
			backgroundColor: theme.cardBackground,
			borderWidth: StyleSheet.hairlineWidth,
			borderColor: theme.border,
			borderRadius: 12,
			padding: 20,
		},
		statusBadge: {
			flexDirection: "row",
			alignItems: "center",
			alignSelf: "flex-start",
			gap: 6,
			borderWidth: 1,
			borderRadius: 20,
			paddingHorizontal: 12,
			paddingVertical: 4,
			marginBottom: 16,
		},
		statusDot: {
			width: 8,
			height: 8,
			borderRadius: 4,
		},
		statusBadgeText: {
			fontSize: 12,
			fontWeight: "700",
			textTransform: "uppercase",
		},
		subHeader: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
		},
		packageName: {
			fontSize: 22,
			fontWeight: "800",
		},
		packagePrice: {
			fontSize: 20,
			fontWeight: "700",
			opacity: 0.8,
		},
		daysLeftRow: {
			flexDirection: "row",
			alignItems: "baseline",
			gap: 12,
			marginTop: 12,
		},
		daysLeftNumber: {
			fontSize: 32,
			fontWeight: "800",
		},
		daysLeftLabel: {
			fontSize: 16,
			fontWeight: "600",
			opacity: 0.8,
		},
		divider: {
			height: StyleSheet.hairlineWidth,
			backgroundColor: theme.border,
			marginVertical: 16,
		},
		infoRow: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			paddingVertical: 10,
		},
		infoRowLabel: {
			flexDirection: "row",
			alignItems: "center",
			gap: 8,
		},
		infoLabel: {
			fontSize: 13,
			fontWeight: "600",
			opacity: 0.7,
		},
		infoValue: {
			fontSize: 14,
			fontWeight: "600",
		},
		notesSection: {
			paddingVertical: 10,
			gap: 6,
		},
		notesText: {
			fontSize: 13,
			opacity: 0.8,
			lineHeight: 18,
		},
		noSubscriptionCard: {
			alignItems: "center",
			paddingVertical: 30,
		},
		noSubscriptionTitle: {
			fontSize: 16,
			fontWeight: "700",
			textAlign: "center",
			opacity: 0.7,
		},
		noSubscriptionSubtitle: {
			fontSize: 13,
			fontWeight: "500",
			textAlign: "center",
			opacity: 0.4,
			marginTop: 4,
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
			justifyContent: "space-between",
			gap: 20,
			marginBottom: 30,
		},
		noSubscriptionText: {
			flex: 1,
			fontSize: 13,
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
		noSubContainer: {
			flex: 1,
			flexDirection: "row",
			gap: 8,
			marginTop: 20,
			alignItems: "center",
			borderWidth: 1,
			padding: 12,
			borderRadius: 8,
			borderColor: theme.red.foreground,
		},
	})
}
