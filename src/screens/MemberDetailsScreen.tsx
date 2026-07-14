import { useEffect, useMemo, useRef, useState } from "react"
import { ScrollView, View, TouchableOpacity, StyleSheet, BackHandler, Alert } from "react-native"
import { ParamListBase, RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import PagerView from "react-native-pager-view"

import ThemedText from "../components/ui/ThemedText"
import CustomHeader from "../components/CustomHeader"
import ThemedIcon from "../components/ui/ThemedIcon"
import ThemedActivityIndicator from "../components/ui/ThemedActivityIndicator"
import ThemedButton from "../components/ui/ThemedButton"
import BMIDisplay from "../components/BMIDisplay"

import { activateMember, getMemberById, inactivateMember } from "../lib/firebase/firestore/member"
import {
	cancelSubscription,
	getSubscriptionsByMemberId,
	pauseSubscription,
	resumeSubscription,
} from "../lib/firebase/firestore/subscriptions"
import { safeTimestampToDateString, safeTimestampToDateTimeString } from "../utils/date"
import { Theme } from "../utils/theme"

import { AllIconNames } from "../types/icon"
import SubscriptionView from "../components/SubscriptionView"

interface RouteParams extends RouteProp<ParamListBase> {
	params: {
		memberId: string
		initialPage?: number
		prevScreen: "SearchScreen" | "SubscriptionsScreen" | "LockerScreen" | undefined
	}
}

export default function MemberDetailsScreen() {
	const navigation = useNavigation<any>()
	const route = useRoute<RouteParams>()
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const { t } = useTranslation()

	const styles = createStyles(darkMode)
	const theme = Theme[darkMode ? "dark" : "light"]

	const [activePage, setActivePage] = useState(route.params?.initialPage || 0)
	const pagerRef = useRef<PagerView>(null)

	const [memberStatus, setMemberStatus] = useState<"idle" | "loading" | "error">("idle")
	const [subscriptionStatus, setSubscriptionStatus] = useState<"idle" | "loading" | "error">("idle")

	const [member, setMember] = useState<Member | null>(null)
	const [subscriptions, setSubscriptions] = useState<Subscription[] | null>(null)
	const [activeSubscription, setActiveSubscription] = useState<Subscription | null>(null)

	const totalSubscriptions = useMemo(() => subscriptions?.length || 0, [subscriptions])

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

		if (prevScreen === "LockerScreen") {
			navigation.navigate("Tabs", { screen: "LockerScreen" })
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
		const subscriptions = await getSubscriptionsByMemberId(route.params?.memberId)

		if (subscriptions.length > 0) {
			// find active subscription and set it to state
			const activeSubscription = subscriptions.find((sub) => sub.status === "ACTIVE" || sub.status === "PAUSED")
			if (activeSubscription) {
				setActiveSubscription(activeSubscription)
			}

			const otherSubscriptions = subscriptions.filter((sub) => sub.id !== activeSubscription?.id)
			setSubscriptions(otherSubscriptions)
		}

		clearTimeout(t)
		setSubscriptionStatus(subscriptions.length > 0 ? "idle" : "error")
	}

	useEffect(() => {
		fetchMember()
		fetchSubscription()
	}, [route.params?.memberId])

	const handleSubCancel = async (alert = true) => {
		const cancelSub = async () => {
			if (!activeSubscription?.id) return
			const canceled = await cancelSubscription(activeSubscription.id)

			if (canceled) {
				toast.show(t("subscriptionCancelled"), { type: "success" })
				fetchSubscription()
			} else {
				toast.show(t("subscriptionCancelError"), { type: "danger" })
			}
		}

		if (alert) {
			Alert.alert(t("cancelSubscription"), t("cancelSubscriptionConfirmation"), [
				{
					text: t("cancel"),
					style: "cancel",
				},
				{
					text: t("cancelSubscription"),
					style: "destructive",
					onPress: async () => await cancelSub(),
				},
			])
		} else {
			await cancelSub()
		}
	}

	const handleInactivateMember = async () => {
		const inactivate = async () => {
			const succes = await inactivateMember(route.params?.memberId)
			if (succes) {
				toast.show(t("memberInactivated"), { type: "success" })
				setMember((prev) => (prev ? { ...prev, isActive: false } : prev))
			}
		}

		// If the member has an active subscription, show a warning alert to the user that the subscription will be cancelled if they inactivate the member.
		if (activeSubscription && activeSubscription.status === "ACTIVE") {
			Alert.alert(t("inactivateMember"), t("inactivateMemberWithActiveSubscriptionConfirmation"), [
				{
					text: t("cancel"),
					style: "cancel",
				},
				{
					text: t("inactivate"),
					style: "destructive",
					onPress: async () => {
						await handleSubCancel(false)
						await inactivate()
					},
				},
			])
		} else {
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

	const handleSubPause = async () => {
		const pauseSub = async () => {
			if (!activeSubscription?.id) return
			const paused = await pauseSubscription(activeSubscription.id)
			if (paused) {
				toast.show(t("subscriptionPaused"), { type: "success" })
				fetchSubscription()
			} else {
				toast.show(t("subscriptionPauseError"), { type: "error" })
			}
		}

		Alert.alert(t("pauseSubscription"), t("pauseSubscriptionConfirmation"), [
			{
				text: t("cancel"),
				style: "cancel",
			},
			{
				text: t("pauseSubscription"),
				style: "default",
				onPress: async () => await pauseSub(),
			},
		])
	}

	const handleSubResume = async () => {
		const resumeSub = async () => {
			if (!activeSubscription?.id) return
			const resumed = await resumeSubscription(activeSubscription.id)
			if (resumed) {
				toast.show(t("subscriptionResumed"), { type: "success" })
				fetchSubscription()
			} else {
				toast.show(t("subscriptionResumeError"), { type: "error" })
			}
		}

		Alert.alert(t("resumeSubscription"), t("resumeSubscriptionConfirmation"), [
			{
				text: t("cancel"),
				style: "cancel",
			},
			{
				text: t("resumeSubscription"),
				style: "default",
				onPress: async () => await resumeSub(),
			},
		])
	}

	const SubscriptionDetails = () => {
		const PauseToggleButton = () => {
			if (activeSubscription && activeSubscription.status === "PAUSED") {
				return (
					<ThemedButton
						style={styles.pauseToggleButton}
						onPress={() => handleSubResume()}
					>
						<ThemedText style={styles.pauseButtonText}>{t("resumeSubscription")}</ThemedText>
					</ThemedButton>
				)
			} else if (activeSubscription && activeSubscription.status === "ACTIVE") {
				return (
					<ThemedButton
						style={styles.pauseToggleButton}
						onPress={() => handleSubPause()}
					>
						<ThemedText style={styles.pauseButtonText}>{t("pauseSubscription")}</ThemedText>
					</ThemedButton>
				)
			}
		}

		const CancelSubscriptionButton = () => {
			if (!activeSubscription || activeSubscription.status !== "ACTIVE") return <></>

			return (
				<ThemedButton
					style={styles.cancelSubscriptionButton}
					onPress={() => handleSubCancel()}
				>
					<ThemedText style={styles.cancelSubscriptionButtonText}>{t("cancelSubscription")}</ThemedText>
				</ThemedButton>
			)
		}

		const SellPackageButton = () => {
			return (
				<ThemedButton
					style={styles.sellPackageButton}
					onPress={() => {
						navigation.navigate("Tabs", {
							screen: "MemberStack",
							params: {
								screen: "SubscriptionFormScreen",
								params: {
									member: member,
									activeSubscriptionId: activeSubscription?.id || false,
								},
							},
						})
					}}
				>
					<ThemedText style={styles.sellPackageButtonText}>{t("sellPackage")}</ThemedText>
				</ThemedButton>
			)
		}

		const ActionButtonsView = () => {
			return member?.isActive ? (
				<View style={styles.subButtonsContainer}>
					<PauseToggleButton />
					<CancelSubscriptionButton />
					<SellPackageButton />
				</View>
			) : (
				<View style={styles.noSubContainer}>
					<ThemedIcon
						name="alert"
						size={23}
						color={darkMode ? Theme.dark.red.foreground : Theme.light.red.foreground}
					/>
					<ThemedText style={styles.noSubscriptionText}>{t("memberIsInactive")}</ThemedText>
				</View>
			)
		}

		return (
			<View>
				{subscriptionStatus === "loading" ? (
					<View style={{ padding: 40, alignItems: "center" }}>
						<ThemedActivityIndicator size={50} />
					</View>
				) : subscriptions ? (
					<View style={{ gap: 25 }}>
						{/* CURRENTLY ACTIVE OR PAUSED SUBSCRIPTION */}
						<View style={styles.card}>
							{activeSubscription && <SubscriptionView subscription={activeSubscription} />}
							<ActionButtonsView />
						</View>
						{/* PREVIOUS SUBSCRIPTIONS (CANCELED OR EXPIRED) */}
						{subscriptions.length > 0 ? (
							<>
								<View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
									<ThemedIcon
										name="history"
										size={30}
										style={{ marginTop: 2.5 }}
									/>
									<ThemedText style={styles.sectionTitle}>{t("previousSubscriptions")}</ThemedText>
								</View>
								{subscriptions.map((sub) => (
									<View
										style={styles.card}
										key={sub.id}
									>
										<SubscriptionView
											key={sub.id}
											subscription={sub}
										/>
									</View>
								))}
							</>
						) : (
							<></>
						)}
					</View>
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

						<ActionButtonsView />
					</>
				)}
			</View>
		)
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

				{/* Body Metrics Card */}
				<View style={styles.bodyMetricsContainer}>
					<View style={styles.bodyMetricsRow}>
						<View style={styles.bodyMetricItem}>
							<ThemedIcon
								name="scale-bathroom"
								size={18}
							/>
							<ThemedText style={styles.bodyMetricLabel}>{t("weight")}</ThemedText>
							<ThemedText style={styles.bodyMetricValue}>{member.weight ? `${member.weight} kg` : "-"}</ThemedText>
						</View>
						<View style={styles.bodyMetricItem}>
							<ThemedIcon
								name="human-male-height"
								size={18}
							/>
							<ThemedText style={styles.bodyMetricLabel}>{t("height")}</ThemedText>
							<ThemedText style={styles.bodyMetricValue}>{member.height ? `${member.height} cm` : "-"}</ThemedText>
						</View>
					</View>

					{member.weight && member.height && member.height > 0 && (
						<BMIDisplay
							weight={member.weight}
							height={member.height}
						/>
					)}
				</View>

				<DetailsRow
					label={t("lockerNumber")}
					value={member.lockerNumber?.toString() || "-"}
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
		const TabButton = ({ label, iconName, pageIndex }: { label: string; iconName: AllIconNames; pageIndex: number }) => {
			const isActive = activePage === pageIndex

			return (
				<TouchableOpacity
					style={[styles.tab, isActive && styles.tabActive]}
					onPress={() => {
						setActivePage(pageIndex)
						pagerRef.current?.setPage(pageIndex)
					}}
				>
					<ThemedIcon
						name={iconName}
						size={16}
						color={isActive ? (darkMode ? "#000" : "#fff") : undefined}
					/>
					<ThemedText style={[styles.tabText, isActive && styles.tabTextActive]}>{label}</ThemedText>
				</TouchableOpacity>
			)
		}

		return (
			<View style={styles.tabBar}>
				<TabButton
					label={t("memberDetails")}
					iconName="account"
					pageIndex={0}
				/>
				<TabButton
					label={t("subscriptionInfo")}
					iconName="card-text"
					pageIndex={1}
				/>
			</View>
		)
	}

	const MemberNotFoundView = () => {
		return (
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
		)
	}

	return (
		<View style={styles.container}>
			<CustomHeader
				title={t("memberDetails")}
				onBackPress={goBack}
			/>
			{!member ? (
				<MemberNotFoundView />
			) : (
				<>
					{/* Tab Bar */}
					<TabBar />
					<PagerView
						ref={pagerRef}
						style={{ flex: 1 }}
						initialPage={route.params?.initialPage || 0}
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
			paddingHorizontal: 9,
		},
		card: {
			backgroundColor: theme.cardBackground,
			borderWidth: StyleSheet.hairlineWidth,
			borderColor: theme.border,
			borderRadius: 12,
			padding: 20,
		},
		subParentCard: {
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
			marginVertical: 15,
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
			fontSize: 20,
			fontWeight: "bold",
			marginBottom: 8,
			marginTop: 13,
		},
		row: {
			flexDirection: "row",
			justifyContent: "space-between",
			paddingVertical: 12,
			borderBottomWidth: StyleSheet.hairlineWidth,
			borderBottomColor: theme.border,
		},
		rowLabel: {
			flex: 1,
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
			flex: 1,
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
			alignItems: "center",
			borderWidth: 1,
			padding: 12,
			borderRadius: 8,
			borderColor: theme.red.foreground,
		},
		subButtonsContainer: {
			gap: 10,
		},
		cancelSubscriptionButton: {
			backgroundColor: theme.red.background,
			paddingVertical: 14,
			alignItems: "center",
			borderWidth: 1,
			borderColor: theme.red.foreground,
		},
		cancelSubscriptionButtonText: {
			color: theme.red.foreground,
			fontSize: 16,
			fontWeight: "bold",
		},
		// Body Metrics
		bodyMetricsContainer: {
			marginTop: 16,
			marginBottom: 8,
			paddingVertical: 16,
			paddingHorizontal: 12,
			borderWidth: StyleSheet.hairlineWidth,
			borderColor: theme.border,
			borderRadius: 8,
			backgroundColor: darkMode ? "#111" : "#f8f8f8",
		},
		bodyMetricsRow: {
			flexDirection: "row",
			justifyContent: "space-around",
		},
		bodyMetricItem: {
			alignItems: "center",
			gap: 4,
		},
		bodyMetricLabel: {
			fontSize: 12,
			opacity: 0.6,
			fontWeight: "600",
		},
		bodyMetricValue: {
			fontSize: 16,
			fontWeight: "700",
		},
		pauseToggleButton: {
			backgroundColor: theme.orange.background,
			paddingVertical: 14,
			alignItems: "center",
			borderWidth: 1,
			borderColor: theme.orange.foreground,
		},
		pauseButtonText: {
			color: theme.orange.foreground,
			fontSize: 16,
			fontWeight: "bold",
		},
	})
}
