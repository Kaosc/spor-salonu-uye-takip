import { useEffect, useMemo, useState } from "react"
import { View, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

import ThemedText from "../../components/ui/ThemedText"
import ThemedIcon from "../../components/ui/ThemedIcon"
import CustomHeader from "../../components/CustomHeader"
import SettingsButton from "../../components/SettingsButton"
import QRCodeModal from "../../components/QRCodeModal"
import QRScannerView from "../../components/QRScannerView"
import MemberAvatar from "../../components/MemberAvatar"

import { Theme } from "../../utils/theme"
import { moderateScale } from "../../utils/responsive"
import { getMemberById } from "../../lib/firebase/firestore/member"
import { getLockerByUserUid, removeLockerFromUser } from "../../lib/firebase/firestore/lockers"

export default function MemberHomeScreen() {
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const { uid } = useSelector((state: RootState) => state.auth)
	const { t } = useTranslation()

	const theme = Theme[darkMode ? "dark" : "light"]
	const styles = createStyles(darkMode)

	const [qrModalVisible, setQrModalVisible] = useState(false)
	const [qrLockerModalVisible, setQrLockerModalVisible] = useState(false)

	const [member, setMember] = useState<Member | null>(null)
	const [locker, setLocker] = useState<Locker | null>(null)

	const QrData: CheckIn = useMemo(() => {
		if (!member) return {} as CheckIn

		return {
			memberUid: member.uid,
			firstName: member.firstName,
			lastName: member.lastName,
		} as CheckIn
	}, [member])

	const fetchMember = async () => {
		if (!uid) return

		const member = await getMemberById(uid)
		setMember(member)
	}

	const fetchLocker = async () => {
		if (!uid) return

		const locker = await getLockerByUserUid(uid)
		setLocker(locker)
	}

	useEffect(() => {
		fetchMember()
	}, [])

	useEffect(() => {
		fetchLocker()
	}, [qrLockerModalVisible])

	const statusConfig = useMemo(() => {
		const status = member?.subscriptionStatus
		switch (status) {
			case "ACTIVE":
				return { label: t("active"), color: theme.green.foreground, bg: theme.green.background + "44" }
			case "EXPIRED":
			case "CANCELLED":
				return { label: t("expired"), color: theme.red.foreground, bg: theme.red.background + "44" }
			case "PAUSED":
				return { label: t("paused"), color: theme.orange.foreground, bg: theme.orange.background + "44" }
			default:
				return { label: t("none"), color: theme.border, bg: theme.cardBackground }
		}
	}, [member?.subscriptionStatus, t, theme])

	const handleLockerPress = () => {
		if (!member?.isActive) {
			toast.show(t("memberDeactivated"), { type: "warning", duration: 10000 })
			return
		}

		if (member?.subscriptionStatus !== "ACTIVE") {
			toast.show(t("noActiveSubForLocker"), { type: "warning", duration: 10000 })
			return
		}

		setQrLockerModalVisible(true)
	}

	const LockerCard = () => {
		return locker ? (
			<TouchableOpacity
				onPress={() => {
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
								} catch (e: any) {
									toast.show(e.message, { type: "danger" })
								}
							},
						},
					])
				}}
				style={[styles.lockerCard, styles.lockerCardActive]}
			>
				<View style={styles.lockerCardContent}>
					<ThemedIcon
						name="locker"
						size={40}
						color={theme.green.foreground}
					/>
					<View style={styles.lockerCardTextGroup}>
						<ThemedText style={styles.lockerCardLabel}>{t("lockerNumber")}</ThemedText>
						<ThemedText style={styles.lockerNumberLabel}>#{locker?.id}</ThemedText>
					</View>
				</View>
				<ThemedIcon
					name="chevron-right"
					size={20}
					color={theme.green.foreground}
				/>
			</TouchableOpacity>
		) : (
			<TouchableOpacity
				style={[styles.lockerCard, styles.lockerCardEmpty]}
				activeOpacity={0.7}
				onPress={handleLockerPress}
			>
				<View style={styles.lockerCardEmptyIconRow}>
					<View style={styles.lockerCardEmptyIconBg}>
						<ThemedIcon
							name="qrcode-scan"
							size={28}
						/>
					</View>
				</View>
				<ThemedText style={styles.lockerCardEmptyTitle}>{t("noActiveLocker")}</ThemedText>
				<ThemedText style={styles.lockerCardEmptySubtitle}>{t("tapToScanLocker")}</ThemedText>
			</TouchableOpacity>
		)
	}

	return (
		<View style={styles.container}>
			<CustomHeader
				title={t("home")}
				showBackButton={false}
				rightComponent={<SettingsButton />}
			/>

			<ScrollView
				style={styles.scrollContent}
				contentContainerStyle={styles.scrollContentContainer}
				showsVerticalScrollIndicator={false}
			>
				{/* Welcome Section */}
				<View style={styles.welcomeSection}>
					<MemberAvatar
						gender={member?.gender}
						size={100}
					/>
					<ThemedText style={styles.welcomeTitle}>
						{member?.firstName} {member?.lastName}
					</ThemedText>
					<ThemedText style={styles.welcomeSubtitle}>{t("member")}</ThemedText>
				</View>

				{/* Subscription Status Card */}
				{statusConfig && (
					<View style={[styles.statusCard, { backgroundColor: statusConfig.bg, borderColor: statusConfig.color }]}>
						<View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
						<ThemedText style={styles.statusCardLabel}>{t("subscriptionStatus")}</ThemedText>
						<ThemedText style={[styles.statusCardValue, { color: statusConfig.color }]}>{statusConfig.label}</ThemedText>
					</View>
				)}

				<TouchableOpacity
					style={styles.qrButton}
					activeOpacity={0.7}
					onPress={handleLockerPress}
				>
					<ThemedIcon
						name="qrcode"
						size={50}
					/>
					<ThemedText style={styles.qrButtonText}>{t("showMyQRCode")}</ThemedText>
					<ThemedIcon
						name="chevron-right"
						size={24}
					/>
				</TouchableOpacity>

				<LockerCard />
			</ScrollView>

			{/* QR Code Modal */}
			<QRCodeModal
				data={QrData}
				visible={qrModalVisible}
				onClose={() => setQrModalVisible(false)}
			/>

			{qrLockerModalVisible && (
				<QRScannerView
					action="ASSIGN_LOCKER"
					onClose={() => setQrLockerModalVisible(false)}
				/>
			)}
		</View>
	)
}

const createStyles = (darkMode: boolean) => {
	const theme = Theme[darkMode ? "dark" : "light"]

	return StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: theme.background,
		},
		scrollContent: {
			flex: 1,
		},
		scrollContentContainer: {
			paddingBottom: 40,
			gap: 20,
		},
		welcomeSection: {
			alignItems: "center",
			paddingVertical: 20,
			paddingHorizontal: 20,
			gap: 15,
		},
		avatarIcon: {
			marginBottom: moderateScale(16),
			opacity: 0.8,
		},
		welcomeTitle: {
			fontSize: 28,
			fontWeight: "900",
			textAlign: "center",
		},
		welcomeSubtitle: {
			fontSize: 15,
			fontWeight: "bold",
			opacity: 0.6,
			textAlign: "center",
		},
		qrButton: {
			flexDirection: "row",
			alignItems: "center",
			marginHorizontal: moderateScale(16),
			padding: moderateScale(18),
			borderRadius: 16,
			backgroundColor: theme.cardBackground,
			borderWidth: 1,
			borderColor: theme.border,
			gap: 12,
		},
		qrButtonText: {
			flex: 1,
			fontSize: 18,
			fontWeight: "bold",
		},
		quickInfoSection: {
			flexDirection: "row",
			marginHorizontal: 16,
			gap: 12,
		},
		statusCard: {
			flexDirection: "row",
			alignItems: "center",
			marginHorizontal: moderateScale(16),
			padding: moderateScale(14),
			borderRadius: 12,
			borderWidth: 1,
			marginTop: 4,
			gap: 10,
		},
		statusDot: {
			width: 10,
			height: 10,
			borderRadius: 5,
		},
		statusCardLabel: {
			flex: 1,
			fontSize: 14,
			fontWeight: "600",
			opacity: 0.6,
		},
		statusCardValue: {
			fontSize: 14,
			fontWeight: "800",
		},
		lockerCard: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			padding: 15,
			backgroundColor: theme.cardBackground,
			borderRadius: 16,
			marginHorizontal: moderateScale(16),
			borderWidth: 1,
			borderColor: theme.border,
			gap: 10,
		},
		lockerCardContent: {
			flexDirection: "row",
			alignItems: "center",
			flex: 1,
			gap: 12,
		},
		lockerCardTextGroup: {
			flexDirection: "column",
			gap: 4,
		},
		lockerCardActive: {
			borderColor: theme.green.foreground,
			backgroundColor: theme.green.background + "77",
			borderWidth: 1.5,
		},
		lockerCardLabel: {
			fontSize: 14,
			fontWeight: "600",
			opacity: 0.6,
		},
		lockerNumberLabel: {
			fontSize: 22,
			fontWeight: "900",
			letterSpacing: 1,
			color: theme.green.foreground,
		},
		lockerCardEmpty: {
			flexDirection: "column",
			alignItems: "center",
			justifyContent: "center",
			paddingVertical: 25,
			paddingHorizontal: 15,
			borderStyle: "dashed",
			borderColor: theme.border,
			backgroundColor: theme.cardBackground,
			borderRadius: 16,
			marginHorizontal: moderateScale(16),
			borderWidth: 2,
			gap: 8,
		},
		lockerCardEmptyIconRow: {
			marginBottom: 8,
		},
		lockerCardEmptyIconBg: {
			width: moderateScale(56),
			height: moderateScale(56),
			borderRadius: 28,
			backgroundColor: theme.cardBackground,
			alignItems: "center",
			justifyContent: "center",
			borderWidth: 1.5,
			borderColor: theme.border,
		},
		lockerCardEmptyTitle: {
			fontSize: 18,
			fontWeight: "800",
		},
		lockerCardEmptySubtitle: {
			fontSize: 13,
			fontWeight: "500",
			opacity: 0.5,
			textAlign: "center",
		},
	})
}
