import { useEffect, useMemo, useState } from "react"
import { View, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native"
import { useSelector } from "react-redux"
import { useNavigation, NavigationProp } from "@react-navigation/native"
import { useTranslation } from "react-i18next"

import ThemedText from "../../components/ui/ThemedText"
import ThemedIcon from "../../components/ui/ThemedIcon"
import CustomHeader from "../../components/CustomHeader"
import SettingsButton from "../../components/SettingsButton"
import QRCodeModal from "../../components/QRCodeModal"
import QRScannerView from "../../components/QRScannerView"

import { Theme } from "../../utils/theme"
import { moderateScale } from "../../utils/responsive"
import { getMemberById } from "../../lib/firebase/firestore/member"
import { getLockerByUserUid, removeLockerFromUser } from "../../lib/firebase/firestore/lockers"

export default function MemberHomeScreen() {
	const navigation = useNavigation() as NavigationProp<any>
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
				<ThemedIcon
					name="locker"
					size={50}
					color={theme.green.foreground}
				/>
				<ThemedText style={styles.lockerCardLabel}>
					{t("myLocker")}: {locker.id}
				</ThemedText>
			</TouchableOpacity>
		) : (
			<TouchableOpacity
				style={styles.lockerCard}
				onPress={() => {
					setQrLockerModalVisible(true)
				}}
			>
				<ThemedIcon
					name="locker"
					size={50}
				/>
				<ThemedText style={styles.lockerCardLabel}>{t("noActiveLocker")}</ThemedText>
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
					<ThemedIcon
						name="account-circle"
						size={80}
						style={styles.avatarIcon}
					/>
					<ThemedText style={styles.welcomeTitle}>
						{member?.firstName} {member?.lastName}
					</ThemedText>
					<ThemedText style={styles.welcomeSubtitle}>{t("member")}</ThemedText>
				</View>

				{/* QR Code Button */}
				<TouchableOpacity
					style={styles.qrButton}
					activeOpacity={0.7}
					onPress={() => setQrModalVisible(true)}
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

				{/* Quick Info Cards */}
				<View style={styles.quickInfoSection}>
					<TouchableOpacity
						onPress={() => navigation.navigate("MemberSubscriptionsScreen")}
						style={styles.infoCard}
					>
						<ThemedIcon
							name="card-text"
							size={50}
						/>
						<ThemedText style={styles.infoCardLabel}>{t("subscriptions")}</ThemedText>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => navigation.navigate("MemberProfileScreen")}
						style={styles.infoCard}
					>
						<ThemedIcon
							name="account"
							size={50}
						/>
						<ThemedText style={styles.infoCardLabel}>{t("profile")}</ThemedText>
					</TouchableOpacity>
				</View>

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
			paddingBottom: moderateScale(40),
		},
		welcomeSection: {
			alignItems: "center",
			paddingVertical: moderateScale(40),
			paddingHorizontal: moderateScale(20),
		},
		avatarIcon: {
			marginBottom: moderateScale(16),
			opacity: 0.8,
		},
		welcomeTitle: {
			fontSize: 24,
			fontWeight: "700",
			textAlign: "center",
		},
		welcomeSubtitle: {
			fontSize: 14,
			opacity: 0.6,
			marginTop: moderateScale(4),
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
			marginHorizontal: moderateScale(16),
			marginTop: moderateScale(20),
			gap: 12,
		},
		infoCard: {
			flex: 1,
			alignItems: "center",
			padding: moderateScale(20),
			borderRadius: 16,
			backgroundColor: theme.cardBackground,
			borderWidth: 1,
			borderColor: theme.border,
			gap: 10,
		},
		infoCardLabel: {
			fontSize: 15,
			fontWeight: "bold",
			opacity: 0.7,
		},
		lockerCard: {
			flexDirection: "row",
			alignItems: "center",
			padding: moderateScale(20),
			backgroundColor: theme.cardBackground,
			borderRadius: 16,
			marginHorizontal: moderateScale(16),
			borderWidth: 1,
			borderColor: theme.border,
			gap: 10,
			marginTop: 20,
		},
		lockerCardActive: {
			borderColor: theme.green.foreground,
			borderWidth: 1,
		},
		lockerCardLabel: {
			fontSize: 24,
			fontWeight: "bold",
			marginLeft: moderateScale(10),
		},
	})
}
