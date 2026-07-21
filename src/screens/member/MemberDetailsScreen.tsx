import { useCallback, useEffect, useRef, useState } from "react"
import { ScrollView, View, TouchableOpacity, StyleSheet, BackHandler, Alert } from "react-native"
import { ParamListBase, RouteProp, useFocusEffect, useNavigation, useRoute } from "@react-navigation/native"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import PagerView from "react-native-pager-view"

import ThemedText from "../../components/ui/ThemedText"
import CustomHeader from "../../components/CustomHeader"
import ThemedIcon from "../../components/ui/ThemedIcon"
import ThemedActivityIndicator from "../../components/ui/ThemedActivityIndicator"
import ThemedButton from "../../components/ui/ThemedButton"
import BMIDisplay from "../../components/BMIDisplay"
import SubscriptionView from "../../components/SubscriptionView"
import MemberAvatar from "../../components/MemberAvatar"
import DetailsRow from "../../components/DetailsRow"

import { activateMember, getMemberById, inactivateMember } from "../../lib/firebase/firestore/member"
import {
	cancelSubscription,
	getSubscriptionsByMemberId,
	pauseSubscription,
	resumeSubscription,
} from "../../lib/firebase/firestore/subscriptions"
import { getLockerByUserUid, removeLockerFromUser } from "../../lib/firebase/firestore/lockers"
import { safeTimestampToDateString, safeTimestampToDateTimeString } from "../../utils/date"
import { Theme } from "../../utils/theme"

import { AllIconNames } from "../../types/icon"

interface RouteParams extends RouteProp<ParamListBase> {
	params: {
		memberId: string
		initialPage?: number
		prevScreen: "SearchScreen" | "SubscriptionsScreen" | "LockerScreen" | "DailyCheckinsScreen" | undefined
		search?: string
		selectedDate?: string
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
	const [lockerStatus, setLockerStatus] = useState<"idle" | "loading" | "error">("idle")

	const [member, setMember] = useState<Member | null>(null)
	const [subscriptions, setSubscriptions] = useState<Subscription[] | null>(null)
	const [locker, setLocker] = useState<Locker | null>(null)
	const [activeSubscription, setActiveSubscription] = useState<Subscription | null>(null)

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
			navigation.navigate("SearchScreen", { search: route?.params?.search })
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

		if (prevScreen === "DailyCheckinsScreen") {
			navigation.goBack()
			return
		}

		navigation.navigate("Tabs", { screen: "MemberStack" })
	}

	const fetchMember = async () => {
		if (!route.params?.memberId) return
		setMemberStatus("loading")
		const member = await getMemberById(route.params?.memberId)
		setMember(member)
		setMemberStatus(member ? "idle" : "error")
	}

	const fetchSubscription = async () => {
		if (!route.params?.memberId) return
		setSubscriptionStatus("loading")
		const subscriptions = await getSubscriptionsByMemberId(route.params?.memberId)

		if (subscriptions.length > 0) {
			// find active subscription and set it to state
			const activeSubscription = subscriptions.find((sub) => sub.status === "ACTIVE" || sub.status === "PAUSED")

			if (activeSubscription) {
				setActiveSubscription(activeSubscription)
			} else {
				setActiveSubscription(null)
			}

			const otherSubscriptions = subscriptions.filter((sub) => sub.id !== activeSubscription?.id)
			setSubscriptions(otherSubscriptions)
		} else {
			setSubscriptions(null)
		}

		setSubscriptionStatus(subscriptions.length > 0 ? "idle" : "error")
	}

	const fetchLocker = async () => {
		if (!route.params?.memberId) return
		setLockerStatus("loading")

		try {
			const lockerData = await getLockerByUserUid(route.params?.memberId)
			setLocker(lockerData)
			setLockerStatus(lockerData ? "idle" : "error")
		} catch (e) {
			setLockerStatus("error")
		}
	}

	useFocusEffect(
		useCallback(() => {
			fetchMember()
			fetchSubscription()
			fetchLocker()
		}, [route.params?.memberId]),
	)

	const handleSubCancel = async (alert = true) => {
		const cancelSub = async () => {
			if (!activeSubscription?.id) return
			const canceled = await cancelSubscription(activeSubscription.id)

			if (canceled) {
				toast.show(t("subscriptionCancelled"), { type: "success" })
				setTimeout(() => {
					fetchSubscription()
				}, 500)
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
		if (activeSubscription && (activeSubscription.status === "ACTIVE" || activeSubscription.status === "PAUSED")) {
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

	const handleEmptyLocker = async () => {
		if (!locker?.id) return

		Alert.alert(t("removeLockerTitle"), t("removeLockerMessage"), [
			{
				text: t("cancel"),
				style: "cancel",
			},
			{
				text: t("remove"),
				style: "destructive",
				onPress: async () => {
					try {
						await removeLockerFromUser(locker.id)
						setLocker(null)
						toast.show(t("locker_removed_success"), { type: "success" })
					} catch (e) {
						console.error("[MemberDetailsScreen] handleEmptyLocker:", e)
						toast.show(t("locker_assignment_error"), { type: "danger" })
					}
				},
			},
		])
	}

	const LockerView = () => {
		if (lockerStatus === "loading") {
			return (
				<View style={{ padding: 40, alignItems: "center" }}>
					<ThemedActivityIndicator size={50} />
				</View>
			)
		}

		if (locker) {
			return (
				<View style={styles.lockerCard}>
					<View style={styles.lockerIconContainer}>
						<ThemedIcon
							name="locker"
							size={50}
							color={darkMode ? "#fff" : "#000"}
						/>
					</View>
					<ThemedText style={styles.lockerTitle}>{t("lockerNumber")}</ThemedText>
					<View style={styles.lockerNumberBadge}>
						<ThemedText style={styles.lockerNumberText}>#{locker.id}</ThemedText>
					</View>
					<ThemedButton
						style={styles.emptyLockerButton}
						onPress={handleEmptyLocker}
					>
						<ThemedText style={styles.emptyLockerButtonText}>{t("remove")}</ThemedText>
					</ThemedButton>
				</View>
			)
		}

		return (
			<View style={styles.noLockerCard}>
				<ThemedIcon
					name="locker"
					size={60}
					color={theme.text}
					style={{ opacity: 0.3, alignSelf: "center", marginBottom: 12 }}
				/>
				<ThemedText style={styles.noLockerTitle}>{t("noActiveLocker")}</ThemedText>
			</View>
		)
	}

	const SubscriptionDetails = useCallback(() => {
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
	}, [member?.isActive, subscriptions, activeSubscription, subscriptionStatus, darkMode])

	const MemberDetails = useCallback(
		({ member }: { member: Member }) => {
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

					<View style={styles.avatarContainer}>
						<MemberAvatar
							gender={member.gender}
							size={110}
						/>
					</View>

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
						value={t(member.gender) || "-"}
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
						iconName="phone"
					/>
				</View>
			)
		},
		[member, darkMode],
	)

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
			<View style={styles.tabBarContent}>
				<TabButton
					label={t("member")}
					iconName="account"
					pageIndex={0}
				/>
				<TabButton
					label={t("subscription")}
					iconName="card-text"
					pageIndex={1}
				/>
				<TabButton
					label={t("locker")}
					iconName="locker"
					pageIndex={2}
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
					memberStatus === "error" || !member && (
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
						<ScrollView
							key="3"
							style={{ flex: 1 }}
							contentContainerStyle={styles.pageContent}
							showsVerticalScrollIndicator={false}
						>
							<View style={styles.memberInfoCard}>
								<ThemedIcon
									name="account"
									size={20}
									style={styles.memberInfoIcon}
								/>
								<View style={styles.memberInfoTextContainer}>
									<ThemedText style={styles.memberInfoName}>
										{member.firstName} {member.lastName}
									</ThemedText>
									<ThemedText style={styles.memberInfoPhone}>
										{member.phoneNumber || "-"}
									</ThemedText>
								</View>
							</View>
							<LockerView />
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
			flexGrow: 0,
			marginHorizontal: 10,
		},
		tabBarContent: {
			flexDirection: "row",
			paddingBottom: 10,
			gap: 8,
			marginHorizontal: 8,
		},
		tab: {
			flex: 1,
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			gap: 6,
			paddingVertical: 10,
			paddingHorizontal: 10,
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
			fontSize: 15,
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
		// Locker styles
		lockerCard: {
			backgroundColor: theme.cardBackground,
			borderWidth: StyleSheet.hairlineWidth,
			borderColor: theme.border,
			borderRadius: 12,
			padding: 30,
			alignItems: "center",
			marginTop: 20,
		},
		lockerIconContainer: {
			width: 90,
			height: 90,
			borderRadius: 45,
			backgroundColor: darkMode ? "#1a1a1a" : "#f0f0f0",
			alignItems: "center",
			justifyContent: "center",
			marginBottom: 16,
		},
		lockerTitle: {
			fontSize: 18,
			fontWeight: "700",
			marginBottom: 16,
		},
		lockerNumberBadge: {
			backgroundColor: darkMode ? "#fff" : "#000",
			paddingHorizontal: 24,
			paddingVertical: 10,
			borderRadius: 30,
			marginBottom: 24,
		},
		lockerNumberText: {
			fontSize: 20,
			fontWeight: "800",
			color: darkMode ? "#000" : "#fff",
		},
		emptyLockerButton: {
			backgroundColor: theme.red.background,
			paddingVertical: 14,
			paddingHorizontal: 40,
			alignItems: "center",
			borderWidth: 1,
			borderColor: theme.red.foreground,
			borderRadius: 12,
		},
		emptyLockerButtonText: {
			color: theme.red.foreground,
			fontSize: 16,
			fontWeight: "bold",
		},
		noLockerCard: {
			alignItems: "center",
			paddingVertical: 60,
		},
		noLockerTitle: {
			fontSize: 16,
			fontWeight: "700",
			textAlign: "center",
			opacity: 0.7,
		},
		avatarContainer: { alignItems: "center", justifyContent: "center", marginBottom: 15 },
		// Member info card (locker page)
		memberInfoCard: {
			backgroundColor: theme.cardBackground,
			borderWidth: StyleSheet.hairlineWidth,
			borderColor: theme.border,
			borderRadius: 12,
			padding: 16,
			flexDirection: "row",
			alignItems: "center",
			marginTop: 20,
			marginBottom: 4,
		},
		memberInfoIcon: {
			marginRight: 14,
		},
		memberInfoTextContainer: {
			flex: 1,
		},
		memberInfoName: {
			fontSize: 17,
			fontWeight: "700",
		},
		memberInfoPhone: {
			fontSize: 14,
			opacity: 0.6,
			marginTop: 2,
		},
	})
}
